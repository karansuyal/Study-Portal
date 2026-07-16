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

from flask import Blueprint, request, jsonify, current_app

from extensions import db
from models import User, Note, Course, Subject
from decorators import admin_required

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
