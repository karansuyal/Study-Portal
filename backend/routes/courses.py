"""Course, program, and subject listing routes. Logic unchanged from original app.py."""

from flask import Blueprint, request, jsonify

from extensions import db
from models import Course, Subject

courses_bp = Blueprint('courses', __name__)


@courses_bp.route('/api/courses', methods=['GET'])
def get_all_courses():
    courses = db.session.execute(db.select(Course)).scalars().all()
    return jsonify({'success': True, 'courses': [c.to_dict() for c in courses]})


@courses_bp.route('/api/programs', methods=['GET'])
def get_programs():
    courses = db.session.execute(db.select(Course)).scalars().all()
    return jsonify({
        'success': True,
        'programs': [
            {
                'id': c.id,
                'name': c.name,
                'code': c.code,
                'branch': c.branch,
                'semester': c.semester
            } for c in courses
        ]
    })


@courses_bp.route('/api/courses/<int:course_id>', methods=['GET'])
def get_course(course_id):
    course = db.session.get(Course, course_id)
    if not course:
        return jsonify({'success': False, 'error': 'Course not found'}), 404
    return jsonify({'success': True, 'course': course.to_dict()})


@courses_bp.route('/api/subjects', methods=['GET'])
def get_subjects():
    course_id = request.args.get('course_id')
    semester = request.args.get('semester')

    query = db.select(Subject)
    if course_id:
        query = query.filter_by(course_id=int(course_id))
    if semester:
        query = query.filter_by(semester=int(semester))

    subjects = db.session.execute(query).scalars().all()
    return jsonify({'success': True, 'subjects': [s.to_dict() for s in subjects]})

@courses_bp.route('/api/subjects/<int:subject_id>', methods=['GET'])
def get_subject(subject_id):
    subject = db.session.get(Subject, subject_id)
    if not subject:
        return jsonify({'success': False, 'error': 'Subject not found'}), 404
    return jsonify({'success': True, 'subject': subject.to_dict()})
