"""
Admin routes.

Fix applied here: every route below used to manually repeat the
"get user, check role == admin, else 403" block. Now it's just
@admin_required — one line, impossible to forget, one place to change
if the admin logic ever needs updating (e.g. adding a 'moderator' role).

Also fixed: /api/debug/files used to manually parse the Authorization header
and decode the JWT by hand instead of using @jwt_required()/@admin_required
like every other route. That was inconsistent and easy to get subtly wrong.
It now uses @admin_required like everything else.
"""

import os
import traceback
from datetime import datetime, timezone

from flask import Blueprint, request, jsonify, current_app, g

from ..extensions import db
from ..models import User, Note, Course, Subject, Purchase
from ..decorators import admin_required

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


@admin_bp.route('/stats', methods=['GET'])
@admin_required
def admin_stats():
    try:
        stats = {
            'total_users': db.session.execute(db.select(db.func.count()).select_from(User)).scalar(),
            'total_courses': db.session.execute(db.select(db.func.count()).select_from(Course)).scalar(),
            'total_subjects': db.session.execute(db.select(db.func.count()).select_from(Subject)).scalar(),
            'total_notes': db.session.execute(db.select(db.func.count()).select_from(Note)).scalar(),
            'approved_notes': db.session.execute(db.select(db.func.count()).select_from(Note).filter_by(status='approved')).scalar(),
            'pending_notes': db.session.execute(db.select(db.func.count()).select_from(Note).filter_by(status='pending')).scalar(),
            'rejected_notes': db.session.execute(db.select(db.func.count()).select_from(Note).filter_by(status='rejected')).scalar(),
            'total_downloads': sum(n.downloads for n in db.session.execute(db.select(Note)).scalars().all())
        }
        return jsonify({'success': True, 'stats': stats})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_bp.route('/pending-notes', methods=['GET'])
@admin_required
def get_pending_notes():
    try:
        notes = Note.query.filter_by(status='pending').order_by(Note.uploaded_at.desc()).all()
        return jsonify({'success': True, 'notes': [note.to_dict() for note in notes]})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_bp.route('/approved-notes', methods=['GET'])
@admin_required
def get_approved_notes():
    try:
        notes = Note.query.filter_by(status='approved').order_by(Note.uploaded_at.desc()).all()
        return jsonify({'success': True, 'notes': [note.to_dict() for note in notes]})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    try:
        users = db.session.execute(db.select(User).order_by(User.created_at.desc())).scalars().all()

        user_list = []
        for user in users:
            upload_count = db.session.execute(
                db.select(db.func.count()).select_from(Note).filter_by(user_id=user.id)
            ).scalar()
            user_dict = user.to_dict()
            user_dict['upload_count'] = upload_count
            user_list.append(user_dict)

        return jsonify({'success': True, 'users': user_list, 'total': len(user_list)})

    except Exception as e:
        print(f" ERROR in get_all_users: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user_details(user_id):
    try:
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        return jsonify({'success': True, 'user': user.to_dict()})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_bp.route('/run-migrations', methods=['POST'])
@admin_required
def run_migrations():
    """
    Applies every .sql file in backend/migrations/ against the live
    database, in filename order.

    Exists because Render's free tier has no Shell access to run
    `psql -f migrations/xxx.sql` by hand — this does the same thing over
    an authenticated HTTP call instead. Safe to call more than once: every
    migration file in this repo uses IF NOT EXISTS / equivalent guards, so
    re-running an already-applied file is a no-op, not an error.

    admin_required means only a logged-in admin's JWT can trigger this —
    it is not open to the public internet.
    """
    from sqlalchemy import text

    migrations_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'migrations')
    if not os.path.isdir(migrations_dir):
        return jsonify({'success': False, 'error': f'No migrations folder found at {migrations_dir}'}), 404

    sql_files = sorted(f for f in os.listdir(migrations_dir) if f.endswith('.sql'))
    if not sql_files:
        return jsonify({'success': False, 'error': 'No .sql files found in migrations/'}), 404

    results = []
    for filename in sql_files:
        path = os.path.join(migrations_dir, filename)
        try:
            with open(path) as f:
                sql = f.read()
            db.session.execute(text(sql))
            db.session.commit()
            results.append({'file': filename, 'status': 'applied'})
        except Exception as e:
            db.session.rollback()
            results.append({'file': filename, 'status': 'error', 'error': str(e)})
            print(f" Migration {filename} failed: {e}")
            traceback.print_exc()

    all_ok = all(r['status'] == 'applied' for r in results)
    return jsonify({'success': all_ok, 'results': results}), (200 if all_ok else 500)


@admin_bp.route('/notes/<int:note_id>/approve', methods=['POST', 'OPTIONS'])
@admin_required
def approve_note(note_id):
    if request.method == 'OPTIONS':
        return '', 200
    try:
        note = db.session.get(Note, note_id)
        if not note:
            return jsonify({'success': False, 'error': 'Note not found'}), 404

        note.status = 'approved'
        note.approved_at = datetime.now(timezone.utc)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Note approved successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_bp.route('/notes/<int:note_id>/reject', methods=['POST', 'OPTIONS'])
@admin_required
def reject_note(note_id):
    if request.method == 'OPTIONS':
        return '', 200
    try:
        data = request.get_json()
        reason = data.get('reason', 'Rejected by admin')

        note = db.session.get(Note, note_id)
        if not note:
            return jsonify({'success': False, 'error': 'Note not found'}), 404

        note.status = 'rejected'
        note.rejection_reason = reason
        db.session.commit()

        return jsonify({'success': True, 'message': 'Note rejected successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ==================== PREMIUM NOTES ====================

@admin_bp.route('/notes/<int:note_id>/premium', methods=['POST', 'OPTIONS'])
@admin_required
def set_note_premium(note_id):
    """Mark/unmark a note as premium and set its price (in rupees, converted to paise)."""
    if request.method == 'OPTIONS':
        return '', 200
    try:
        note = db.session.get(Note, note_id)
        if not note:
            return jsonify({'success': False, 'error': 'Note not found'}), 404

        data = request.get_json() or {}
        is_premium = bool(data.get('is_premium', False))
        price_rupees = data.get('price_rupees', 0)

        try:
            price_rupees = float(price_rupees)
        except (TypeError, ValueError):
            return jsonify({'success': False, 'error': 'price_rupees must be a number'}), 400

        if is_premium and price_rupees <= 0:
            return jsonify({'success': False, 'error': 'Premium notes need a price greater than ₹0'}), 400

        note.is_premium = is_premium
        note.price = int(round(price_rupees * 100)) if is_premium else 0
        db.session.commit()

        return jsonify({'success': True, 'message': 'Note updated', 'note': note.to_dict(viewer=g.current_user)})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_bp.route('/payments/pending', methods=['GET'])
@admin_required
def get_pending_payments():
    """
    upi_manual orders waiting on manual review — the ones an admin actually
    has to look at (razorpay orders self-approve via signature/webhook and
    never need a human).
    """
    try:
        purchases = db.session.execute(
            db.select(Purchase)
            .filter_by(method='upi_manual', status='pending')
            .order_by(Purchase.created_at.asc())
        ).scalars().all()
        return jsonify({'success': True, 'purchases': [p.to_dict() for p in purchases]})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_bp.route('/payments/all', methods=['GET'])
@admin_required
def get_all_payments():
    """Full payment history (all methods, all statuses) for bookkeeping."""
    try:
        status = request.args.get('status')
        query = db.select(Purchase).order_by(Purchase.created_at.desc())
        if status:
            query = query.filter_by(status=status)
        purchases = db.session.execute(query).scalars().all()
        return jsonify({'success': True, 'purchases': [p.to_dict() for p in purchases]})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_bp.route('/payments/<int:purchase_id>/approve', methods=['POST', 'OPTIONS'])
@admin_required
def approve_payment(purchase_id):
    """
    The ONLY place a upi_manual purchase can become 'approved' — a human
    admin, looking at the UTR/screenshot, explicitly clicking approve.
    """
    if request.method == 'OPTIONS':
        return '', 200
    try:
        purchase = db.session.get(Purchase, purchase_id)
        if not purchase:
            return jsonify({'success': False, 'error': 'Order not found'}), 404
        if purchase.status != 'pending':
            return jsonify({'success': False, 'error': f'Order was already {purchase.status}'}), 400

        purchase.status = 'approved'
        purchase.reviewed_by = g.current_user.id
        purchase.reviewed_at = datetime.now(timezone.utc)
        db.session.commit()

        try:
            from ..email_service import send_purchase_approved_email
            send_purchase_approved_email(purchase.user.email, purchase.user.name, purchase.note.title)
        except Exception as e:
            print(f" (non-fatal) approval email failed: {e}")

        return jsonify({'success': True, 'message': 'Payment approved — note unlocked for the student', 'purchase': purchase.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_bp.route('/payments/<int:purchase_id>/reject', methods=['POST', 'OPTIONS'])
@admin_required
def reject_payment(purchase_id):
    if request.method == 'OPTIONS':
        return '', 200
    try:
        data = request.get_json() or {}
        reason = (data.get('reason') or '').strip()
        if not reason:
            return jsonify({'success': False, 'error': 'A rejection reason is required'}), 400

        purchase = db.session.get(Purchase, purchase_id)
        if not purchase:
            return jsonify({'success': False, 'error': 'Order not found'}), 404
        if purchase.status != 'pending':
            return jsonify({'success': False, 'error': f'Order was already {purchase.status}'}), 400

        purchase.status = 'rejected'
        purchase.rejection_reason = reason
        purchase.reviewed_by = g.current_user.id
        purchase.reviewed_at = datetime.now(timezone.utc)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Payment rejected', 'purchase': purchase.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    try:
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        data = request.get_json()

        if 'name' in data:
            user.name = data['name']
        if 'branch' in data:
            user.branch = data['branch']
        if 'semester' in data:
            user.semester = data['semester']
        if 'role' in data:
            user.role = data['role']

        db.session.commit()

        return jsonify({'success': True, 'message': 'User updated successfully', 'user': user.to_dict()})

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    from flask import g
    try:
        admin = g.current_user
        if admin.id == user_id:
            return jsonify({'success': False, 'error': 'Cannot delete yourself'}), 400

        user = db.session.get(User, user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        notes = Note.query.filter_by(user_id=user_id).all()

        deleted_files = 0
        for note in notes:
            if note.file_path and os.path.exists(note.file_path):
                try:
                    os.remove(note.file_path)
                    deleted_files += 1
                except Exception as e:
                    print(f" Could not delete file {note.file_path}: {str(e)}")

        for note in notes:
            db.session.delete(note)

        db.session.delete(user)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': f'User {user.name} and all their uploads deleted successfully',
            'stats': {'files_deleted': deleted_files, 'notes_deleted': len(notes)}
        })

    except Exception as e:
        db.session.rollback()
        print(f" ERROR deleting user: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_bp.route('/notes/<int:note_id>', methods=['DELETE'])
@admin_required
def delete_note(note_id):
    try:
        note = db.session.get(Note, note_id)
        if not note:
            return jsonify({'success': False, 'error': 'Note not found'}), 404

        if note.file_path and os.path.exists(note.file_path):
            try:
                os.remove(note.file_path)
            except Exception:
                pass

        db.session.delete(note)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Note deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_bp.route('/notes/<int:note_id>/edit', methods=['PUT', 'OPTIONS'])
@admin_required
def edit_note(note_id):
    if request.method == 'OPTIONS':
        response = jsonify({'success': True})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'PUT,OPTIONS')
        return response, 200

    try:
        note = db.session.get(Note, note_id)
        if not note:
            return jsonify({'error': 'Note not found'}), 404

        data = request.get_json()

        if 'title' in data:
            note.title = data['title']
        if 'description' in data:
            note.description = data['description']
        if 'note_type' in data:
            note.note_type = data['note_type']

        db.session.commit()

        return jsonify({'success': True, 'message': 'Note updated successfully', 'note': note.to_dict()})

    except Exception as e:
        db.session.rollback()
        print(f" Edit error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/debug/files', methods=['GET', 'OPTIONS'])
@admin_required
def debug_files():
    """
    Now protected by the same @admin_required decorator as everything else,
    instead of manually parsing the Authorization header by hand.
    Note: this route was moved to /api/admin/debug/files (was /api/debug/files)
    since it's an admin-only route and belongs under the admin blueprint's
    prefix. Update the admin panel's fetch URL if it calls the old path.
    """
    if request.method == 'OPTIONS':
        return '', 200

    try:
        notes = Note.query.all()
        result = []

        for note in notes:
            file_info = {
                'id': note.id,
                'title': note.title,
                'file_name': note.file_name,
                'original_filename': note.original_filename,
                'db_path': note.file_path,
                'exists_in_db_path': os.path.exists(note.file_path) if note.file_path else False,
                'course': note.course_ref.name if note.course_ref else 'Unknown',
                'upload_folder': current_app.config['UPLOAD_FOLDER']
            }

            if note.file_name:
                alt_path1 = os.path.join(current_app.config['UPLOAD_FOLDER'], note.file_name)
                file_info['alt_path1'] = alt_path1
                file_info['alt_path1_exists'] = os.path.exists(alt_path1)

                if note.course_ref:
                    course_folder = note.course_ref.name.replace(' ', '_')
                    alt_path2 = os.path.join(current_app.config['UPLOAD_FOLDER'], course_folder, note.file_name)
                    file_info['alt_path2'] = alt_path2
                    file_info['alt_path2_exists'] = os.path.exists(alt_path2)

            result.append(file_info)

        folder_structure = []
        for root, dirs, files in os.walk(current_app.config['UPLOAD_FOLDER']):
            for file in files:
                folder_structure.append({
                    'path': os.path.join(root, file),
                    'relative': os.path.relpath(os.path.join(root, file), current_app.config['UPLOAD_FOLDER'])
                })

        return jsonify({
            'success': True,
            'notes': result,
            'folder_structure': folder_structure,
            'upload_folder': current_app.config['UPLOAD_FOLDER']
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500