# """
# Notes Hub Backend - SQLite Only Version
# No PostgreSQL dependency
# """

# import os
# import uuid
# import json
# from datetime import datetime, timedelta
# from werkzeug.utils import secure_filename
# from werkzeug.security import generate_password_hash, check_password_hash
# from flask import Flask, request, jsonify, send_file, send_from_directory
# from flask_cors import CORS
# from flask_sqlalchemy import SQLAlchemy
# from flask_jwt_extended import (
#     JWTManager, create_access_token, jwt_required,
#     get_jwt_identity, create_refresh_token
# )

# # ==================== CONFIGURATION ====================

# basedir = os.path.abspath(os.path.dirname(__file__))

# # FORCE SQLITE - Remove any PostgreSQL environment variables
# if 'DATABASE_URL' in os.environ:
#     del os.environ['DATABASE_URL']

# app = Flask(__name__)

# # SQLite Database Path
# DATABASE_PATH = os.path.join(basedir, 'instance', 'noteshub.db')
# UPLOAD_FOLDER = os.path.join(basedir, 'uploads')

# # Create directories
# os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# # App Configuration
# app.config['SECRET_KEY'] = 'notes-hub-super-secret-key-2024'
# app.config['JWT_SECRET_KEY'] = 'jwt-super-secret-key'
# app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
# app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

# # SQLite Database Configuration
# app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DATABASE_PATH}'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# # File Upload Configuration
# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB
# app.config['ALLOWED_EXTENSIONS'] = {
#     'pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt',
#     'jpg', 'jpeg', 'png', 'zip', 'rar'
# }

# # Initialize extensions
# db = SQLAlchemy(app)
# jwt = JWTManager(app)
# CORS(app, 
#      resources={r"/api/*": {"origins": "*"}},
#      supports_credentials=True,
#      allow_headers=["Content-Type", "Authorization"],
#      methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# # ==================== DATABASE MODELS ====================

# class User(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(100), nullable=False)
#     email = db.Column(db.String(100), unique=True, nullable=False)
#     password = db.Column(db.String(200), nullable=False)
#     branch = db.Column(db.String(50))
#     semester = db.Column(db.Integer)
#     role = db.Column(db.String(20), default='student')
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
#     def set_password(self, password):
#         self.password = generate_password_hash(password)
    
#     def check_password(self, password):
#         return check_password_hash(self.password, password)
    
#     def to_dict(self):
#         return {
#             'id': self.id,
#             'name': self.name,
#             'email': self.email,
#             'branch': self.branch,
#             'semester': self.semester,
#             'role': self.role,
#             'created_at': self.created_at.isoformat() if self.created_at else None
#         }

# class Course(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(200), nullable=False)
#     branch = db.Column(db.String(50), nullable=False)
#     semester = db.Column(db.Integer, nullable=False)
#     code = db.Column(db.String(20), unique=True)
#     description = db.Column(db.Text)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
#     def to_dict(self):
#         from . import db
#         note_count = db.session.query(db.func.count(Note.id)).filter(
#             Note.course_id == self.id, Note.status == 'approved'
#         ).scalar()
        
#         return {
#             'id': self.id,
#             'name': self.name,
#             'branch': self.branch,
#             'semester': self.semester,
#             'code': self.code,
#             'description': self.description,
#             'note_count': note_count or 0,
#             'created_at': self.created_at.isoformat() if self.created_at else None
#         }

# class Note(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     title = db.Column(db.String(200), nullable=False)
#     description = db.Column(db.Text)
#     file_name = db.Column(db.String(200))
#     original_filename = db.Column(db.String(200))
#     file_path = db.Column(db.String(500))
#     file_type = db.Column(db.String(20))
#     file_size = db.Column(db.Integer)
#     note_type = db.Column(db.String(20), default='notes')
    
#     # Status
#     status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
#     rejection_reason = db.Column(db.Text)
#     downloads = db.Column(db.Integer, default=0)
    
#     # Timestamps
#     uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
#     approved_at = db.Column(db.DateTime)
    
#     # Foreign Keys
#     course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
#     user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
#     def to_dict(self):
#         user = User.query.get(self.user_id)
#         course = Course.query.get(self.course_id)
        
#         return {
#             'id': self.id,
#             'title': self.title,
#             'description': self.description,
#             'file_name': self.file_name,
#             'original_filename': self.original_filename,
#             'file_type': self.file_type,
#             'file_size': self.file_size,
#             'file_size_formatted': f"{self.file_size / 1024 / 1024:.2f} MB" if self.file_size else "0 MB",
#             'note_type': self.note_type,
#             'status': self.status,
#             'rejection_reason': self.rejection_reason,
#             'downloads': self.downloads,
#             'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
#             'approved_at': self.approved_at.isoformat() if self.approved_at else None,
#             'course_id': self.course_id,
#             'course_name': course.name if course else 'Unknown',
#             'user_id': self.user_id,
#             'user_name': user.name if user else 'Unknown',
#             'user_email': user.email if user else 'Unknown'
#         }

# class Rating(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     rating = db.Column(db.Integer, nullable=False)
#     review = db.Column(db.Text)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
#     note_id = db.Column(db.Integer, db.ForeignKey('note.id'), nullable=False)
#     user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
#     __table_args__ = (db.UniqueConstraint('note_id', 'user_id', name='unique_user_note_rating'),)

# # ==================== HELPER FUNCTIONS ====================

# def allowed_file(filename):
#     return '.' in filename and \
#            filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# def init_database():
#     """Initialize database"""
#     with app.app_context():
#         # Create all tables
#         db.create_all()
#         print(f"✅ Database created at: {DATABASE_PATH}")
        
#         # Create admin user
#         admin = User.query.filter_by(email='admin@noteshub.com').first()
#         if not admin:
#             admin = User(
#                 name='Admin',
#                 email='admin@noteshub.com',
#                 branch='Admin',
#                 semester=0,
#                 role='admin'
#             )
#             admin.set_password('admin123')
#             db.session.add(admin)
#             db.session.commit()
#             print("✅ Admin user created")
        
#         # Add sample courses if empty
#         if Course.query.count() == 0:
#             add_sample_courses()
        
#         print(f"✅ Database ready: {User.query.count()} users, {Course.query.count()} courses")

# def add_sample_courses():
#     """Add sample courses"""
#     sample_courses = [
#         {'name': 'Data Structures', 'branch': 'CSE', 'semester': 3, 'code': 'CSE301'},
#         {'name': 'Database Management', 'branch': 'CSE', 'semester': 4, 'code': 'CSE401'},
#         {'name': 'Computer Networks', 'branch': 'CSE', 'semester': 5, 'code': 'CSE501'},
#         {'name': 'Digital Electronics', 'branch': 'ECE', 'semester': 2, 'code': 'ECE202'},
#         {'name': 'Engineering Mathematics', 'branch': 'All', 'semester': 1, 'code': 'MAT101'},
#         {'name': 'Web Technologies', 'branch': 'BCA', 'semester': 3, 'code': 'BCA301'},
#         {'name': 'Principles of Management', 'branch': 'BBA', 'semester': 1, 'code': 'BBA101'},
#     ]
    
#     for course_data in sample_courses:
#         if not Course.query.filter_by(code=course_data['code']).first():
#             course = Course(**course_data)
#             db.session.add(course)
    
#     db.session.commit()
#     print(f"✅ Added {len(sample_courses)} sample courses")

# # ==================== AUTH ROUTES ====================

# @app.route('/api/auth/register', methods=['POST'])
# def register():
#     try:
#         data = request.get_json()
        
#         required = ['name', 'email', 'password', 'branch', 'semester']
#         for field in required:
#             if not data.get(field):
#                 return jsonify({'error': f'{field} is required'}), 400
        
#         if User.query.filter_by(email=data['email']).first():
#             return jsonify({'error': 'Email already registered'}), 409
        
#         user = User(
#             name=data['name'],
#             email=data['email'],
#             branch=data['branch'],
#             semester=data['semester'],
#             role=data.get('role', 'student')
#         )
#         user.set_password(data['password'])
        
#         db.session.add(user)
#         db.session.commit()
        
#         access_token = create_access_token(identity=user.id)
        
#         return jsonify({
#             'success': True,
#             'message': 'Registration successful',
#             'user': user.to_dict(),
#             'access_token': access_token
#         }), 201
        
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({'error': str(e)}), 500

# @app.route('/api/auth/login', methods=['POST'])
# def login():
#     try:
#         data = request.get_json()
        
#         if not data.get('email') or not data.get('password'):
#             return jsonify({'error': 'Email and password required'}), 400
        
#         user = User.query.filter_by(email=data['email']).first()
        
#         if not user or not user.check_password(data['password']):
#             return jsonify({'error': 'Invalid email or password'}), 401
        
#         access_token = create_access_token(identity=user.id)
        
#         return jsonify({
#             'success': True,
#             'message': 'Login successful',
#             'user': user.to_dict(),
#             'access_token': access_token
#         }), 200
        
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# # ==================== COURSE ROUTES ====================

# @app.route('/api/courses', methods=['GET'])
# def get_courses():
#     try:
#         branch = request.args.get('branch')
#         semester = request.args.get('semester')
        
#         query = Course.query
        
#         if branch and branch != 'All':
#             query = query.filter(Course.branch == branch)
#         if semester:
#             query = query.filter(Course.semester == int(semester))
        
#         courses = query.all()
        
#         return jsonify({
#             'success': True,
#             'courses': [course.to_dict() for course in courses],
#             'total': len(courses)
#         })
        
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# # ==================== NOTE/UPLOAD ROUTES ====================

# @app.route('/api/notes', methods=['GET'])
# def get_notes():
#     try:
#         course_id = request.args.get('course_id')
#         status = request.args.get('status', 'approved')
        
#         query = Note.query
        
#         if course_id:
#             query = query.filter(Note.course_id == int(course_id))
#         if status:
#             query = query.filter(Note.status == status)
        
#         notes = query.order_by(Note.uploaded_at.desc()).all()
        
#         return jsonify({
#             'success': True,
#             'notes': [note.to_dict() for note in notes],
#             'total': len(notes)
#         })
        
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# @app.route('/api/upload', methods=['POST'])
# @jwt_required()
# def upload_note():
#     """Main upload endpoint - SIMPLE VERSION"""
#     try:
#         user_id = get_jwt_identity()
#         user = User.query.get(user_id)
        
#         if not user:
#             return jsonify({'error': 'User not found'}), 404
        
#         # Check file
#         if 'file' not in request.files:
#             return jsonify({'error': 'No file uploaded'}), 400
        
#         file = request.files['file']
        
#         if file.filename == '':
#             return jsonify({'error': 'No file selected'}), 400
        
#         # Get form data
#         title = request.form.get('title', '').strip()
#         description = request.form.get('description', '').strip()
#         course_id = request.form.get('course_id')
        
#         if not title:
#             return jsonify({'error': 'Title is required'}), 400
#         if not course_id:
#             return jsonify({'error': 'Course is required'}), 400
        
#         # Check course exists
#         course = Course.query.get(course_id)
#         if not course:
#             return jsonify({'error': 'Course not found'}), 404
        
#         # Validate file type
#         if not allowed_file(file.filename):
#             return jsonify({'error': 'File type not allowed'}), 400
        
#         # Generate unique filename
#         original_filename = secure_filename(file.filename)
#         file_ext = original_filename.rsplit('.', 1)[1].lower()
#         unique_filename = f"{user_id}_{uuid.uuid4().hex}.{file_ext}"
        
#         # Save file
#         file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
#         file.save(file_path)
        
#         # Get file size
#         file_size = os.path.getsize(file_path)
        
#         # Auto-approve for admin, else pending
#         is_admin = user.role == 'admin'
        
#         # Create note
#         note = Note(
#             title=title,
#             description=description,
#             file_name=unique_filename,
#             original_filename=original_filename,
#             file_path=file_path,
#             file_type=file_ext,
#             file_size=file_size,
#             course_id=int(course_id),
#             user_id=user_id,
#             status='approved' if is_admin else 'pending',
#             uploaded_at=datetime.utcnow(),
#             approved_at=datetime.utcnow() if is_admin else None
#         )
        
#         db.session.add(note)
#         db.session.commit()
        
#         return jsonify({
#             'success': True,
#             'message': 'Upload successful!' + (' Auto-approved for admin.' if is_admin else ' Waiting for admin approval.'),
#             'note': note.to_dict(),
#             'file_url': f'/api/files/{unique_filename}'
#         }), 201
        
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({'error': str(e)}), 500

# @app.route('/api/notes/<int:note_id>/download', methods=['GET'])
# def download_note(note_id):
#     try:
#         note = Note.query.get(note_id)
        
#         if not note:
#             return jsonify({'error': 'Note not found'}), 404
        
#         if note.status != 'approved':
#             return jsonify({'error': 'Note is not approved yet'}), 403
        
#         # Increment download count
#         note.downloads += 1
#         db.session.commit()
        
#         # Send file
#         return send_file(
#             note.file_path,
#             as_attachment=True,
#             download_name=note.original_filename or note.file_name
#         )
        
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# # ==================== FILE SERVING ====================

# @app.route('/api/files/<filename>', methods=['GET'])
# def get_file(filename):
#     try:
#         return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
#     except FileNotFoundError:
#         return jsonify({'error': 'File not found'}), 404

# # ==================== ADMIN ROUTES ====================

# @app.route('/api/admin/pending-notes', methods=['GET'])
# @jwt_required()
# def get_pending_notes():
#     try:
#         user_id = get_jwt_identity()
#         user = User.query.get(user_id)
        
#         if user.role != 'admin':
#             return jsonify({'error': 'Admin access required'}), 403
        
#         pending = Note.query.filter_by(status='pending').order_by(Note.uploaded_at).all()
        
#         notes_data = []
#         for note in pending:
#             note_data = note.to_dict()
#             uploader = User.query.get(note.user_id)
#             course = Course.query.get(note.course_id)
#             note_data['uploader_name'] = uploader.name if uploader else 'Unknown'
#             note_data['course_name'] = course.name if course else 'Unknown'
#             notes_data.append(note_data)
        
#         return jsonify({
#             'success': True,
#             'notes': notes_data,
#             'count': len(notes_data)
#         })
        
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# @app.route('/api/admin/notes/<int:note_id>/approve', methods=['POST'])
# @jwt_required()
# def approve_note(note_id):
#     try:
#         user_id = get_jwt_identity()
#         user = User.query.get(user_id)
        
#         if user.role != 'admin':
#             return jsonify({'error': 'Admin access required'}), 403
        
#         note = Note.query.get(note_id)
#         if not note:
#             return jsonify({'error': 'Note not found'}), 404
        
#         note.status = 'approved'
#         note.approved_at = datetime.utcnow()
        
#         db.session.commit()
        
#         return jsonify({
#             'success': True,
#             'message': 'Note approved successfully',
#             'note': note.to_dict()
#         })
        
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({'error': str(e)}), 500

# # ==================== USER ROUTES ====================

# @app.route('/api/my-uploads', methods=['GET'])
# @jwt_required()
# def get_my_uploads():
#     try:
#         user_id = get_jwt_identity()
        
#         notes = Note.query.filter_by(user_id=user_id).order_by(Note.uploaded_at.desc()).all()
        
#         uploads = []
#         for note in notes:
#             note_data = note.to_dict()
#             course = Course.query.get(note.course_id)
#             note_data['course_name'] = course.name if course else 'Unknown'
#             uploads.append(note_data)
        
#         return jsonify({
#             'success': True,
#             'uploads': uploads,
#             'total': len(uploads)
#         })
        
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# # ==================== UTILITY ROUTES ====================

# @app.route('/api/health', methods=['GET'])
# def health_check():
#     try:
#         # Check database
#         db.session.execute('SELECT 1')
        
#         stats = {
#             'status': 'healthy',
#             'database': 'connected',
#             'timestamp': datetime.utcnow().isoformat(),
#             'counts': {
#                 'users': User.query.count(),
#                 'courses': Course.query.count(),
#                 'notes': Note.query.count(),
#                 'pending_notes': Note.query.filter_by(status='pending').count()
#             }
#         }
        
#         return jsonify({'success': True, **stats})
        
#     except Exception as e:
#         return jsonify({'error': str(e), 'status': 'unhealthy'}), 500

# @app.route('/api/seed', methods=['POST'])
# def seed_data():
#     """Seed database with sample data"""
#     try:
#         # Create test student
#         student = User.query.filter_by(email='student@test.com').first()
#         if not student:
#             student = User(
#                 name='Test Student',
#                 email='student@test.com',
#                 branch='CSE',
#                 semester=3,
#                 role='student'
#             )
#             student.set_password('student123')
#             db.session.add(student)
#             db.session.commit()
        
#         return jsonify({
#             'success': True,
#             'message': 'Database seeded successfully',
#             'users': {
#                 'admin': {'email': 'admin@noteshub.com', 'password': 'admin123'},
#                 'student': {'email': 'student@test.com', 'password': 'student123'}
#             },
#             'counts': {
#                 'courses': Course.query.count(),
#                 'users': User.query.count()
#             }
#         })
        
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({'error': str(e)}), 500

# # ==================== ROOT & INFO ====================

# @app.route('/', methods=['GET'])
# def home():
#     return jsonify({
#         'message': '🎉 Notes Hub API - SQLite Version',
#         'status': 'running',
#         'timestamp': datetime.utcnow().isoformat(),
#         'endpoints': {
#             'auth': ['POST /api/auth/login', 'POST /api/auth/register'],
#             'notes': ['GET /api/notes', 'POST /api/upload', 'GET /api/notes/:id/download'],
#             'courses': ['GET /api/courses'],
#             'user': ['GET /api/auth/profile', 'GET /api/my-uploads'],
#             'admin': ['GET /api/admin/pending-notes'],
#             'utility': ['GET /api/health', 'POST /api/seed']
#         },
#         'admin_login': {
#             'email': 'admin@noteshub.com',
#             'password': 'admin123'
#         }
#     })

# # ==================== START APPLICATION ====================

# if __name__ == '__main__':
#     # Initialize database
#     init_database()
    
#     print("=" * 60)
#     print("🚀 NOTES HUB BACKEND - SQLITE VERSION")
#     print("=" * 60)
#     print(f"📁 Database: {DATABASE_PATH}")
#     print(f"📁 Uploads: {UPLOAD_FOLDER}")
    
#     print("\n👤 Admin Credentials:")
#     print("   Email: admin@noteshub.com")
#     print("   Password: admin123")
    
#     print("\n📡 Quick Test:")
#     print("   1. Open: http://localhost:5000")
#     print("   2. Login: POST /api/auth/login")
#     print("   3. Upload: POST /api/upload")
#     print("   4. Admin panel: GET /api/admin/pending-notes")
    
#     print("\n💡 Tip: Run 'POST /api/seed' to create test student")
#     print("=" * 60)
    
#     app.run(debug=True, port=5000)


# app.py - Complete Working Version with Admin Routes

from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required,
    get_jwt_identity, create_refresh_token
)
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os
import uuid

# Initialize app
app = Flask(__name__)

# Config
basedir = os.path.abspath(os.path.dirname(__file__))
DATABASE_PATH = os.path.join(basedir, 'instance', 'noteshub.db')
UPLOAD_FOLDER = os.path.join(basedir, 'uploads')

os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['SECRET_KEY'] = 'notes-hub-secret-key-2024'
app.config['JWT_SECRET_KEY'] = 'jwt-super-secret-key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400  # 24 hours
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DATABASE_PATH}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB
app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png'}

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app, supports_credentials=True)

# ==================== MODELS ====================

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    branch = db.Column(db.String(50))
    semester = db.Column(db.Integer)
    role = db.Column(db.String(20), default='student')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'branch': self.branch,
            'semester': self.semester,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    branch = db.Column(db.String(50), nullable=False)
    semester = db.Column(db.Integer, nullable=False)
    code = db.Column(db.String(20), unique=True)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        note_count = Note.query.filter_by(course_id=self.id).count()
        return {
            'id': self.id,
            'name': self.name,
            'branch': self.branch,
            'semester': self.semester,
            'code': self.code,
            'description': self.description,
            'note_count': note_count,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    file_name = db.Column(db.String(200))
    original_filename = db.Column(db.String(200))
    file_path = db.Column(db.String(500))
    file_type = db.Column(db.String(20))
    file_size = db.Column(db.Integer)
    note_type = db.Column(db.String(20), default='notes')
    
    status = db.Column(db.String(20), default='pending')
    rejection_reason = db.Column(db.Text)
    downloads = db.Column(db.Integer, default=0)
    views = db.Column(db.Integer, default=0)
    
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    approved_at = db.Column(db.DateTime)
    
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    def to_dict(self):
        user = User.query.get(self.user_id)
        course = Course.query.get(self.course_id)
        
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'file_name': self.file_name,
            'original_filename': self.original_filename,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'note_type': self.note_type,
            'status': self.status,
            'rejection_reason': self.rejection_reason,
            'downloads': self.downloads,
            'views': self.views,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'course_id': self.course_id,
            'course_name': course.name if course else 'Unknown',
            'user_id': self.user_id,
            'user_name': user.name if user else 'Unknown',
            'user_email': user.email if user else 'Unknown'
        }

# ==================== HELPER FUNCTIONS ====================

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def init_database():
    with app.app_context():
        db.create_all()
        print(f"✅ Database created at: {DATABASE_PATH}")
        
        # Create admin
        admin = User.query.filter_by(email='admin@noteshub.com').first()
        if not admin:
            admin = User(
                name='Admin',
                email='admin@noteshub.com',
                branch='Admin',
                semester=0,
                role='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
        
        # Add courses if empty
        if Course.query.count() == 0:
            courses = [
                {'name': 'Data Structures', 'branch': 'CSE', 'semester': 3, 'code': 'CSE301'},
                {'name': 'Database Management', 'branch': 'CSE', 'semester': 4, 'code': 'CSE401'},
                {'name': 'Computer Networks', 'branch': 'CSE', 'semester': 5, 'code': 'CSE501'},
            ]
            for c in courses:
                course = Course(**c)
                db.session.add(course)
        
        db.session.commit()
        print(f"✅ Database ready: {User.query.count()} users, {Course.query.count()} courses")

# ==================== AUTH ROUTES ====================

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data.get('email') or not data.get('password'):
            return jsonify({'success': False, 'error': 'Email and password required'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        if not user or not user.check_password(data['password']):
            return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
        
        token = create_access_token(identity=user.id)
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': token
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        required = ['name', 'email', 'password', 'branch', 'semester']
        for field in required:
            if not data.get(field):
                return jsonify({'success': False, 'error': f'{field} required'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'success': False, 'error': 'Email already exists'}), 409
        
        user = User(
            name=data['name'],
            email=data['email'],
            branch=data['branch'],
            semester=data['semester'],
            role=data.get('role', 'student')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        token = create_access_token(identity=user.id)
        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'user': user.to_dict(),
            'access_token': token
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== ADMIN ROUTES ====================

@app.route('/api/admin/stats', methods=['GET'])
@jwt_required()
def admin_stats():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if user.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
        stats = {
            'total_users': User.query.count(),
            'total_courses': Course.query.count(),
            'total_notes': Note.query.count(),
            'approved_notes': Note.query.filter_by(status='approved').count(),
            'pending_notes': Note.query.filter_by(status='pending').count(),
            'rejected_notes': Note.query.filter_by(status='rejected').count(),
            'total_downloads': sum(n.downloads for n in Note.query.all()),
        }
        
        return jsonify({'success': True, 'stats': stats})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/pending-notes', methods=['GET'])
@jwt_required()
def get_pending_notes():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if user.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
        pending = Note.query.filter_by(status='pending').order_by(Note.uploaded_at).all()
        notes_data = []
        for note in pending:
            note_data = note.to_dict()
            uploader = User.query.get(note.user_id)
            course = Course.query.get(note.course_id)
            note_data['uploader_name'] = uploader.name if uploader else 'Unknown'
            note_data['course_name'] = course.name if course else 'Unknown'
            notes_data.append(note_data)
        
        return jsonify({
            'success': True,
            'notes': notes_data,
            'count': len(notes_data)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/notes/<int:note_id>/approve', methods=['POST'])
@jwt_required()
def approve_note(note_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if user.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
        note = Note.query.get(note_id)
        if not note:
            return jsonify({'success': False, 'error': 'Note not found'}), 404
        
        note.status = 'approved'
        note.approved_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Note approved',
            'note': note.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/notes/<int:note_id>/reject', methods=['POST'])
@jwt_required()
def reject_note(note_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if user.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
        data = request.get_json()
        reason = data.get('reason', 'No reason provided')
        
        note = Note.query.get(note_id)
        if not note:
            return jsonify({'success': False, 'error': 'Note not found'}), 404
        
        note.status = 'rejected'
        note.rejection_reason = reason
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Note rejected',
            'note': note.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== NOTE ROUTES ====================

@app.route('/api/notes', methods=['GET'])
def get_notes():
    try:
        course_id = request.args.get('course_id')
        status = request.args.get('status', 'approved')
        
        query = Note.query
        if course_id:
            query = query.filter_by(course_id=int(course_id))
        if status:
            query = query.filter_by(status=status)
        
        notes = query.order_by(Note.uploaded_at.desc()).all()
        return jsonify({
            'success': True,
            'notes': [note.to_dict() for note in notes],
            'total': len(notes)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/upload', methods=['POST'])
@jwt_required()
def upload_note():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        title = request.form.get('title', '').strip()
        course_id = request.form.get('course_id')
        if not title or not course_id:
            return jsonify({'success': False, 'error': 'Title and course required'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'success': False, 'error': 'File type not allowed'}), 400
        
        course = Course.query.get(course_id)
        if not course:
            return jsonify({'success': False, 'error': 'Course not found'}), 404
        
        original_filename = secure_filename(file.filename)
        file_ext = original_filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{user_id}_{uuid.uuid4().hex}.{file_ext}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        # Auto-approve for admin
        is_admin = user.role == 'admin'
        
        note = Note(
            title=title,
            description=request.form.get('description', ''),
            file_name=unique_filename,
            original_filename=original_filename,
            file_path=file_path,
            file_type=file_ext,
            file_size=os.path.getsize(file_path),
            course_id=int(course_id),
            user_id=user_id,
            status='approved' if is_admin else 'pending',
            uploaded_at=datetime.utcnow(),
            approved_at=datetime.utcnow() if is_admin else None
        )
        
        db.session.add(note)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Upload successful' + (' (auto-approved)' if is_admin else ' (pending approval)'),
            'note': note.to_dict(),
            'status': note.status
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/files/<filename>')
def get_file(filename):
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except:
        return jsonify({'success': False, 'error': 'File not found'}), 404

# ==================== UTILITY ROUTES ====================

@app.route('/api/courses', methods=['GET'])
def get_courses():
    try:
        courses = Course.query.all()
        return jsonify({
            'success': True,
            'courses': [course.to_dict() for course in courses],
            'total': len(courses)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'success': True,
        'status': 'healthy',
        'service': 'notes-hub',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/')
def home():
    return jsonify({
        'message': 'Notes Hub API',
        'version': '1.0',
        'endpoints': {
            'auth': ['POST /api/auth/login', 'POST /api/auth/register'],
            'notes': ['GET /api/notes', 'POST /api/upload', 'GET /api/files/<filename>'],
            'courses': ['GET /api/courses'],
            'admin': ['GET /api/admin/stats', 'GET /api/admin/pending-notes', 'POST /api/admin/notes/<id>/approve']
        }
    })

# ==================== START APP ====================

if __name__ == '__main__':
    init_database()
    print("\n" + "="*50)
    print("🚀 NOTES HUB BACKEND")
    print("="*50)
    print(f"📁 Database: {DATABASE_PATH}")
    print(f"📁 Uploads: {UPLOAD_FOLDER}")
    print("\n👤 Admin: admin@noteshub.com / admin123")
    print("\n📡 Running on http://localhost:5000")
    print("="*50)
    app.run(debug=True, port=5000)