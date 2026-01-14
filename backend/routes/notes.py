from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.connection import db
from models.note import Note
from models.course import Course
from models.user import User
import os

notes_bp = Blueprint('notes', __name__)

@notes_bp.route('/', methods=['GET'])
def get_notes():
    """Get all notes with filters"""
    try:
        # Get query parameters
        course_id = request.args.get('course_id')
        note_type = request.args.get('type')
        year = request.args.get('year')
        search = request.args.get('search')
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        # Start query
        query = Note.query.filter_by(is_approved=True)
        
        # Apply filters
        if course_id:
            query = query.filter_by(course_id=course_id)
        
        if note_type:
            query = query.filter_by(note_type=note_type)
        
        if year:
            query = query.filter_by(year=year)
        
        if search:
            query = query.filter(
                (Note.title.ilike(f'%{search}%')) |
                (Note.description.ilike(f'%{search}%'))
            )
        
        # Get total count before pagination
        total_count = query.count()
        
        # Apply pagination
        notes = query.order_by(Note.created_at.desc()).offset(offset).limit(limit).all()
        
        return jsonify({
            'notes': [note.to_dict() for note in notes],
            'pagination': {
                'total': total_count,
                'limit': limit,
                'offset': offset,
                'has_more': (offset + len(notes)) < total_count
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notes_bp.route('/<int:note_id>', methods=['GET'])
def get_note(note_id):
    """Get specific note"""
    try:
        note = Note.query.get(note_id)
        
        if not note:
            return jsonify({'error': 'Note not found'}), 404
        
        if not note.is_approved:
            return jsonify({'error': 'Note not approved yet'}), 403
        
        return jsonify({'note': note.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notes_bp.route('/<int:note_id>/download', methods=['POST'])
@jwt_required()
def download_note(note_id):
    """Record a download for a note"""
    try:
        user_id = get_jwt_identity()
        note = Note.query.get(note_id)
        
        if not note:
            return jsonify({'error': 'Note not found'}), 404
        
        if not note.is_approved:
            return jsonify({'error': 'Note not approved yet'}), 403
        
        # Increment download count
        note.increment_download()
        
        # TODO: Record download in downloads table
        # download = Download(user_id=user_id, note_id=note_id)
        # db.session.add(download)
        # db.session.commit()
        
        # Return file path (in production, use signed URLs)
        return jsonify({
            'message': 'Download recorded',
            'file_path': note.file_path,
            'file_name': note.file_name,
            'downloads': note.downloads
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notes_bp.route('/trending', methods=['GET'])
def get_trending_notes():
    """Get trending notes (most downloaded)"""
    try:
        limit = request.args.get('limit', 10, type=int)
        
        notes = Note.query.filter_by(is_approved=True)\
                         .order_by(Note.downloads.desc())\
                         .limit(limit)\
                         .all()
        
        return jsonify({
            'notes': [note.to_dict() for note in notes]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notes_bp.route('/recent', methods=['GET'])
def get_recent_notes():
    """Get recently uploaded notes"""
    try:
        limit = request.args.get('limit', 10, type=int)
        
        notes = Note.query.filter_by(is_approved=True)\
                         .order_by(Note.created_at.desc())\
                         .limit(limit)\
                         .all()
        
        return jsonify({
            'notes': [note.to_dict() for note in notes]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notes_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get statistics about notes"""
    try:
        total_notes = Note.query.filter_by(is_approved=True).count()
        total_downloads = db.session.query(db.func.sum(Note.downloads)).scalar() or 0
        
        notes_by_type = db.session.query(
            Note.note_type,
            db.func.count(Note.id)
        ).filter_by(is_approved=True).group_by(Note.note_type).all()
        
        notes_by_branch = db.session.query(
            Course.branch,
            db.func.count(Note.id)
        ).join(Course, Note.course_id == Course.id)\
         .filter(Note.is_approved == True)\
         .group_by(Course.branch).all()
        
        return jsonify({
            'total_notes': total_notes,
            'total_downloads': total_downloads,
            'notes_by_type': dict(notes_by_type),
            'notes_by_branch': dict(notes_by_branch)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500