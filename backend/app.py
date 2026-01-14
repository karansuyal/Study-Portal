# from flask import Flask, request, jsonify, send_file, send_from_directory
# from flask_cors import CORS
# from flask_sqlalchemy import SQLAlchemy
# from flask_jwt_extended import (
#     JWTManager, create_access_token, jwt_required,
#     get_jwt_identity, create_refresh_token
# )
# from werkzeug.utils import secure_filename
# from werkzeug.security import generate_password_hash, check_password_hash
# from datetime import datetime, timezone
# import os
# import uuid

# # Initialize app
# app = Flask(__name__)

# # Config
# basedir = os.path.abspath(os.path.dirname(__file__))
# DATABASE_PATH = os.path.join(basedir, 'instance', 'noteshub.db')
# UPLOAD_FOLDER = os.path.join(basedir, 'uploads')

# os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# app.config['SECRET_KEY'] = 'notes-hub-secret-key-2024'
# app.config['JWT_SECRET_KEY'] = 'jwt-super-secret-key'
# app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400  # 24 hours
# app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DATABASE_PATH}'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB
# app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png'}

# # Initialize extensions
# db = SQLAlchemy(app)
# jwt = JWTManager(app)
# CORS(app, supports_credentials=True)

# # ==================== MODELS ====================

# class User(db.Model):
#     __tablename__ = 'users'
    
#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(100), nullable=False)
#     email = db.Column(db.String(100), unique=True, nullable=False)
#     password = db.Column(db.String(200), nullable=False)
#     branch = db.Column(db.String(50))
#     semester = db.Column(db.Integer)
#     role = db.Column(db.String(20), default='student')
#     created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
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
#     __tablename__ = 'courses'
    
#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(200), nullable=False)
#     branch = db.Column(db.String(50), nullable=False)
#     semester = db.Column(db.Integer, nullable=False)
#     code = db.Column(db.String(20), unique=True)
#     description = db.Column(db.Text)
#     created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
#     def to_dict(self):
#         return {
#             'id': self.id,
#             'name': self.name,
#             'branch': self.branch,
#             'semester': self.semester,
#             'code': self.code,
#             'description': self.description,
#             'created_at': self.created_at.isoformat() if self.created_at else None
#         }

# class Subject(db.Model):
#     __tablename__ = 'subjects'
    
#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(200), nullable=False)
#     code = db.Column(db.String(20))
#     semester = db.Column(db.Integer, nullable=False)
#     course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    
#     def to_dict(self):
#         return {
#             'id': self.id,
#             'name': self.name,
#             'code': self.code,
#             'semester': self.semester,
#             'course_id': self.course_id
#         }

# class Note(db.Model):
#     __tablename__ = 'notes'
    
#     id = db.Column(db.Integer, primary_key=True)
#     title = db.Column(db.String(200), nullable=False)
#     description = db.Column(db.Text)
#     file_name = db.Column(db.String(200))
#     original_filename = db.Column(db.String(200))
#     file_path = db.Column(db.String(500))
#     file_type = db.Column(db.String(20))
#     file_size = db.Column(db.Integer)
#     note_type = db.Column(db.String(20), default='notes')
    
#     status = db.Column(db.String(20), default='pending')
#     rejection_reason = db.Column(db.Text)
#     downloads = db.Column(db.Integer, default=0)
#     views = db.Column(db.Integer, default=0)
    
#     uploaded_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
#     approved_at = db.Column(db.DateTime)
    
#     # Foreign keys
#     course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
#     user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
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
#             'note_type': self.note_type,
#             'status': self.status,
#             'rejection_reason': self.rejection_reason,
#             'downloads': self.downloads,
#             'views': self.views,
#             'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
#             'approved_at': self.approved_at.isoformat() if self.approved_at else None,
#             'course_id': self.course_id,
#             'course_name': course.name if course else 'Unknown',
#             'user_id': self.user_id,
#             'user_name': user.name if user else 'Unknown',
#             'user_email': user.email if user else 'Unknown'
#         }

# class StudyMaterial(db.Model):
#     __tablename__ = 'study_materials'
    
#     id = db.Column(db.Integer, primary_key=True)
#     title = db.Column(db.String(200), nullable=False)
#     description = db.Column(db.Text)
#     file_name = db.Column(db.String(200))
#     original_filename = db.Column(db.String(200))
#     file_path = db.Column(db.String(500))
#     file_type = db.Column(db.String(20))
#     file_size = db.Column(db.Integer)
#     material_type = db.Column(db.String(20))  # notes, pyq, syllabus, imp_questions
    
#     status = db.Column(db.String(20), default='pending')
#     downloads = db.Column(db.Integer, default=0)
#     views = db.Column(db.Integer, default=0)
#     uploaded_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
#     approved_at = db.Column(db.DateTime)
    
#     # Foreign keys
#     subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'), nullable=False)
#     user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
#     def to_dict(self):
#         user = User.query.get(self.user_id)
#         subject = Subject.query.get(self.subject_id)
#         course = Course.query.get(subject.course_id) if subject else None
        
#         return {
#             'id': self.id,
#             'title': self.title,
#             'description': self.description,
#             'file_name': self.file_name,
#             'original_filename': self.original_filename,
#             'file_type': self.file_type,
#             'file_size': self.file_size,
#             'material_type': self.material_type,
#             'status': self.status,
#             'downloads': self.downloads,
#             'views': self.views,
#             'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
#             'approved_at': self.approved_at.isoformat() if self.approved_at else None,
#             'subject_id': self.subject_id,
#             'subject_name': subject.name if subject else 'Unknown',
#             'course_id': subject.course_id if subject else None,
#             'course_name': course.name if course else 'Unknown',
#             'user_id': self.user_id,
#             'user_name': user.name if user else 'Unknown',
#             'user_email': user.email if user else 'Unknown'
#         }

# # ==================== HELPER FUNCTIONS ====================

# def allowed_file(filename):
#     return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# def create_subject_folder(course_name, semester, subject_name, material_type):
#     """Create organized folder path"""
#     safe_course = course_name.replace(' ', '_').replace('(', '').replace(')', '')
#     safe_subject = subject_name.replace(' ', '_').replace('&', 'and').replace('/', '_')
    
#     folder_path = os.path.join(
#         app.config['UPLOAD_FOLDER'],
#         'courses',
#         safe_course,
#         f"Semester_{semester}",
#         safe_subject,
#         material_type
#     )
    
#     os.makedirs(folder_path, exist_ok=True)
#     return folder_path

# def init_database():
#     with app.app_context():
#         db.create_all()
#         print(f"✅ Database created at: {DATABASE_PATH}")
        
#         # Create admin if not exists
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
#             print("✅ Admin user created")
        
#         # Create test student if not exists
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
#             print("✅ Test student created")
        
#         # Add sample courses if empty
#         if Course.query.count() == 0:
#             courses = [
#                 {'name': 'Data Structures', 'branch': 'CSE', 'semester': 3, 'code': 'CSE301'},
#                 {'name': 'Database Management', 'branch': 'CSE', 'semester': 4, 'code': 'CSE401'},
#                 {'name': 'Computer Networks', 'branch': 'CSE', 'semester': 5, 'code': 'CSE501'},
#                 {'name': 'Operating Systems', 'branch': 'CSE', 'semester': 4, 'code': 'CSE402'},
#                 {'name': 'Digital Electronics', 'branch': 'ECE', 'semester': 2, 'code': 'ECE202'},
#                 {'name': 'Circuit Theory', 'branch': 'ECE', 'semester': 3, 'code': 'ECE301'},
#                 {'name': 'Engineering Mathematics', 'branch': 'All', 'semester': 1, 'code': 'MAT101'},
#                 {'name': 'Engineering Physics', 'branch': 'All', 'semester': 1, 'code': 'PHY101'},
#                 {'name': 'Programming in C', 'branch': 'BCA', 'semester': 1, 'code': 'BCA101'},
#                 {'name': 'Principles of Management', 'branch': 'BBA', 'semester': 1, 'code': 'BBA101'},
#             ]
#             for c in courses:
#                 course = Course(**c)
#                 db.session.add(course)
#             print("✅ Sample courses added")
        
#         db.session.commit()
#         print(f"✅ Database ready: {User.query.count()} users, {Course.query.count()} courses")

# # ==================== SIMPLE HEALTH CHECK ====================

# @app.route('/api/health', methods=['GET'])
# def health():
#     """Simple health check without complex queries"""
#     try:
#         # Test database connection
#         db.session.execute('SELECT 1')
        
#         return jsonify({
#             'success': True,
#             'status': 'healthy',
#             'service': 'notes-hub',
#             'timestamp': datetime.now(timezone.utc).isoformat(),
#             'database': 'connected',
#             'message': 'API is running'
#         })
#     except Exception as e:
#         return jsonify({
#             'success': False,
#             'status': 'unhealthy',
#             'error': str(e),
#             'timestamp': datetime.now(timezone.utc).isoformat()
#         }), 500

# @app.route('/api/test', methods=['GET'])
# def test():
#     return jsonify({
#         'success': True,
#         'message': 'API is working',
#         'timestamp': datetime.now(timezone.utc).isoformat()
#     })

# # ==================== AUTH ROUTES ====================

# @app.route('/api/auth/login', methods=['POST'])
# def login():
#     try:
#         data = request.get_json()
#         if not data.get('email') or not data.get('password'):
#             return jsonify({'success': False, 'error': 'Email and password required'}), 400
        
#         user = User.query.filter_by(email=data['email']).first()
#         if not user or not user.check_password(data['password']):
#             return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
        
#         token = create_access_token(identity=str(user.id))
#         return jsonify({
#             'success': True,
#             'message': 'Login successful',
#             'user': user.to_dict(),
#             'access_token': token
#         })
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500

# @app.route('/api/auth/register', methods=['POST'])
# def register():
#     try:
#         data = request.get_json()
#         required = ['name', 'email', 'password', 'branch', 'semester']
#         for field in required:
#             if not data.get(field):
#                 return jsonify({'success': False, 'error': f'{field} required'}), 400
        
#         if User.query.filter_by(email=data['email']).first():
#             return jsonify({'success': False, 'error': 'Email already exists'}), 409
        
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
        
#         token = create_access_token(identity=str(user.id))
#         return jsonify({
#             'success': True,
#             'message': 'Registration successful',
#             'user': user.to_dict(),
#             'access_token': token
#         }), 201
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({'success': False, 'error': str(e)}), 500

# @app.route('/api/auth/profile', methods=['GET'])
# @jwt_required()
# def get_profile():
#     try:
#         user_id = get_jwt_identity()
#         user = User.query.get(int(user_id))
        
#         if not user:
#             return jsonify({'success': False, 'error': 'User not found'}), 404
        
#         return jsonify({
#             'success': True,
#             'user': user.to_dict()
#         })
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500

# # ==================== COURSE ROUTES ====================

# @app.route('/api/courses', methods=['GET'])
# def get_all_courses():
#     courses = Course.query.all()
#     return jsonify({'success': True, 'courses': [c.to_dict() for c in courses]})

# # ==================== SUBJECT ROUTES ====================

# @app.route('/api/courses/<int:course_id>/semester/<int:semester>/subjects', methods=['GET'])
# def get_subjects(course_id, semester):
#     subjects = Subject.query.filter_by(course_id=course_id, semester=semester).all()
#     return jsonify({'success': True, 'subjects': [s.to_dict() for s in subjects]})

# @app.route('/api/subjects/<int:subject_id>/materials', methods=['GET'])
# def get_subject_materials(subject_id):
#     materials = StudyMaterial.query.filter_by(subject_id=subject_id, status='approved').all()
    
#     # Organize by material type
#     organized = {
#         'notes': [],
#         'pyq': [],
#         'syllabus': [],
#         'imp_questions': []
#     }
    
#     for material in materials:
#         mat_data = material.to_dict()
#         organized[material.material_type].append(mat_data)
    
#     return jsonify({
#         'success': True,
#         'materials': organized
#     })

# # ==================== STUDY MATERIAL UPLOAD ====================

# @app.route('/api/upload-study-material', methods=['POST'])
# @jwt_required()
# def upload_study_material():
#     try:
#         user_id = get_jwt_identity()
#         user = User.query.get(int(user_id))
        
#         if not user:
#             return jsonify({'success': False, 'error': 'User not found'}), 404
        
#         # Get form data
#         course_name = request.form.get('course_name')
#         semester = request.form.get('semester')
#         subject_name = request.form.get('subject_name')
#         material_type = request.form.get('material_type', 'notes')
#         title = request.form.get('title', '').strip()
#         description = request.form.get('description', '').strip()
        
#         if 'file' not in request.files:
#             return jsonify({'success': False, 'error': 'No file uploaded'}), 400
        
#         file = request.files['file']
        
#         if not all([course_name, semester, subject_name, title, file.filename]):
#             return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        
#         # Create folder
#         folder_path = create_subject_folder(course_name, semester, subject_name, material_type)
        
#         # Save file
#         original_filename = secure_filename(file.filename)
#         file_ext = original_filename.rsplit('.', 1)[1].lower()
#         unique_filename = f"{subject_name.replace(' ', '_')}_{material_type}_{uuid.uuid4().hex[:8]}.{file_ext}"
#         file_path = os.path.join(folder_path, unique_filename)
        
#         file.save(file_path)
#         file_size = os.path.getsize(file_path)
        
#         # Get or create subject
#         # First find course
#         course = Course.query.filter_by(name=course_name).first()
#         if not course:
#             course = Course(
#                 name=course_name, 
#                 branch=course_name.split()[0] if ' ' in course_name else course_name,
#                 semester=int(semester)
#             )
#             db.session.add(course)
#             db.session.commit()
        
#         # Find or create subject
#         subject = Subject.query.filter_by(
#             name=subject_name,
#             course_id=course.id,
#             semester=int(semester)
#         ).first()
        
#         if not subject:
#             subject = Subject(
#                 name=subject_name,
#                 code=f"{course_name[:3]}_{semester}_{subject_name[:3]}",
#                 semester=int(semester),
#                 course_id=course.id
#             )
#             db.session.add(subject)
#             db.session.commit()
        
#         # Create material
#         material = StudyMaterial(
#             title=title,
#             description=description,
#             file_name=unique_filename,
#             original_filename=original_filename,
#             file_path=file_path,
#             file_type=file_ext,
#             file_size=file_size,
#             material_type=material_type,
#             subject_id=subject.id,
#             user_id=user.id,
#             status='approved' if user.role == 'admin' else 'pending',
#             approved_at=datetime.now(timezone.utc) if user.role == 'admin' else None
#         )
        
#         db.session.add(material)
#         db.session.commit()
        
#         return jsonify({
#             'success': True,
#             'message': 'Material uploaded successfully!' + 
#                       (' Auto-approved for admin.' if user.role == 'admin' else ' Waiting for admin approval.'),
#             'material': material.to_dict(),
#             'folder_structure': {
#                 'course': course_name,
#                 'semester': semester,
#                 'subject': subject_name,
#                 'material_type': material_type,
#                 'file_path': file_path
#             }
#         }), 201
        
#     except Exception as e:
#         db.session.rollback()
#         print(f"Upload error: {str(e)}")
#         return jsonify({'success': False, 'error': str(e)}), 500

# # ==================== NOTE ROUTES (EXISTING) ====================

# @app.route('/api/notes', methods=['GET'])
# def get_notes():
#     try:
#         course_id = request.args.get('course_id')
#         status = request.args.get('status', 'approved')
        
#         query = Note.query
#         if course_id:
#             query = query.filter_by(course_id=int(course_id))
#         if status:
#             query = query.filter_by(status=status)
        
#         notes = query.order_by(Note.uploaded_at.desc()).all()
#         return jsonify({
#             'success': True,
#             'notes': [note.to_dict() for note in notes],
#             'total': len(notes)
#         })
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500

# @app.route('/api/notes/<int:note_id>', methods=['GET'])
# def get_note_detail(note_id):
#     try:
#         note = Note.query.get(note_id)
#         if not note:
#             return jsonify({'success': False, 'error': 'Note not found'}), 404
        
#         # Increment view count
#         note.views += 1
#         db.session.commit()
        
#         return jsonify({
#             'success': True,
#             'note': note.to_dict()
#         })
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500

# # ==================== EXISTING UPLOAD ROUTE ====================

# @app.route('/api/upload', methods=['POST'])
# @jwt_required()
# def upload_note():
#     try:
#         # Get user ID from JWT token
#         user_id_str = get_jwt_identity()
#         user_id = int(user_id_str)
        
#         user = User.query.get(user_id)
#         if not user:
#             return jsonify({'success': False, 'error': 'User not found. Please login again.'}), 404
        
#         print(f"Upload attempt by: {user.name} ({user.email})")
        
#         # Check if file is present
#         if 'file' not in request.files:
#             return jsonify({'success': False, 'error': 'No file uploaded'}), 400
        
#         file = request.files['file']
        
#         if file.filename == '':
#             return jsonify({'success': False, 'error': 'No file selected'}), 400
        
#         # Get form data
#         title = request.form.get('title', '').strip()
#         description = request.form.get('description', '').strip()
#         course_id = request.form.get('course_id')
#         note_type = request.form.get('type', 'notes')
        
#         if not title:
#             return jsonify({'success': False, 'error': 'Title is required'}), 400
#         if not course_id:
#             return jsonify({'success': False, 'error': 'Course is required'}), 400
        
#         # Validate file type
#         if not allowed_file(file.filename):
#             return jsonify({'success': False, 'error': 'File type not allowed'}), 400
        
#         # Check course exists
#         course = Course.query.get(int(course_id))
#         if not course:
#             return jsonify({'success': False, 'error': 'Course not found'}), 404
        
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
#             note_type=note_type,
#             course_id=int(course_id),
#             user_id=user_id,
#             status='approved' if is_admin else 'pending',
#             uploaded_at=datetime.now(timezone.utc),
#             approved_at=datetime.now(timezone.utc) if is_admin else None
#         )
        
#         db.session.add(note)
#         db.session.commit()
        
#         response_data = {
#             'success': True,
#             'message': 'File uploaded successfully!' + (' Auto-approved for admin.' if is_admin else ' Waiting for admin approval.'),
#             'note': note.to_dict(),
#             'file_url': f'/api/files/{unique_filename}',
#             'status': note.status
#         }
        
#         return jsonify(response_data), 201
        
#     except Exception as e:
#         db.session.rollback()
#         print(f"Upload error: {str(e)}")
#         return jsonify({'success': False, 'error': str(e)}), 500

# # ==================== FILE SERVING ====================

# @app.route('/api/files/<filename>', methods=['GET'])
# def get_file(filename):
#     try:
#         return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
#     except:
#         return jsonify({'success': False, 'error': 'File not found'}), 404

# @app.route('/api/notes/<int:note_id>/download', methods=['GET'])
# def download_note(note_id):
#     try:
#         note = Note.query.get(note_id)
#         if not note:
#             return jsonify({'success': False, 'error': 'Note not found'}), 404
        
#         if note.status != 'approved':
#             return jsonify({'success': False, 'error': 'Note is not approved yet'}), 403
        
#         # Check if file exists
#         if not os.path.exists(note.file_path):
#             return jsonify({'success': False, 'error': 'File not found on server'}), 404
        
#         # Increment download count
#         note.downloads += 1
#         db.session.commit()
        
#         return send_file(
#             note.file_path,
#             as_attachment=True,
#             download_name=note.original_filename
#         )
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500

# @app.route('/api/materials/<int:material_id>/download', methods=['GET'])
# def download_material(material_id):
#     try:
#         material = StudyMaterial.query.get(material_id)
#         if not material:
#             return jsonify({'success': False, 'error': 'Material not found'}), 404
        
#         if material.status != 'approved':
#             return jsonify({'success': False, 'error': 'Material is not approved yet'}), 403
        
#         # Check if file exists
#         if not os.path.exists(material.file_path):
#             return jsonify({'success': False, 'error': 'File not found on server'}), 404
        
#         # Increment download count
#         material.downloads += 1
#         db.session.commit()
        
#         return send_file(
#             material.file_path,
#             as_attachment=True,
#             download_name=material.original_filename
#         )
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500

# # ==================== ADMIN ROUTES ====================

# @app.route('/api/admin/stats', methods=['GET'])
# @jwt_required()
# def admin_stats():
#     try:
#         user_id = get_jwt_identity()
#         user = User.query.get(int(user_id))
#         if not user or user.role != 'admin':
#             return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
#         stats = {
#             'total_users': User.query.count(),
#             'total_courses': Course.query.count(),
#             'total_notes': Note.query.count(),
#             'approved_notes': Note.query.filter_by(status='approved').count(),
#             'pending_notes': Note.query.filter_by(status='pending').count(),
#             'rejected_notes': Note.query.filter_by(status='rejected').count(),
#             'total_materials': StudyMaterial.query.count(),
#             'approved_materials': StudyMaterial.query.filter_by(status='approved').count(),
#             'pending_materials': StudyMaterial.query.filter_by(status='pending').count(),
#             'total_downloads': sum(n.downloads for n in Note.query.all()) + 
#                               sum(m.downloads for m in StudyMaterial.query.all()),
#         }
        
#         return jsonify({'success': True, 'stats': stats})
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500

# @app.route('/api/admin/pending-notes', methods=['GET'])
# @jwt_required()
# def get_pending_notes():
#     try:
#         user_id = get_jwt_identity()
#         user = User.query.get(int(user_id))
#         if not user or user.role != 'admin':
#             return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
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
#         return jsonify({'success': False, 'error': str(e)}), 500

# @app.route('/api/admin/pending-materials', methods=['GET'])
# @jwt_required()
# def get_pending_materials():
#     try:
#         user_id = get_jwt_identity()
#         user = User.query.get(int(user_id))
#         if not user or user.role != 'admin':
#             return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
#         pending = StudyMaterial.query.filter_by(status='pending').order_by(StudyMaterial.uploaded_at).all()
#         materials_data = []
#         for material in pending:
#             mat_data = material.to_dict()
#             uploader = User.query.get(material.user_id)
#             subject = Subject.query.get(material.subject_id)
#             course = Course.query.get(subject.course_id) if subject else None
            
#             mat_data['uploader_name'] = uploader.name if uploader else 'Unknown'
#             mat_data['subject_name'] = subject.name if subject else 'Unknown'
#             mat_data['course_name'] = course.name if course else 'Unknown'
#             materials_data.append(mat_data)
        
#         return jsonify({
#             'success': True,
#             'materials': materials_data,
#             'count': len(materials_data)
#         })
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500

# @app.route('/api/admin/notes/<int:note_id>/approve', methods=['POST'])
# @jwt_required()
# def approve_note(note_id):
#     try:
#         user_id = get_jwt_identity()
#         user = User.query.get(int(user_id))
#         if not user or user.role != 'admin':
#             return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
#         note = Note.query.get(note_id)
#         if not note:
#             return jsonify({'success': False, 'error': 'Note not found'}), 404
        
#         note.status = 'approved'
#         note.approved_at = datetime.now(timezone.utc)
#         db.session.commit()
        
#         return jsonify({
#             'success': True,
#             'message': 'Note approved successfully',
#             'note': note.to_dict()
#         })
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({'success': False, 'error': str(e)}), 500

# @app.route('/api/admin/materials/<int:material_id>/approve', methods=['POST'])
# @jwt_required()
# def approve_material(material_id):
#     try:
#         user_id = get_jwt_identity()
#         user = User.query.get(int(user_id))
#         if not user or user.role != 'admin':
#             return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
#         material = StudyMaterial.query.get(material_id)
#         if not material:
#             return jsonify({'success': False, 'error': 'Material not found'}), 404
        
#         material.status = 'approved'
#         material.approved_at = datetime.now(timezone.utc)
#         db.session.commit()
        
#         return jsonify({
#             'success': True,
#             'message': 'Material approved successfully',
#             'material': material.to_dict()
#         })
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({'success': False, 'error': str(e)}), 500

# @app.route('/api/admin/notes/<int:note_id>/reject', methods=['POST'])
# @jwt_required()
# def reject_note(note_id):
#     try:
#         user_id = get_jwt_identity()
#         user = User.query.get(int(user_id))
#         if not user or user.role != 'admin':
#             return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
#         data = request.get_json()
#         reason = data.get('reason', 'No reason provided')
        
#         note = Note.query.get(note_id)
#         if not note:
#             return jsonify({'success': False, 'error': 'Note not found'}), 404
        
#         note.status = 'rejected'
#         note.rejection_reason = reason
#         db.session.commit()
        
#         return jsonify({
#             'success': True,
#             'message': 'Note rejected successfully',
#             'note': note.to_dict()
#         })
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({'success': False, 'error': str(e)}), 500

# @app.route('/api/admin/materials/<int:material_id>/reject', methods=['POST'])
# @jwt_required()
# def reject_material(material_id):
#     try:
#         user_id = get_jwt_identity()
#         user = User.query.get(int(user_id))
#         if not user or user.role != 'admin':
#             return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
#         data = request.get_json()
#         reason = data.get('reason', 'No reason provided')
        
#         material = StudyMaterial.query.get(material_id)
#         if not material:
#             return jsonify({'success': False, 'error': 'Material not found'}), 404
        
#         material.status = 'rejected'
#         material.description = reason  # Using description field for rejection reason
#         db.session.commit()
        
#         return jsonify({
#             'success': True,
#             'message': 'Material rejected successfully',
#             'material': material.to_dict()
#         })
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({'success': False, 'error': str(e)}), 500

# # ==================== USER ROUTES ====================

# @app.route('/api/my-uploads', methods=['GET'])
# @jwt_required()
# def get_my_uploads():
#     try:
#         user_id = get_jwt_identity()
#         user = User.query.get(int(user_id))
        
#         if not user:
#             return jsonify({'success': False, 'error': 'User not found'}), 404
        
#         notes = Note.query.filter_by(user_id=user.id).order_by(Note.uploaded_at.desc()).all()
#         materials = StudyMaterial.query.filter_by(user_id=user.id).order_by(StudyMaterial.uploaded_at.desc()).all()
        
#         uploads = []
#         for note in notes:
#             note_data = note.to_dict()
#             course = Course.query.get(note.course_id)
#             note_data['type'] = 'note'
#             note_data['course_name'] = course.name if course else 'Unknown'
#             uploads.append(note_data)
        
#         for material in materials:
#             mat_data = material.to_dict()
#             subject = Subject.query.get(material.subject_id)
#             course = Course.query.get(subject.course_id) if subject else None
#             mat_data['type'] = 'material'
#             mat_data['course_name'] = course.name if course else 'Unknown'
#             uploads.append(mat_data)
        
#         # Sort by upload date
#         uploads.sort(key=lambda x: x['uploaded_at'], reverse=True)
        
#         return jsonify({
#             'success': True,
#             'uploads': uploads,
#             'total': len(uploads),
#             'stats': {
#                 'notes': len(notes),
#                 'materials': len(materials),
#                 'approved': len([u for u in uploads if u['status'] == 'approved']),
#                 'pending': len([u for u in uploads if u['status'] == 'pending']),
#                 'rejected': len([u for u in uploads if u['status'] == 'rejected'])
#             }
#         })
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500

# # ==================== UTILITY ROUTES ====================

# @app.route('/api/reset-db', methods=['POST'])
# def reset_database():
#     """Reset database (development only)"""
#     try:
#         with app.app_context():
#             # Drop all tables
#             db.drop_all()
#             print("Database dropped")
            
#             # Recreate with sample data
#             init_database()
            
#         return jsonify({
#             'success': True,
#             'message': 'Database reset successfully'
#         })
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500

# # ==================== ROOT ROUTE ====================

# @app.route('/')
# def home():
#     return jsonify({
#         'message': 'Notes Hub API',
#         'version': '1.0',
#         'status': 'running',
#         'timestamp': datetime.now(timezone.utc).isoformat(),
#         'endpoints': {
#             'auth': ['POST /api/auth/login', 'POST /api/auth/register', 'GET /api/auth/profile'],
#             'courses': ['GET /api/courses'],
#             'subjects': ['GET /api/courses/<id>/semester/<sem>/subjects'],
#             'materials': ['GET /api/subjects/<id>/materials'],
#             'upload': ['POST /api/upload', 'POST /api/upload-study-material'],
#             'notes': ['GET /api/notes', 'GET /api/notes/<id>', 'GET /api/notes/<id>/download'],
#             'download': ['GET /api/materials/<id>/download'],
#             'admin': ['GET /api/admin/stats', 'GET /api/admin/pending-notes', 'GET /api/admin/pending-materials'],
#             'user': ['GET /api/my-uploads'],
#             'utility': ['GET /api/health', 'GET /api/test', 'POST /api/reset-db']
#         },
#         'credentials': {
#             'admin': {'email': 'admin@noteshub.com', 'password': 'admin123'},
#             'student': {'email': 'student@test.com', 'password': 'student123'}
#         }
#     })

# # ==================== ERROR HANDLERS ====================

# @app.errorhandler(404)
# def not_found(error):
#     return jsonify({'success': False, 'error': 'Endpoint not found'}), 404

# @app.errorhandler(405)
# def method_not_allowed(error):
#     return jsonify({'success': False, 'error': 'Method not allowed'}), 405

# @app.errorhandler(500)
# def internal_error(error):
#     return jsonify({'success': False, 'error': 'Internal server error'}), 500

# @jwt.unauthorized_loader
# def unauthorized_response(callback):
#     return jsonify({'success': False, 'error': 'Authentication required'}), 401

# # ==================== START APP ====================

# if __name__ == '__main__':
#     init_database()
#     print("\n" + "="*60)
#     print("NOTES HUB BACKEND")
#     print("="*60)
#     print(f"Database: {DATABASE_PATH}")
#     print(f"Uploads: {UPLOAD_FOLDER}")
    
#     print("\nPre-configured Users:")
#     print("  Admin: admin@noteshub.com / admin123")
#     print("  Student: student@test.com / student123")
    
#     print("\nAPI Endpoints:")
#     print("  GET  /api/courses - List all courses")
#     print("  POST /api/upload-study-material - Upload study materials")
#     print("  GET  /api/subjects/<id>/materials - Get subject materials")
    
#     print("\nNew Features:")
#     print("  ✅ Organized folder structure: uploads/courses/")
#     print("  ✅ Subject-wise material organization")
#     print("  ✅ 4 material types: notes, pyq, syllabus, imp_questions")
    
#     print("\nServer URLs:")
#     print("  Local: http://localhost:5000")
#     print("  Network: http://<your-ip>:5000")
#     print("="*60 + "\n")
    
#     app.run(debug=True, host='0.0.0.0', port=5000)  
    



from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required,
    get_jwt_identity, create_refresh_token
)
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone
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
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    branch = db.Column(db.String(50))
    semester = db.Column(db.Integer)
    role = db.Column(db.String(20), default='student')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
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
    __tablename__ = 'courses'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    branch = db.Column(db.String(50), nullable=False)
    semester = db.Column(db.Integer, nullable=False)
    code = db.Column(db.String(20), unique=True)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'branch': self.branch,
            'semester': self.semester,
            'code': self.code,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Subject(db.Model):
    __tablename__ = 'subjects'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    code = db.Column(db.String(20))
    semester = db.Column(db.Integer, nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'semester': self.semester,
            'course_id': self.course_id
        }

class Note(db.Model):
    __tablename__ = 'notes'
    
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
    
    uploaded_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    approved_at = db.Column(db.DateTime)
    
    # Foreign keys
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
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

class StudyMaterial(db.Model):
    __tablename__ = 'study_materials'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    file_name = db.Column(db.String(200))
    original_filename = db.Column(db.String(200))
    file_path = db.Column(db.String(500))
    file_type = db.Column(db.String(20))
    file_size = db.Column(db.Integer)
    material_type = db.Column(db.String(20))  # notes, pyq, syllabus, imp_questions
    
    status = db.Column(db.String(20), default='pending')
    downloads = db.Column(db.Integer, default=0)
    views = db.Column(db.Integer, default=0)
    uploaded_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    approved_at = db.Column(db.DateTime)
    
    # Foreign keys - FIXED: Added course_id
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    def to_dict(self):
        user = User.query.get(self.user_id)
        subject = Subject.query.get(self.subject_id) if self.subject_id else None
        course = Course.query.get(self.course_id)
        
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'file_name': self.file_name,
            'original_filename': self.original_filename,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'material_type': self.material_type,
            'status': self.status,
            'downloads': self.downloads,
            'views': self.views,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'course_id': self.course_id,
            'course_name': course.name if course else 'Unknown',
            'subject_id': self.subject_id,
            'subject_name': subject.name if subject else 'General',
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
        
        # Create admin if not exists
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
            print("✅ Admin user created")
        
        # Create test student if not exists
        student = User.query.filter_by(email='student@test.com').first()
        if not student:
            student = User(
                name='Test Student',
                email='student@test.com',
                branch='CSE',
                semester=3,
                role='student'
            )
            student.set_password('student123')
            db.session.add(student)
            print("✅ Test student created")
        
        # Add sample courses if empty
        if Course.query.count() == 0:
            courses = [
                {'name': 'B.Tech CSE', 'branch': 'CSE', 'semester': 0, 'code': 'BTECH_CSE'},
                {'name': 'BCA', 'branch': 'Computer Applications', 'semester': 0, 'code': 'BCA'},
                {'name': 'BBA', 'branch': 'Business', 'semester': 0, 'code': 'BBA'},
                {'name': 'MBA', 'branch': 'Management', 'semester': 0, 'code': 'MBA'},
                {'name': 'MCA', 'branch': 'Computer Applications', 'semester': 0, 'code': 'MCA'},
            ]
            for c in courses:
                course = Course(**c)
                db.session.add(course)
            print("✅ Sample courses added")
        
        db.session.commit()
        print(f"✅ Database ready: {User.query.count()} users, {Course.query.count()} courses")

# ==================== SIMPLE HEALTH CHECK ====================

@app.route('/api/health', methods=['GET'])
def health():
    """Simple health check"""
    try:
        # Test database connection
        db.session.execute('SELECT 1')
        
        return jsonify({
            'success': True,
            'status': 'healthy',
            'service': 'notes-hub',
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'database': 'connected',
            'message': 'API is running'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }), 500

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({
        'success': True,
        'message': 'API is working',
        'timestamp': datetime.now(timezone.utc).isoformat()
    })

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
        
        token = create_access_token(identity=str(user.id))
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
        
        token = create_access_token(identity=str(user.id))
        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'user': user.to_dict(),
            'access_token': token
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/auth/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== COURSE ROUTES ====================

@app.route('/api/courses', methods=['GET'])
def get_all_courses():
    courses = Course.query.all()
    return jsonify({'success': True, 'courses': [c.to_dict() for c in courses]})

@app.route('/api/programs', methods=['GET'])
def get_programs():
    """Alternative endpoint for frontend compatibility"""
    courses = Course.query.all()
    return jsonify({
        'success': True,
        'programs': [
            {
                'id': c.id,
                'name': c.name,
                'code': c.code,
                'branch': c.branch
            } for c in courses
        ]
    })

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

@app.route('/api/notes/<int:note_id>', methods=['GET'])
def get_note_detail(note_id):
    try:
        note = Note.query.get(note_id)
        if not note:
            return jsonify({'success': False, 'error': 'Note not found'}), 404
        
        # Increment view count
        note.views += 1
        db.session.commit()
        
        return jsonify({
            'success': True,
            'note': note.to_dict()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== UPLOAD ROUTES ====================

@app.route('/api/upload', methods=['POST'])
@jwt_required()
def upload_note():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        # Get form data
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        course_id = request.form.get('course_id')
        note_type = request.form.get('type', 'notes')
        
        if not title:
            return jsonify({'success': False, 'error': 'Title is required'}), 400
        if not course_id:
            return jsonify({'success': False, 'error': 'Course is required'}), 400
        
        # Validate file type
        if not allowed_file(file.filename):
            return jsonify({'success': False, 'error': 'File type not allowed'}), 400
        
        # Check course exists
        course = Course.query.get(int(course_id))
        if not course:
            return jsonify({'success': False, 'error': 'Course not found'}), 404
        
        # Generate unique filename
        original_filename = secure_filename(file.filename)
        file_ext = original_filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{user_id}_{uuid.uuid4().hex}.{file_ext}"
        
        # Save file
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        # Auto-approve for admin, else pending
        is_admin = user.role == 'admin'
        
        # Create note
        note = Note(
            title=title,
            description=description,
            file_name=unique_filename,
            original_filename=original_filename,
            file_path=file_path,
            file_type=file_ext,
            file_size=file_size,
            note_type=note_type,
            course_id=int(course_id),
            user_id=user_id,
            status='approved' if is_admin else 'pending',
            uploaded_at=datetime.now(timezone.utc),
            approved_at=datetime.now(timezone.utc) if is_admin else None
        )
        
        db.session.add(note)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'File uploaded successfully!' + (' Auto-approved for admin.' if is_admin else ' Waiting for admin approval.'),
            'note': note.to_dict(),
            'file_url': f'/api/files/{unique_filename}',
            'status': note.status
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Upload error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== ADMIN UPLOAD ROUTES ====================

@app.route('/api/admin/upload', methods=['POST'])
@jwt_required()
def admin_direct_upload():
    """Admin direct upload with auto-approval"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        
        if not user or user.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
        # Get form data
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        course_name = request.form.get('course', '').strip()
        material_type = request.form.get('type', 'notes')
        subject = request.form.get('subject', 'General')
        semester = request.form.get('semester', '1')
        
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        if not title or not course_name:
            return jsonify({'success': False, 'error': 'Title and Course are required'}), 400
        
        # Validate file type
        if not allowed_file(file.filename):
            return jsonify({'success': False, 'error': 'File type not allowed'}), 400
        
        # Save file
        original_filename = secure_filename(file.filename)
        file_ext = original_filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{course_name[:3]}_{material_type}_{uuid.uuid4().hex[:8]}.{file_ext}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        file_size = os.path.getsize(file_path)
        
        # Get or create course
        course = Course.query.filter_by(name=course_name).first()
        if not course:
            # Create new course
            course = Course(
                name=course_name,
                branch=course_name.split()[0] if ' ' in course_name else 'General',
                semester=int(semester) if semester.isdigit() else 1,
                code=f"{course_name[:3]}{semester}" if course_name else "GEN001"
            )
            db.session.add(course)
            db.session.commit()
        
        # Get subject (General if not specified)
        subject_obj = Subject.query.filter_by(
            name=subject,
            course_id=course.id,
            semester=int(semester) if semester.isdigit() else 1
        ).first()
        
        if not subject_obj:
            subject_obj = Subject(
                name=subject,
                code=f"{course_name[:3]}_{semester}_{subject[:3]}",
                semester=int(semester) if semester.isdigit() else 1,
                course_id=course.id
            )
            db.session.add(subject_obj)
            db.session.commit()
        
        # Create study material (auto-approved)
        material = StudyMaterial(
            title=title,
            description=description,
            file_name=unique_filename,
            original_filename=original_filename,
            file_path=file_path,
            file_type=file_ext,
            file_size=file_size,
            material_type=material_type,
            course_id=course.id,  # ✅ Now course_id is available
            subject_id=subject_obj.id,
            user_id=user.id,
            status='approved',
            approved_at=datetime.now(timezone.utc)
        )
        
        db.session.add(material)
        
        # Also create a Note entry for compatibility
        note = Note(
            title=title,
            description=description,
            file_name=unique_filename,
            original_filename=original_filename,
            file_path=file_path,
            file_type=file_ext,
            file_size=file_size,
            note_type=material_type,
            course_id=course.id,
            user_id=user.id,
            status='approved',
            uploaded_at=datetime.now(timezone.utc),
            approved_at=datetime.now(timezone.utc)
        )
        
        db.session.add(note)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'File uploaded and approved successfully!',
            'material': material.to_dict(),
            'note': note.to_dict(),
            'file_url': f'/api/files/{unique_filename}'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Admin upload error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/add-note', methods=['POST'])
@jwt_required()
def admin_add_note():
    """Add note manually without file upload"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        
        if not user or user.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        required = ['title', 'file_name', 'course']
        for field in required:
            if not data.get(field):
                return jsonify({'success': False, 'error': f'{field} is required'}), 400
        
        # Get or create course
        course_name = data['course']
        course = Course.query.filter_by(name=course_name).first()
        if not course:
            course = Course(
                name=course_name,
                branch=course_name.split()[0] if ' ' in course_name else 'General',
                semester=data.get('semester', 1),
                code=f"{course_name[:3]}{data.get('semester', 1)}"
            )
            db.session.add(course)
            db.session.commit()
        
        # Create note entry
        note = Note(
            title=data['title'],
            description=data.get('description', ''),
            file_name=data['file_name'],
            original_filename=data.get('original_filename', data['file_name']),
            file_path=os.path.join(app.config['UPLOAD_FOLDER'], data['file_name']),
            file_type=data['file_name'].split('.')[-1] if '.' in data['file_name'] else '',
            file_size=data.get('file_size', 0),
            note_type=data.get('type', 'notes'),
            course_id=course.id,
            user_id=user.id,
            status='approved',
            uploaded_at=datetime.now(timezone.utc),
            approved_at=datetime.now(timezone.utc)
        )
        
        db.session.add(note)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Note added to database successfully!',
            'note': note.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/approved-notes', methods=['GET'])
@jwt_required()
def get_approved_notes():
    """Get all approved notes and materials"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        if not user or user.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
        # Get approved notes
        notes = Note.query.filter_by(status='approved').order_by(Note.approved_at.desc()).all()
        note_list = []
        
        for note in notes:
            note_data = note.to_dict()
            note_data['type'] = 'note'
            note_list.append(note_data)
        
        # Get approved materials
        materials = StudyMaterial.query.filter_by(status='approved').order_by(StudyMaterial.approved_at.desc()).all()
        material_list = []
        
        for material in materials:
            mat_data = material.to_dict()
            mat_data['type'] = 'material'
            material_list.append(mat_data)
        
        # Combine and sort by approval date
        all_approved = note_list + material_list
        all_approved.sort(key=lambda x: x.get('approved_at', x.get('uploaded_at', '')), reverse=True)
        
        return jsonify({
            'success': True,
            'notes': all_approved,
            'count': len(all_approved),
            'stats': {
                'notes_count': len(note_list),
                'materials_count': len(material_list)
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== ADMIN MANAGEMENT ROUTES ====================

@app.route('/api/admin/stats', methods=['GET'])
@jwt_required()
def admin_stats():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        if not user or user.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
        stats = {
            'total_users': User.query.count(),
            'total_courses': Course.query.count(),
            'total_notes': Note.query.count(),
            'approved_notes': Note.query.filter_by(status='approved').count(),
            'pending_notes': Note.query.filter_by(status='pending').count(),
            'rejected_notes': Note.query.filter_by(status='rejected').count(),
            'total_materials': StudyMaterial.query.count(),
            'approved_materials': StudyMaterial.query.filter_by(status='approved').count(),
            'pending_materials': StudyMaterial.query.filter_by(status='pending').count(),
            'rejected_materials': StudyMaterial.query.filter_by(status='rejected').count(),
            'total_downloads': sum(n.downloads for n in Note.query.all()) + 
                              sum(m.downloads for m in StudyMaterial.query.all()),
        }
        
        return jsonify({'success': True, 'stats': stats})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/pending-notes', methods=['GET'])
@jwt_required()
def get_pending_notes():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        if not user or user.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
        pending = Note.query.filter_by(status='pending').order_by(Note.uploaded_at).all()
        notes_data = [note.to_dict() for note in pending]
        
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
        user = User.query.get(int(user_id))
        if not user or user.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
        note = Note.query.get(note_id)
        if not note:
            return jsonify({'success': False, 'error': 'Note not found'}), 404
        
        note.status = 'approved'
        note.approved_at = datetime.now(timezone.utc)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Note approved successfully',
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
        user = User.query.get(int(user_id))
        if not user or user.role != 'admin':
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
            'message': 'Note rejected successfully',
            'note': note.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/notes/<int:note_id>', methods=['DELETE'])
@jwt_required()
def delete_note(note_id):
    """Delete a note"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        if not user or user.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
        note = Note.query.get(note_id)
        if not note:
            return jsonify({'success': False, 'error': 'Note not found'}), 404
        
        # Delete file from filesystem
        if os.path.exists(note.file_path):
            try:
                os.remove(note.file_path)
            except:
                pass
        
        # Delete from database
        db.session.delete(note)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Note deleted successfully'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/materials/<int:material_id>', methods=['DELETE'])
@jwt_required()
def delete_material(material_id):
    """Delete a study material"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        if not user or user.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
        material = StudyMaterial.query.get(material_id)
        if not material:
            return jsonify({'success': False, 'error': 'Material not found'}), 404
        
        # Delete file from filesystem
        if os.path.exists(material.file_path):
            try:
                os.remove(material.file_path)
            except:
                pass
        
        # Delete from database
        db.session.delete(material)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Material deleted successfully'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== FILE SERVING ====================

@app.route('/api/files/<filename>', methods=['GET'])
def get_file(filename):
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except:
        return jsonify({'success': False, 'error': 'File not found'}), 404

@app.route('/api/notes/<int:note_id>/download', methods=['GET'])
def download_note(note_id):
    try:
        note = Note.query.get(note_id)
        if not note:
            return jsonify({'success': False, 'error': 'Note not found'}), 404
        
        if note.status != 'approved':
            return jsonify({'success': False, 'error': 'Note is not approved yet'}), 403
        
        # Check if file exists
        if not os.path.exists(note.file_path):
            return jsonify({'success': False, 'error': 'File not found on server'}), 404
        
        # Increment download count
        note.downloads += 1
        db.session.commit()
        
        return send_file(
            note.file_path,
            as_attachment=True,
            download_name=note.original_filename
        )
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/materials/<int:material_id>/download', methods=['GET'])
def download_material(material_id):
    try:
        material = StudyMaterial.query.get(material_id)
        if not material:
            return jsonify({'success': False, 'error': 'Material not found'}), 404
        
        if material.status != 'approved':
            return jsonify({'success': False, 'error': 'Material is not approved yet'}), 403
        
        # Check if file exists
        if not os.path.exists(material.file_path):
            return jsonify({'success': False, 'error': 'File not found on server'}), 404
        
        # Increment download count
        material.downloads += 1
        db.session.commit()
        
        return send_file(
            material.file_path,
            as_attachment=True,
            download_name=material.original_filename
        )
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== PUBLIC API FOR FRONTEND ====================

@app.route('/api/materials', methods=['GET'])
def get_public_materials():
    """Public API for frontend to get all approved materials"""
    try:
        # Get all approved notes
        notes = Note.query.filter_by(status='approved').order_by(Note.approved_at.desc()).all()
        
        # Get all approved study materials
        materials = StudyMaterial.query.filter_by(status='approved').order_by(StudyMaterial.approved_at.desc()).all()
        
        # Combine
        all_materials = []
        
        for note in notes:
            course = Course.query.get(note.course_id)
            all_materials.append({
                'id': note.id,
                'title': note.title,
                'description': note.description,
                'file_name': note.file_name,
                'original_filename': note.original_filename,
                'type': note.note_type,
                'course': course.name if course else 'Unknown',
                'course_id': course.id if course else None,
                'downloads': note.downloads,
                'views': note.views,
                'uploaded_at': note.uploaded_at.isoformat() if note.uploaded_at else None,
                'material_type': 'note',
                'download_url': f'/api/notes/{note.id}/download'
            })
        
        for material in materials:
            course = Course.query.get(material.course_id)
            subject = Subject.query.get(material.subject_id) if material.subject_id else None
            
            all_materials.append({
                'id': material.id,
                'title': material.title,
                'description': material.description,
                'file_name': material.file_name,
                'original_filename': material.original_filename,
                'type': material.material_type,
                'course': course.name if course else 'Unknown',
                'course_id': course.id if course else None,
                'subject': subject.name if subject else 'General',
                'subject_id': subject.id if subject else None,
                'downloads': material.downloads,
                'views': material.views,
                'uploaded_at': material.uploaded_at.isoformat() if material.uploaded_at else None,
                'material_type': 'study_material',
                'download_url': f'/api/materials/{material.id}/download'
            })
        
        # Sort by date
        all_materials.sort(key=lambda x: x['uploaded_at'] if x['uploaded_at'] else '', reverse=True)
        
        return jsonify({
            'success': True,
            'materials': all_materials,
            'total': len(all_materials)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/public/search', methods=['GET'])
def search_materials():
    """Search materials by keyword"""
    try:
        query = request.args.get('q', '').strip()
        if not query:
            return jsonify({'success': False, 'error': 'Search query required'}), 400
        
        # Search in notes
        note_results = Note.query.filter(
            Note.status == 'approved',
            (Note.title.ilike(f'%{query}%')) | 
            (Note.description.ilike(f'%{query}%'))
        ).all()
        
        # Search in materials
        material_results = StudyMaterial.query.filter(
            StudyMaterial.status == 'approved',
            (StudyMaterial.title.ilike(f'%{query}%')) | 
            (StudyMaterial.description.ilike(f'%{query}%'))
        ).all()
        
        results = []
        
        for note in note_results:
            course = Course.query.get(note.course_id)
            results.append({
                'id': note.id,
                'title': note.title,
                'description': note.description,
                'type': note.note_type,
                'course': course.name if course else 'Unknown',
                'material_type': 'note',
                'download_url': f'/api/notes/{note.id}/download'
            })
        
        for material in material_results:
            course = Course.query.get(material.course_id)
            subject = Subject.query.get(material.subject_id) if material.subject_id else None
            
            results.append({
                'id': material.id,
                'title': material.title,
                'description': material.description,
                'type': material.material_type,
                'course': course.name if course else 'Unknown',
                'subject': subject.name if subject else 'General',
                'material_type': 'study_material',
                'download_url': f'/api/materials/{material.id}/download'
            })
        
        return jsonify({
            'success': True,
            'query': query,
            'results': results,
            'count': len(results)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== USER ROUTES ====================

@app.route('/api/my-uploads', methods=['GET'])
@jwt_required()
def get_my_uploads():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        notes = Note.query.filter_by(user_id=user.id).order_by(Note.uploaded_at.desc()).all()
        materials = StudyMaterial.query.filter_by(user_id=user.id).order_by(StudyMaterial.uploaded_at.desc()).all()
        
        uploads = []
        for note in notes:
            note_data = note.to_dict()
            note_data['type'] = 'note'
            uploads.append(note_data)
        
        for material in materials:
            mat_data = material.to_dict()
            mat_data['type'] = 'material'
            uploads.append(mat_data)
        
        # Sort by upload date
        uploads.sort(key=lambda x: x['uploaded_at'], reverse=True)
        
        return jsonify({
            'success': True,
            'uploads': uploads,
            'total': len(uploads),
            'stats': {
                'notes': len(notes),
                'materials': len(materials),
                'approved': len([u for u in uploads if u['status'] == 'approved']),
                'pending': len([u for u in uploads if u['status'] == 'pending']),
                'rejected': len([u for u in uploads if u['status'] == 'rejected'])
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== UTILITY ROUTES ====================

@app.route('/api/reset-db', methods=['POST'])
def reset_database():
    """Reset database (development only)"""
    try:
        with app.app_context():
            # Drop all tables
            db.drop_all()
            print("Database dropped")
            
            # Recreate with sample data
            init_database()
            
        return jsonify({
            'success': True,
            'message': 'Database reset successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== ROOT ROUTE ====================

@app.route('/')
def home():
    return jsonify({
        'message': 'Notes Hub API',
        'version': '2.0',
        'status': 'running',
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'endpoints': {
            'auth': ['POST /api/auth/login', 'POST /api/auth/register', 'GET /api/auth/profile'],
            'courses': ['GET /api/courses', 'GET /api/programs'],
            'notes': ['GET /api/notes', 'GET /api/notes/<id>', 'GET /api/notes/<id>/download'],
            'materials': ['GET /api/materials', 'GET /api/public/search'],
            'upload': ['POST /api/upload'],
            'admin': [
                'POST /api/admin/upload',
                'POST /api/admin/add-note',
                'GET /api/admin/stats',
                'GET /api/admin/pending-notes',
                'GET /api/admin/approved-notes',
                'POST /api/admin/notes/<id>/approve',
                'POST /api/admin/notes/<id>/reject',
                'DELETE /api/admin/notes/<id>',
                'DELETE /api/admin/materials/<id>'
            ],
            'user': ['GET /api/my-uploads'],
            'utility': ['GET /api/health', 'GET /api/test', 'POST /api/reset-db']
        }
    })

# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({'success': False, 'error': 'Method not allowed'}), 405

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

@jwt.unauthorized_loader
def unauthorized_response(callback):
    return jsonify({'success': False, 'error': 'Authentication required'}), 401

# ==================== START APP ====================

if __name__ == '__main__':
    init_database()
    print("\n" + "="*60)
    print("NOTES HUB BACKEND - FIXED VERSION")
    print("="*60)
    print(f"Database: {DATABASE_PATH}")
    print(f"Uploads: {UPLOAD_FOLDER}")
    
    print("\nPre-configured Users:")
    print("  Admin: admin@noteshub.com / admin123")
    print("  Student: student@test.com / student123")
    
    print("\n✨ FIXED ISSUES:")
    print("  ✅ StudyMaterial model: Added course_id column")
    print("  ✅ Admin upload: Now works without errors")
    print("  ✅ Public API: GET /api/materials for frontend")
    
    print("\n🚀 IMPORTANT ENDPOINTS:")
    print("  Frontend (React): GET http://localhost:5000/api/materials")
    print("  Admin Panel: Use the HTML file I provided")
    
    print("\nServer URLs:")
    print("  Local: http://localhost:5000")
    print("  Network: http://<your-ip>:5000")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)