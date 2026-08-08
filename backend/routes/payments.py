"""
Premium Notes payments.

Two ways a student can pay for a premium note, both landing in the same
`purchases` table:

  1. upi_manual — pay to the owner's personal UPI ID via a dynamically
     generated QR (amount + order ref baked in), then submit a UTR/
     transaction reference. Status stays 'pending' until an admin approves
     it from the admin panel (see routes/admin.py). There is NO endpoint
     anywhere that lets a student flip their own purchase to 'approved' —
     that is the whole point of this flow's security model.

  2. razorpay — pay through Razorpay Checkout. The backend verifies the
     payment signature server-side using the key SECRET (never exposed to
     the frontend) before approving. A webhook endpoint provides a second,
     independent confirmation path in case the browser closes before the
     client-side verify call fires.

SECURITY NOTES (read before changing this file):
  - Every route that touches a specific purchase checks purchase.user_id ==
    current user, so one student can never view/modify another's order.
  - upi_manual purchases are NEVER auto-approved by anything in this file.
  - razorpay purchases are ONLY approved after HMAC signature verification
    (verify() below) succeeds — the client's word that "payment succeeded"
    is never trusted on its own.
"""

import os
import traceback
from datetime import datetime, timezone

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..extensions import db, limiter
from ..models import User, Note, Purchase
from ..decorators import get_current_user_optional
from ..utils import build_upi_uri, generate_qr_data_uri, allowed_file

payments_bp = Blueprint('payments', __name__, url_prefix='/api/payments')


def _get_razorpay_client():
    """Returns a configured razorpay.Client, or None if keys aren't set."""
    key_id = current_app.config.get('RAZORPAY_KEY_ID')
    key_secret = current_app.config.get('RAZORPAY_KEY_SECRET')
    if not key_id or not key_secret:
        return None
    import razorpay
    return razorpay.Client(auth=(key_id, key_secret))


def _find_reusable_pending_order(user_id, note_id, method):
    """
    If the student already has a pending order for this exact note+method
    from the last hour, reuse it instead of creating a fresh row every time
    they open the payment modal (e.g. on a page refresh).
    """
    cutoff = datetime.now(timezone.utc).timestamp() - 3600
    existing = db.session.execute(
        db.select(Purchase)
        .filter_by(user_id=user_id, note_id=note_id, method=method, status='pending')
        .order_by(Purchase.created_at.desc())
    ).scalars().first()
    if existing and existing.created_at and existing.created_at.timestamp() > cutoff:
        return existing
    return None


@payments_bp.route('/orders', methods=['POST'])
@jwt_required()
@limiter.limit("15 per hour")
def create_order():
    try:
        user_id = get_jwt_identity()
        user = db.session.get(User, int(user_id))
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        data = request.get_json(silent=True) or {}
        note_id = data.get('note_id')
        method = data.get('method')

        if method not in ('upi_manual', 'razorpay'):
            return jsonify({'success': False, 'error': "method must be 'upi_manual' or 'razorpay'"}), 400

        note = db.session.get(Note, int(note_id)) if note_id else None
        if not note:
            return jsonify({'success': False, 'error': 'Note not found'}), 404
        if not note.is_premium or note.price <= 0:
            return jsonify({'success': False, 'error': 'This note is not a paid premium note'}), 400
        if note.status != 'approved':
            return jsonify({'success': False, 'error': 'Note is not available'}), 400

        # Already unlocked? No need for a new order.
        if note.has_access(user):
            return jsonify({'success': False, 'error': 'You already have access to this note'}), 409

        reused = _find_reusable_pending_order(user.id, note.id, method)
        purchase = reused or Purchase(
            user_id=user.id, note_id=note.id, amount=note.price, method=method, status='pending'
        )
        if not reused:
            db.session.add(purchase)
        db.session.flush()  # assigns purchase.id without committing yet

        if method == 'upi_manual':
            upi_id = current_app.config.get('UPI_ID')
            payee_name = current_app.config.get('UPI_PAYEE_NAME', 'Study Portal')
            if not upi_id:
                db.session.rollback()
                return jsonify({'success': False, 'error': 'UPI payments are not configured yet'}), 503

            static_qr = current_app.config.get('STATIC_QR_IMAGE_URL')
            transaction_ref = f"SP{purchase.id}"
            upi_uri = build_upi_uri(upi_id, payee_name, note.price / 100, transaction_ref, note.title)

            db.session.commit()

            return jsonify({
                'success': True,
                'purchase': purchase.to_dict(),
                'payment': {
                    'method': 'upi_manual',
                    'upi_id': upi_id,
                    'payee_name': payee_name,
                    'amount_rupees': note.price / 100,
                    'upi_uri': upi_uri,
                    # Prefer a dynamic QR (amount pre-filled, per-order
                    # traceable). Falls back to a static QR image URL if
                    # STATIC_QR_IMAGE_URL is set in the environment instead.
                    'qr_image': static_qr or generate_qr_data_uri(upi_uri),
                    'transaction_ref': transaction_ref,
                    'instructions': (
                        'Scan the QR or tap "Pay via UPI app", complete the payment, '
                        'then enter the UTR / Reference number shown in your UPI app '
                        'below and submit. Access unlocks after admin review (usually within a few hours).'
                    )
                }
            }), 201

        # ---- razorpay ----
        client = _get_razorpay_client()
        if not client:
            db.session.rollback()
            return jsonify({'success': False, 'error': 'Card/UPI auto-payment is not configured yet'}), 503

        if not purchase.razorpay_order_id:
            rp_order = client.order.create({
                'amount': note.price,  # paise
                'currency': 'INR',
                'receipt': f'purchase_{purchase.id}',
                'notes': {'note_id': str(note.id), 'user_id': str(user.id), 'purchase_id': str(purchase.id)}
            })
            purchase.razorpay_order_id = rp_order['id']

        db.session.commit()

        return jsonify({
            'success': True,
            'purchase': purchase.to_dict(),
            'payment': {
                'method': 'razorpay',
                'key_id': current_app.config.get('RAZORPAY_KEY_ID'),
                'order_id': purchase.razorpay_order_id,
                'amount': note.price,
                'currency': 'INR',
                'name': 'Study Portal',
                'description': note.title,
                'prefill': {'name': user.name, 'email': user.email},
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f" Create order error: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@payments_bp.route('/orders/<int:purchase_id>/proof', methods=['POST'])
@jwt_required()
@limiter.limit("20 per hour")
def submit_proof(purchase_id):
    """
    Student submits their UTR/reference number (and optionally a payment
    screenshot) for a upi_manual order. This NEVER changes purchase.status —
    it stays 'pending' and now shows up in the admin panel's review queue.
    """
    try:
        user_id = get_jwt_identity()
        purchase = db.session.get(Purchase, purchase_id)

        if not purchase or purchase.user_id != int(user_id):
            return jsonify({'success': False, 'error': 'Order not found'}), 404
        if purchase.method != 'upi_manual':
            return jsonify({'success': False, 'error': 'This order does not use manual UPI verification'}), 400
        if purchase.status != 'pending':
            return jsonify({'success': False, 'error': f'This order was already {purchase.status}'}), 400

        utr = (request.form.get('utr_reference') or (request.get_json(silent=True) or {}).get('utr_reference') or '').strip()
        if not utr or len(utr) < 4:
            return jsonify({'success': False, 'error': 'A valid UPI Transaction ID is required'}), 400

        purchase.utr_reference = utr

        proof_file = request.files.get('proof')
        if proof_file and proof_file.filename:
            if not allowed_file(proof_file.filename):
                return jsonify({'success': False, 'error': 'Screenshot must be jpg, jpeg or png'}), 400
            import cloudinary.uploader
            upload_result = cloudinary.uploader.upload(
                proof_file,
                folder=f"study_portal/payment_proofs/{purchase.note_id}",
                resource_type="image",
                type="upload",
            )
            purchase.proof_url = upload_result['secure_url']

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Submitted for review — you will get access once an admin approves it.',
            'purchase': purchase.to_dict()
        })

    except Exception as e:
        db.session.rollback()
        print(f" Submit proof error: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@payments_bp.route('/razorpay/verify', methods=['POST'])
@jwt_required()
@limiter.limit("30 per hour")
def verify_razorpay_payment():
    try:
        user_id = get_jwt_identity()
        data = request.get_json(silent=True) or {}

        order_id = data.get('razorpay_order_id')
        payment_id = data.get('razorpay_payment_id')
        signature = data.get('razorpay_signature')
        if not (order_id and payment_id and signature):
            return jsonify({'success': False, 'error': 'Missing Razorpay payment fields'}), 400

        purchase = db.session.execute(
            db.select(Purchase).filter_by(razorpay_order_id=order_id, user_id=int(user_id))
        ).scalar_one_or_none()
        if not purchase:
            return jsonify({'success': False, 'error': 'Order not found'}), 404
        if purchase.status == 'approved':
            return jsonify({'success': True, 'message': 'Already unlocked', 'purchase': purchase.to_dict()})
        if purchase.status == 'rejected':
            return jsonify({'success': False, 'error': 'This order was rejected, start a new one'}), 400

        client = _get_razorpay_client()
        if not client:
            return jsonify({'success': False, 'error': 'Payments are not configured'}), 503

        # THE critical security check: this raises SignatureVerificationError
        # if the signature doesn't match what our key secret would produce
        # for this order_id + payment_id — i.e. it proves Razorpay actually
        # processed this payment, rather than trusting the browser's say-so.
        try:
            client.utility.verify_payment_signature({
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature,
            })
        except Exception:
            return jsonify({'success': False, 'error': 'Payment verification failed'}), 400

        purchase.status = 'approved'
        purchase.razorpay_payment_id = payment_id
        purchase.razorpay_signature = signature
        purchase.reviewed_at = datetime.now(timezone.utc)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Payment verified — note unlocked!', 'purchase': purchase.to_dict()})

    except Exception as e:
        db.session.rollback()
        print(f" Verify payment error: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@payments_bp.route('/razorpay/webhook', methods=['POST'])
def razorpay_webhook():
    """
    Independent backup confirmation path: Razorpay calls this server-to-
    server, so it works even if the student's browser closes right after
    paying (before the /razorpay/verify call from the frontend fires).

    No @jwt_required here on purpose — this isn't the user's browser
    calling it, it's Razorpay's servers. Trust is instead established by
    verifying the X-Razorpay-Signature header against the webhook secret,
    which only Razorpay and this server know.
    """
    try:
        webhook_secret = current_app.config.get('RAZORPAY_WEBHOOK_SECRET')
        if not webhook_secret:
            return jsonify({'success': False, 'error': 'Webhook not configured'}), 503

        client = _get_razorpay_client()
        if not client:
            return jsonify({'success': False, 'error': 'Payments not configured'}), 503

        signature = request.headers.get('X-Razorpay-Signature', '')
        raw_body = request.get_data(as_text=True)

        try:
            client.utility.verify_webhook_signature(raw_body, signature, webhook_secret)
        except Exception:
            return jsonify({'success': False, 'error': 'Invalid signature'}), 400

        payload = request.get_json(silent=True) or {}
        event = payload.get('event')

        if event == 'payment.captured':
            entity = payload.get('payload', {}).get('payment', {}).get('entity', {})
            order_id = entity.get('order_id')
            payment_id = entity.get('id')

            purchase = db.session.execute(
                db.select(Purchase).filter_by(razorpay_order_id=order_id)
            ).scalar_one_or_none()

            if purchase and purchase.status != 'approved':
                purchase.status = 'approved'
                purchase.razorpay_payment_id = payment_id
                purchase.reviewed_at = datetime.now(timezone.utc)
                db.session.commit()

        return jsonify({'success': True}), 200

    except Exception as e:
        db.session.rollback()
        print(f" Webhook error: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@payments_bp.route('/my-purchases', methods=['GET'])
@jwt_required()
def my_purchases():
    try:
        user_id = get_jwt_identity()
        purchases = db.session.execute(
            db.select(Purchase).filter_by(user_id=int(user_id)).order_by(Purchase.created_at.desc())
        ).scalars().all()
        return jsonify({'success': True, 'purchases': [p.to_dict() for p in purchases]})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@payments_bp.route('/notes/<int:note_id>/access', methods=['GET'])
@jwt_required(optional=True)
def check_access(note_id):
    try:
        note = db.session.get(Note, note_id)
        if not note:
            return jsonify({'success': False, 'error': 'Note not found'}), 404

        user = get_current_user_optional()
        return jsonify({
            'success': True,
            'is_premium': note.is_premium,
            'price': note.price,
            'has_access': note.has_access(user)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500