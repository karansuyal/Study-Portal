"""
Auth routes: login, register, Google OAuth, profile, email verification.

Fix applied here: /api/auth/login and /api/auth/register are now rate-limited
via @limiter.limit(...). Before this, there was zero protection against
someone hammering the login endpoint to brute-force a password, or spamming
fake registrations. "5 per minute" on login is generous enough for a real
user who mistypes their password a couple times, but stops automated
attacks cold. Adjust the numbers if they feel too strict/loose in practice.
"""

import json
import secrets
import traceback
from datetime import datetime, timezone
from urllib.parse import quote

from flask import Blueprint, request, jsonify, redirect, url_for
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from extensions import db, oauth, limiter
from models import User
from email_service import send_verification_email, send_password_reset_email

# No url_prefix here on purpose: the original app had /api/auth/... for most
# auth routes but /api/verify-email (no /auth/) for email verification.
# Using explicit full paths below keeps every URL byte-for-byte identical to
# before, so the deployed frontend and the verification emails already sent
# out keep working without any frontend changes.
auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/api/auth/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    try:
        data = request.get_json()
        if not data.get('email') or not data.get('password'):
            return jsonify({'success': False, 'error': 'Email and password required'}), 400

        user = User.query.filter_by(email=data['email']).first()

        if not user or not user.check_password(data['password']):
            return jsonify({'success': False, 'error': 'Invalid credentials'}), 401

        if not user.is_verified:
            return jsonify({
                'success': False,
                'error': 'Please verify your email first',
                'needs_verification': True,
                'email': user.email
            }), 403

        token = create_access_token(identity=str(user.id))
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': token
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@auth_bp.route('/api/auth/register', methods=['POST'])
@limiter.limit("3 per hour")
def register():
    try:
        data = request.get_json()
        print(f"📥 Registration data: {data}")

        required = ['name', 'email', 'password', 'branch', 'semester']
        for field in required:
            if not data.get(field):
                return jsonify({'success': False, 'error': f'{field} required'}), 400

        existing_user = db.session.execute(
            db.select(User).filter_by(email=data['email'])
        ).scalar_one_or_none()

        if existing_user:
            return jsonify({'success': False, 'error': 'Email already exists'}), 409

        user = User(
            name=data['name'],
            email=data['email'],
            branch=data['branch'],
            semester=int(data['semester']),
            role=data.get('role', 'student'),
            is_verified=True  # ← DIRECT REGISTRATION
        )
        user.set_password(data['password'])

        token = user.generate_verification_token()
        print(f"🔑 Generated token: {token}")

        db.session.add(user)
        db.session.commit()
        print(f"User saved with ID: {user.id}")

        return jsonify({
            'success': True,
            'message': 'Registration successful! You can now login.',
            'user': user.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"ERROR in register: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@auth_bp.route('/api/auth/google')
def google_login():
    try:
        redirect_uri = url_for('auth.google_callback', _external=True)
        print(f"🔐 Google login redirect URI: {redirect_uri}")
        return oauth.google.authorize_redirect(redirect_uri)
    except Exception as e:
        print(f"❌ Google login error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@auth_bp.route('/api/auth/google/callback')
def google_callback():
    try:
        oauth.google.authorize_access_token()

        resp = oauth.google.get('https://www.googleapis.com/oauth2/v3/userinfo')
        user_info = resp.json()

        email = user_info.get('email')
        name = user_info.get('name', email.split('@')[0])

        print(f" Google user: {email}")

        user = User.query.filter_by(email=email).first()

        if not user:
            user = User(
                name=name,
                email=email,
                branch='General',
                semester=1,
                role='student',
                is_verified=True,
                password=''
            )
            user.set_password('google_auth_' + secrets.token_urlsafe(16))
            db.session.add(user)
            db.session.commit()
            print(f"New user created: {email}")

        access_token = create_access_token(identity=str(user.id))

        user_json = json.dumps(user.to_dict())
        encoded_user = quote(user_json)

        import os
        frontend_url = os.environ.get('FRONTEND_URL', 'https://study-portal-app.vercel.app')
        redirect_url = f'{frontend_url}/auth/callback?token={access_token}&user={encoded_user}'

        return redirect(redirect_url)

    except Exception as e:
        print(f" Error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/api/auth/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = db.session.get(User, int(user_id))

        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        return jsonify({'success': True, 'user': user.to_dict()})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@auth_bp.route('/api/verify-email', methods=['GET'])
def verify_email_route():
    try:
        token = request.args.get('token')

        if not token:
            return jsonify({'success': False, 'error': 'No token provided'}), 400

        print(f"🔍 Verifying token: {token}")

        user = User.query.filter_by(verification_token=token).first()

        if not user:
            return jsonify({'success': False, 'error': 'Invalid token'}), 400

        current_time = datetime.now(timezone.utc)

        if user.verification_token_expiry.tzinfo is None:
            expiry = user.verification_token_expiry.replace(tzinfo=timezone.utc)
        else:
            expiry = user.verification_token_expiry

        if expiry < current_time:
            return jsonify({'success': False, 'error': 'Token expired'}), 400

        user.is_verified = True
        user.verification_token = None
        user.verification_token_expiry = None
        db.session.commit()

        print(f" User {user.email} verified successfully")

        return jsonify({'success': True, 'message': 'Email verified successfully! You can now login.'})

    except Exception as e:
        print(f" Verification error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
