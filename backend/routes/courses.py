from flask import Blueprint, request, jsonify
from database.connection import db
from models.course import Course
from models.note import Note
import json

courses_bp = Blueprint('courses', __name__)

# Sample course data for initialization
SAMPLE_COURSES = [
    {"code": "CSE101", "name": "Introduction to Programming", "branch": "CSE", "semester": 1},
    {"code": "CSE201", "name": "Data Structures", "branch": "CSE", "semester": 3},
    {"code": "CSE202", "name": "Algorithms", "branch": "CSE", "semester": 4},
    {"code": "CSE301", "name": "Database Systems", "branch": "CSE", "semester": 5},
    {"code": "CSE302", "name": "Web Development", "branch": "CSE", "semester": 5},
    {"code": "ECE101", "name": "Basic Electronics", "branch": "ECE", "semester": 1},
    {"code": "ECE201", "name": "Digital Electronics", "branch": "ECE", "semester": 3},
    {"code": "ME101", "name": "Engineering Mechanics", "branch": "Mechanical", "semester": 1},
    {"code": "ME201", "name": "Thermodynamics", "branch": "Mechanical", "semester": 3},
    {"code": "CE101", "name": "Engineering Drawing", "branch": "Civil", "semester": 1},
    {"code": "MATH101", "name": "Engineering Mathematics", "branch": "All", "semester": 1},
    {"code": "PHYS101", "name": "Engineering Physics", "branch": "All", "semester": 1},
]

@courses_bp.route('/init', methods=['POST'])
def init_courses():
    """Initialize with sample courses (for development)"""
    try:
        for course_data in SAMPLE_COURSES:
            course = Course.query.filter_by(code=course_data['code']).first()
            if not course:
                course = Course(**course_data)
                db.session.add(course)
        
        db.session.commit()
        return jsonify({'message': f'{len(SAMPLE_COURSES)} courses initialized'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/', methods=['GET'])
def get_courses():
    """Get all courses with optional filters"""
    try:
        # Get query parameters
        branch = request.args.get('branch')
        semester = request.args.get('semester')
        search = request.args.get('search')
        
        # Start query
        query = Course.query
        
        # Apply filters
        if branch and branch != 'All':
            query = query.filter(Course.branch == branch)
        
        if semester and semester != 'All':
            query = query.filter(Course.semester == int(semester))
        
        if search:
            query = query.filter(
                (Course.name.ilike(f'%{search}%')) |
                (Course.code.ilike(f'%{search}%')) |
                (Course.description.ilike(f'%{search}%'))
            )
        
        # Execute query
        courses = query.all()
        
        return jsonify({
            'count': len(courses),
            'courses': [course.to_dict() for course in courses]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/<int:course_id>', methods=['GET'])
def get_course(course_id):
    """Get specific course with notes"""
    try:
        course = Course.query.get(course_id)
        
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        # Get notes for this course
        notes = Note.query.filter_by(course_id=course_id, is_approved=True).all()
        
        course_data = course.to_dict()
        course_data['notes'] = [note.to_dict() for note in notes]
        
        return jsonify({'course': course_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/branches', methods=['GET'])
def get_branches():
    """Get all unique branches"""
    try:
        branches = db.session.query(Course.branch).distinct().all()
        branch_list = [branch[0] for branch in branches if branch[0]]
        
        return jsonify({
            'branches': branch_list,
            'count': len(branch_list)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/semesters', methods=['GET'])
def get_semesters():
    """Get all unique semesters"""
    try:
        semesters = db.session.query(Course.semester).distinct().all()
        semester_list = [sem[0] for sem in semesters if sem[0]]
        semester_list.sort()
        
        return jsonify({
            'semesters': semester_list,
            'count': len(semester_list)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500