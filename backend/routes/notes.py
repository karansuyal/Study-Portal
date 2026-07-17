"""
Notes: listing, ratings, the public /materials feed, upload (file or YouTube),
download, and file-serving routes.

Logic is unchanged from the original app.py — this file is a straight move,
not a rewrite, to avoid introducing bugs in the upload/Cloudinary/Drive flow
which is the riskiest part of the app to get wrong blind.
"""

import os
import json
import time
import uuid
import tempfile
import traceback
from datetime import datetime, timezone

from flask import Blueprint, request, jsonify, send_file, send_from_directory, redirect, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import text

from extensions import db
from models import Note, User, Course, Subject, UserRating
from utils import allowed_file, format_bytes

notes_bp = Blueprint('notes', __name__)


@notes_bp.route('/api/search', methods=['GET'])
def search_notes():
    """
    Full-text search across note titles and descriptions.

    Uses Postgres full-text search (search_vector column, see
    migrations/002_add_search.sql) ranked by relevance. If that finds
    nothing — e.g. because of a typo — falls back to trigram similarity
    matching on the title, which tolerates misspellings.

    Query params:
      q          - search text (required)
      course_id  - optional, restrict to one course
      subject_id - optional, restrict to one subject
    """
    try:
        q = request.args.get('q', '').strip()
        if not q:
            return jsonify({'success': True, 'notes': [], 'total': 0})

        course_id = request.args.get('course_id')
        subject_id = request.args.get('subject_id')

        filters_sql = "AND status = 'approved'"
        params = {'q': q}
        if course_id:
            filters_sql += " AND course_id = :course_id"
            params['course_id'] = int(course_id)
        if subject_id:
            filters_sql += " AND subject_id = :subject_id"
            params['subject_id'] = int(subject_id)

        fts_sql = text(f"""
            SELECT id, ts_rank(search_vector, websearch_to_tsquery('english', :q)) AS rank
            FROM notes
            WHERE search_vector @@ websearch_to_tsquery('english', :q)
            {filters_sql}
            ORDER BY rank DESC
            LIMIT 30
        """)
        rows = db.session.execute(fts_sql, params).all()

        used_fallback = False
        if not rows:
            # Nothing matched exactly — try fuzzy matching on the title,
            # which catches typos that full-text search won't.
            used_fallback = True
            trgm_sql = text(f"""
                SELECT id, similarity(title, :q) AS rank
                FROM notes
                WHERE similarity(title, :q) > 0.2
                {filters_sql}
                ORDER BY rank DESC
                LIMIT 30
            """)
            rows = db.session.execute(trgm_sql, params).all()

        ids_in_order = [r[0] for r in rows]
        if not ids_in_order:
            return jsonify({'success': True, 'notes': [], 'total': 0, 'fuzzy': used_fallback})

        notes = Note.query.filter(Note.id.in_(ids_in_order)).all()
        order_map = {note_id: i for i, note_id in enumerate(ids_in_order)}
        notes.sort(key=lambda n: order_map[n.id])

        return jsonify({
            'success': True,
            'notes': [note.to_dict() for note in notes],
            'total': len(notes),
            'fuzzy': used_fallback
        })

    except Exception as e:
        print(f" Search error: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@notes_bp.route('/api/notes', methods=['GET'])
def get_notes():
    try:
        subject_id = request.args.get('subject_id')
        course_id = request.args.get('course_id')
        status = request.args.get('status', 'approved')

        print(f"\n📝 FETCHING NOTES - subject={subject_id}, course={course_id}, status={status}")

        query = db.select(Note).order_by(Note.uploaded_at.desc())

        if subject_id:
            query = query.filter_by(subject_id=int(subject_id))
        if course_id:
            query = query.filter_by(course_id=int(course_id))
        if status:
            query = query.filter_by(status=status)

        notes = db.session.execute(query).scalars().all()

        print(f" Found {len(notes)} notes")

        return jsonify({'success': True, 'notes': [note.to_dict() for note in notes], 'total': len(notes)})

    except Exception as e:
        print(f" Error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@notes_bp.route('/api/notes/<int:note_id>', methods=['GET'])
def get_note_detail(note_id):
    try:
        note = db.session.get(Note, note_id)
        if not note:
            return jsonify({'success': False, 'error': 'Note not found'}), 404

        note.views += 1
        db.session.commit()

        return jsonify({'success': True, 'note': note.to_dict()})

    except Exception as e:
        db.session.rollback()
        print(f" Error in views increment: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@notes_bp.route('/api/notes/<int:note_id>/rate', methods=['POST'])
@jwt_required()
def rate_note(note_id):
    try:
        user_id = get_jwt_identity()
        user = db.session.get(User, int(user_id))

        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        data = request.get_json()
        rating_value = data.get('rating')

        if not rating_value or rating_value < 1 or rating_value > 5:
            return jsonify({'success': False, 'error': 'Rating must be between 1 and 5'}), 400

        note = db.session.get(Note, note_id)
        if not note:
            return jsonify({'success': False, 'error': 'Note not found'}), 404

        if note.rating_count is None:
            note.rating_count = 0
        if note.rating_sum is None:
            note.rating_sum = 0

        existing_rating = db.session.execute(
            db.select(UserRating).filter_by(note_id=note_id, user_id=user.id)
        ).scalar_one_or_none()

        if existing_rating:
            old_rating = existing_rating.rating
            existing_rating.rating = rating_value
            existing_rating.updated_at = datetime.now(timezone.utc)

            note.rating_sum = note.rating_sum - old_rating + rating_value
            note.rating = note.rating_sum / note.rating_count if note.rating_count > 0 else 0

            message = 'Rating updated successfully'
        else:
            user_rating = UserRating(note_id=note_id, user_id=user.id, rating=rating_value)
            db.session.add(user_rating)

            if note.rating_count is None:
                note.rating_count = 0
                note.rating_sum = 0

            note.rating_count += 1
            note.rating_sum += rating_value
            note.rating = note.rating_sum / note.rating_count if note.rating_count > 0 else 0

            message = 'Rating submitted successfully'

        db.session.commit()

        return jsonify({
            'success': True,
            'message': message,
            'new_rating': note.rating,
            'rating_count': note.rating_count,
            'user_rating': rating_value
        })

    except Exception as e:
        db.session.rollback()
        print(f" Rating error: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@notes_bp.route('/api/notes/<int:note_id>/user-rating', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)
def get_user_rating(note_id):
    if request.method == 'OPTIONS':
        return '', 200

    try:
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({'success': False, 'rating': 0}), 200

        user = db.session.get(User, int(user_id))
        if not user:
            return jsonify({'success': False, 'rating': 0}), 200

        rating = db.session.execute(
            db.select(UserRating).filter_by(note_id=note_id, user_id=user.id)
        ).scalar_one_or_none()

        return jsonify({'success': True, 'rating': rating.rating if rating else 0})

    except Exception as e:
        print(f" Error fetching user rating: {str(e)}")
        return jsonify({'success': False, 'rating': 0}), 200


@notes_bp.route('/api/materials', methods=['GET'])
def get_all_materials():
    try:
        print("\n📦 FETCHING ALL MATERIALS")

        notes = db.session.query(Note).options(
            db.joinedload(Note.course_ref),
            db.joinedload(Note.subject_ref),
            db.joinedload(Note.uploader)
        ).filter(Note.status == 'approved').order_by(Note.uploaded_at.desc()).all()

        materials_list = []
        for note in notes:
            materials_list.append({
                'id': note.id,
                'title': note.title,
                'description': note.description,
                'type': note.note_type,
                'course': note.course_ref.name if note.course_ref else 'Unknown',
                'course_id': note.course_id,
                'subject': note.subject_ref.name if note.subject_ref else 'General',
                'subject_id': note.subject_id,
                'file_name': note.file_name,
                'file_size': format_bytes(note.file_size),
                'file_type': note.file_type,
                'downloads': note.downloads,
                'views': note.views,
                'uploaded_at': note.uploaded_at.isoformat() if note.uploaded_at else None,
                'user_name': note.uploader.name if note.uploader else 'Unknown',
                'cloudinary_url': note.cloudinary_url,
                'download_url': f'/api/notes/{note.id}/download'
            })

        print(f" Found {len(materials_list)} materials")
        return jsonify({'success': True, 'materials': materials_list, 'total': len(materials_list)})

    except Exception as e:
        print(f" Error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@notes_bp.route('/api/upload', methods=['POST', 'OPTIONS'])
@jwt_required()
def upload_note():
    if request.method == 'OPTIONS':
        response = jsonify({'success': True})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
        return response, 200

    try:
        user_id = get_jwt_identity()
        user = db.session.get(User, int(user_id))
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        is_youtube = request.form.get('is_youtube') == 'true'

        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        course_id = request.form.get('course_id')
        subject_id = request.form.get('subject_id')
        note_type = request.form.get('type', 'notes')
        semester = request.form.get('semester', '1')
        year = request.form.get('year', '1')
        tags = request.form.get('tags', '')

        if not title:
            return jsonify({'success': False, 'error': 'Title is required'}), 400

        if not course_id:
            return jsonify({'success': False, 'error': 'Course ID is required'}), 400

        course = db.session.get(Course, int(course_id))
        if not course:
            return jsonify({'success': False, 'error': 'Course not found'}), 404

        # ==================== YOUTUBE VIDEO HANDLING ====================
        if is_youtube:
            youtube_url = request.form.get('youtube_url', '')
            youtube_id = request.form.get('youtube_id', '')

            if not youtube_url or not youtube_id:
                return jsonify({'success': False, 'error': 'YouTube URL and ID are required'}), 400

            if len(youtube_id) != 11:
                return jsonify({'success': False, 'error': 'Invalid YouTube video ID'}), 400

            youtube_thumbnail = f"https://img.youtube.com/vi/{youtube_id}/maxresdefault.jpg"
            youtube_embed_url = f"https://www.youtube.com/embed/{youtube_id}"

            try:
                youtube_data = json.loads(description) if description else {}
                actual_description = youtube_data.get('description', '')
            except Exception:
                actual_description = description

            is_admin = user.role == 'admin'

            note = Note(
                title=title,
                description=actual_description,
                note_type=note_type,
                course_id=course.id,
                subject_id=int(subject_id) if subject_id and subject_id != 'null' else None,
                user_id=user.id,
                status='approved' if is_admin else 'pending',
                uploaded_at=datetime.now(timezone.utc),
                approved_at=datetime.now(timezone.utc) if is_admin else None,
                is_youtube=True,
                youtube_url=youtube_url,
                youtube_id=youtube_id,
                youtube_thumbnail=youtube_thumbnail,
                youtube_embed_url=youtube_embed_url,
                file_name=youtube_id,
                original_filename=f"{title}.youtube",
                file_type='youtube',
                file_path=youtube_url
            )

            db.session.add(note)
            db.session.commit()

            print(f" YouTube video saved with ID: {note.id}")

            return jsonify({
                'success': True,
                'message': 'YouTube video added successfully!',
                'note': note.to_dict(),
                'status': note.status
            }), 201

        # ==================== FILE UPLOAD HANDLING ====================
        else:
            import cloudinary.uploader

            if 'file' not in request.files:
                return jsonify({'success': False, 'error': 'No file uploaded'}), 400

            file = request.files['file']
            if file.filename == '':
                return jsonify({'success': False, 'error': 'No file selected'}), 400

            if not allowed_file(file.filename):
                return jsonify({'success': False, 'error': 'File type not allowed'}), 400

            print(f" Course found: {course.name}")

            from werkzeug.utils import secure_filename
            original_filename = secure_filename(file.filename)

            if '.' in original_filename:
                file_ext = original_filename.rsplit('.', 1)[1].lower()
            else:
                file_ext = ""

            timestamp = int(time.time())
            unique_id = uuid.uuid4().hex[:8]
            base_filename = f"{timestamp}_{unique_id}_{original_filename}"

            subject_name = "General"
            if subject_id and subject_id != 'null':
                subject = db.session.get(Subject, int(subject_id))
                if subject:
                    subject_name = subject.name
                    print(f"📚 Subject: {subject_name} (ID: {subject_id})")

            course_folder = course.name.replace(' ', '_').replace('/', '_')
            semester_folder = f"Semester_{semester}"
            subject_folder = subject_name.replace(' ', '_').replace('/', '_')

            cloudinary_folder = f"study_portal/{course_folder}/{semester_folder}/{subject_folder}/{note_type}"

            resource_type = "raw" if file_ext in ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'] else "image"

            print(f"📤 Uploading to Cloudinary folder: {cloudinary_folder}")

            upload_result = cloudinary.uploader.upload(
                file,
                folder=cloudinary_folder,
                public_id=f"{timestamp}_{unique_id}",
                resource_type=resource_type,
                type="upload",
                overwrite=False
            )

            print(" Cloudinary upload successful!")

            cloudinary_url = upload_result['secure_url']
            cloudinary_public_id = upload_result['public_id']
            file_size = upload_result.get('bytes', 0)

            # ==================== GOOGLE DRIVE BACKUP ====================
            try:
                from google_drive import upload_to_drive

                file.seek(0)

                with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{original_filename}") as tmp:
                    tmp.write(file.read())
                    tmp_path = tmp.name

                safe_title = title.replace('/', '_').replace('\\', '_').replace(':', '_').replace('*', '_').replace('?', '_').replace('"', '_').replace('<', '_').replace('>', '_').replace('|', '_')
                drive_filename = f"{safe_title}.pdf"

                upload_to_drive(
                    tmp_path,
                    drive_filename,
                    course=course.name,
                    semester=semester,
                    subject=subject_name,
                    note_type=note_type
                )

                os.remove(tmp_path)
                print(f" Google Drive backup complete")

            except ImportError:
                print(" Google Drive module not found, skipping backup")
            except Exception as e:
                print(f" Google Drive backup failed: {e}")

            is_admin = user.role == 'admin'

            note = Note(
                title=title,
                description=description,
                file_name=base_filename,
                original_filename=original_filename,
                file_path=cloudinary_url,
                file_type=file_ext,
                file_size=file_size,
                note_type=note_type,
                course_id=course.id,
                subject_id=int(subject_id) if subject_id and subject_id != 'null' else None,
                user_id=user.id,
                status='approved' if is_admin else 'pending',
                uploaded_at=datetime.now(timezone.utc),
                approved_at=datetime.now(timezone.utc) if is_admin else None,
                cloudinary_url=cloudinary_url,
                cloudinary_public_id=cloudinary_public_id,
                is_youtube=False
            )

            db.session.add(note)
            db.session.commit()

            print(f" Note saved with ID: {note.id}")

            return jsonify({
                'success': True,
                'message': 'File uploaded successfully!',
                'note': note.to_dict(),
                'file_url': cloudinary_url,
                'status': note.status
            }), 201

    except Exception as e:
        db.session.rollback()
        print(f" Upload Error: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@notes_bp.route('/api/files/<path:filepath>', methods=['GET'])
def get_file(filepath):
    try:
        directory = os.path.dirname(filepath)
        filename = os.path.basename(filepath)

        possible_paths = []
        if directory:
            possible_paths.append(('with directory', os.path.join(current_app.config['UPLOAD_FOLDER'], directory, filename)))
        possible_paths.append(('without directory', os.path.join(current_app.config['UPLOAD_FOLDER'], filename)))

        for path_type, full_path in possible_paths:
            if os.path.exists(full_path):
                if directory:
                    return send_from_directory(os.path.join(current_app.config['UPLOAD_FOLDER'], directory), filename)
                else:
                    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

        return jsonify({'success': False, 'error': 'File not found'}), 404

    except Exception as e:
        print(f" Error: {str(e)}")
        return jsonify({'success': False, 'error': 'File not found'}), 404


@notes_bp.route('/api/notes/<int:note_id>/download', methods=['GET'])
def download_note(note_id):
    try:
        note = db.session.get(Note, note_id)
        if not note:
            return jsonify({'success': False, 'error': 'Note not found'}), 404

        if note.cloudinary_url:
            return redirect(note.cloudinary_url)

        if not os.path.exists(note.file_path):
            filename = os.path.basename(note.file_path)
            course = note.course_ref.name.replace(' ', '_')

            alt_paths = [
                os.path.join(current_app.config['UPLOAD_FOLDER'], filename),
                os.path.join(current_app.config['UPLOAD_FOLDER'], course, filename),
            ]

            found = False
            for alt_path in alt_paths:
                if os.path.exists(alt_path):
                    note.file_path = alt_path
                    db.session.commit()
                    found = True
                    break

            if not found:
                return jsonify({'success': False, 'error': 'File not found on server'}), 404

        mime_types = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'ppt': 'application/vnd.ms-powerpoint',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'txt': 'text/plain',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png'
        }

        mimetype = mime_types.get(note.file_type, 'application/octet-stream')

        return send_file(note.file_path, as_attachment=True, download_name=note.original_filename, mimetype=mimetype)

    except Exception as e:
        print(f" Download error: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@notes_bp.route('/api/notes/<int:note_id>/stats', methods=['GET'])
def get_note_stats(note_id):
    try:
        note = db.session.get(Note, note_id)
        if not note:
            return jsonify({'success': False, 'error': 'Note not found'}), 404

        return jsonify({
            'success': True,
            'stats': {
                'views': note.views,
                'downloads': note.downloads,
                'rating': note.rating,
                'rating_count': note.rating_count
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@notes_bp.route('/api/notes/<int:note_id>/download', methods=['POST', 'OPTIONS'])
def increment_download_count(note_id):
    if request.method == 'OPTIONS':
        response = jsonify({'success': True})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
        return response, 200

    try:
        note = db.session.get(Note, note_id)
        if not note:
            return jsonify({'success': False, 'error': 'Note not found'}), 404

        note.downloads += 1
        db.session.commit()

        return jsonify({'success': True, 'message': 'Download count incremented', 'downloads': note.downloads})

    except Exception as e:
        db.session.rollback()
        print(f" Error in download increment: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@notes_bp.route('/api/materials/<int:note_id>/download', methods=['POST', 'OPTIONS'])
def increment_download_count_alt(note_id):
    return increment_download_count(note_id)