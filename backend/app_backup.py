# # from flask import Flask, request, jsonify, send_file, send_from_directory
# # from flask_cors import CORS
# # from flask_sqlalchemy import SQLAlchemy
# # from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
# # from werkzeug.utils import secure_filename
# # from werkzeug.security import generate_password_hash, check_password_hash
# # from datetime import datetime
# # import os
# # import uuid

# # app = Flask(__name__)

# # # Config
# # basedir = os.path.abspath(os.path.dirname(__file__))
# # DATABASE_PATH = os.path.join(basedir, "instance", "noteshub.db")
# # UPLOAD_FOLDER = os.path.join(basedir, "uploads")

# # os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
# # os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# # app.config["SECRET_KEY"] = "notes-hub-secret-key"
# # app.config["JWT_SECRET_KEY"] = "jwt-secret-key"
# # app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 86400
# # app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DATABASE_PATH}"
# # app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
# # app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
# # app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024
# # app.config["ALLOWED_EXTENSIONS"] = {"pdf", "doc", "docx", "ppt", "pptx", "txt", "jpg", "jpeg", "png"}

# # db = SQLAlchemy(app)
# # jwt = JWTManager(app)
# # CORS(app, supports_credentials=True)

# # # ==================== MODELS ====================

# # class User(db.Model):
# #     __tablename__ = "users"
# #     id = db.Column(db.Integer, primary_key=True)
# #     name = db.Column(db.String(100), nullable=False)
# #     email = db.Column(db.String(100), unique=True, nullable=False)
# #     password = db.Column(db.String(200), nullable=False)
# #     branch = db.Column(db.String(50))
# #     semester = db.Column(db.Integer)
# #     role = db.Column(db.String(20), default="student")
# #     created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
# #     def set_password(self, password):
# #         self.password = generate_password_hash(password)
    
# #     def check_password(self, password):
# #         return check_password_hash(self.password, password)
    
# #     def to_dict(self):
# #         return {
# #             "id": self.id,
# #             "name": self.name,
# #             "email": self.email,
# #             "branch": self.branch,
# #             "semester": self.semester,
# #             "role": self.role,
# #             "created_at": self.created_at.isoformat() if self.created_at else None
# #         }

# # class Course(db.Model):
# #     __tablename__ = "courses"
# #     id = db.Column(db.Integer, primary_key=True)
# #     name = db.Column(db.String(200), nullable=False)
# #     branch = db.Column(db.String(50), nullable=False)
# #     semester = db.Column(db.Integer, nullable=False)
# #     code = db.Column(db.String(20), unique=True)
# #     description = db.Column(db.Text)
# #     created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
# #     def to_dict(self):
# #         return {
# #             "id": self.id,
# #             "name": self.name,
# #             "branch": self.branch,
# #             "semester": self.semester,
# #             "code": self.code,
# #             "description": self.description,
# #             "created_at": self.created_at.isoformat() if self.created_at else None
# #         }

# # class Note(db.Model):
# #     __tablename__ = "notes"
# #     id = db.Column(db.Integer, primary_key=True)
# #     title = db.Column(db.String(200), nullable=False)
# #     description = db.Column(db.Text)
# #     file_name = db.Column(db.String(200))
# #     original_filename = db.Column(db.String(200))
# #     file_path = db.Column(db.String(500))
# #     file_type = db.Column(db.String(20))
# #     file_size = db.Column(db.Integer)
# #     status = db.Column(db.String(20), default="pending")
# #     uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
# #     approved_at = db.Column(db.DateTime)
# #     course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
# #     user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    
# #     def to_dict(self):
# #         user = User.query.get(self.user_id)
# #         course = Course.query.get(self.course_id)
# #         return {
# #             "id": self.id,
# #             "title": self.title,
# #             "description": self.description,
# #             "file_name": self.file_name,
# #             "original_filename": self.original_filename,
# #             "file_type": self.file_type,
# #             "file_size": self.file_size,
# #             "status": self.status,
# #             "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
# #             "approved_at": self.approved_at.isoformat() if self.approved_at else None,
# #             "course_id": self.course_id,
# #             "course_name": course.name if course else "Unknown",
# #             "user_id": self.user_id,
# #             "user_name": user.name if user else "Unknown"
# #         }

# # # ==================== INIT DB ====================

# # def init_db():
# #     with app.app_context():
# #         db.create_all()
        
# #         # Create admin
# #         if not User.query.filter_by(email="admin@noteshub.com").first():
# #             admin = User(
# #                 name="Admin",
# #                 email="admin@noteshub.com",
# #                 branch="Admin",
# #                 semester=0,
# #                 role="admin"
# #             )
# #             admin.set_password("admin123")
# #             db.session.add(admin)
        
# #         # Create courses
# #         if Course.query.count() == 0:
# #             courses = [
# #                 {"name": "Data Structures", "branch": "CSE", "semester": 3, "code": "CSE301"},
# #                 {"name": "Database Management", "branch": "CSE", "semester": 4, "code": "CSE401"},
# #                 {"name": "Computer Networks", "branch": "CSE", "semester": 5, "code": "CSE501"},
# #             ]
# #             for c in courses:
# #                 course = Course(**c)
# #                 db.session.add(course)
        
# #         db.session.commit()
# #         print(f"✅ Database ready: {User.query.count()} users, {Course.query.count()} courses")

# # # ==================== ROUTES ====================

# # @app.route("/api/auth/login", methods=["POST"])
# # def login():
# #     try:
# #         data = request.get_json()
# #         user = User.query.filter_by(email=data["email"]).first()
# #         if not user or not user.check_password(data["password"]):
# #             return jsonify({"success": False, "error": "Invalid credentials"}), 401
        
# #         token = create_access_token(identity=user.id)
# #         return jsonify({
# #             "success": True,
# #             "user": user.to_dict(),
# #             "access_token": token
# #         })
# #     except Exception as e:
# #         return jsonify({"success": False, "error": str(e)}), 500

# # @app.route("/api/upload", methods=["POST"])
# # @jwt_required()
# # def upload_note():
# #     try:
# #         user_id = get_jwt_identity()
# #         user = User.query.get(user_id)
        
# #         if "file" not in request.files:
# #             return jsonify({"success": False, "error": "No file"}), 400
        
# #         file = request.files["file"]
# #         if file.filename == "":
# #             return jsonify({"success": False, "error": "No file selected"}), 400
        
# #         title = request.form.get("title", "").strip()
# #         course_id = request.form.get("course_id")
        
# #         if not title or not course_id:
# #             return jsonify({"success": False, "error": "Title and course required"}), 400
        
# #         # Check file extension
# #         if not ("." in file.filename and file.filename.rsplit(".", 1)[1].lower() in app.config["ALLOWED_EXTENSIONS"]):
# #             return jsonify({"success": False, "error": "File type not allowed"}), 400
        
# #         # Save file
# #         original_filename = secure_filename(file.filename)
# #         file_ext = original_filename.rsplit(".", 1)[1].lower()
# #         unique_filename = f"{user_id}_{uuid.uuid4().hex}.{file_ext}"
# #         file_path = os.path.join(app.config["UPLOAD_FOLDER"], unique_filename)
# #         file.save(file_path)
        
# #         # Create note
# #         note = Note(
# #             title=title,
# #             description=request.form.get("description", ""),
# #             file_name=unique_filename,
# #             original_filename=original_filename,
# #             file_path=file_path,
# #             file_type=file_ext,
# #             file_size=os.path.getsize(file_path),
# #             course_id=int(course_id),
# #             user_id=user_id,
# #             status="approved" if user.role == "admin" else "pending",
# #             uploaded_at=datetime.utcnow(),
# #             approved_at=datetime.utcnow() if user.role == "admin" else None
# #         )
        
# #         db.session.add(note)
# #         db.session.commit()
        
# #         return jsonify({
# #             "success": True,
# #             "message": "Upload successful" + (" (auto-approved)" if user.role == "admin" else " (pending approval)"),
# #             "note": note.to_dict()
# #         }), 201
        
# #     except Exception as e:
# #         db.session.rollback()
# #         return jsonify({"success": False, "error": str(e)}), 500

# # @app.route("/api/admin/pending-notes", methods=["GET"])
# # @jwt_required()
# # def get_pending_notes():
# #     try:
# #         user_id = get_jwt_identity()
# #         user = User.query.get(user_id)
# #         if user.role != "admin":
# #             return jsonify({"success": False, "error": "Admin required"}), 403
        
# #         notes = Note.query.filter_by(status="pending").all()
# #         return jsonify({
# #             "success": True,
# #             "notes": [n.to_dict() for n in notes],
# #             "count": len(notes)
# #         })
# #     except Exception as e:
# #         return jsonify({"success": False, "error": str(e)}), 500

# # @app.route("/api/admin/notes/<int:note_id>/approve", methods=["POST"])
# # @jwt_required()
# # def approve_note(note_id):
# #     try:
# #         user_id = get_jwt_identity()
# #         user = User.query.get(user_id)
# #         if user.role != "admin":
# #             return jsonify({"success": False, "error": "Admin required"}), 403
        
# #         note = Note.query.get(note_id)
# #         if not note:
# #             return jsonify({"success": False, "error": "Note not found"}), 404
        
# #         note.status = "approved"
# #         note.approved_at = datetime.utcnow()
# #         db.session.commit()
        
# #         return jsonify({
# #             "success": True,
# #             "message": "Note approved",
# #             "note": note.to_dict()
# #         })
# #     except Exception as e:
# #         db.session.rollback()
# #         return jsonify({"success": False, "error": str(e)}), 500

# # @app.route("/api/admin/stats", methods=["GET"])
# # @jwt_required()
# # def admin_stats():
# #     try:
# #         user_id = get_jwt_identity()
# #         user = User.query.get(user_id)
# #         if user.role != "admin":
# #             return jsonify({"success": False, "error": "Admin required"}), 403
        
# #         return jsonify({
# #             "success": True,
# #             "stats": {
# #                 "total_users": User.query.count(),
# #                 "total_courses": Course.query.count(),
# #                 "total_notes": Note.query.count(),
# #                 "approved_notes": Note.query.filter_by(status="approved").count(),
# #                 "pending_notes": Note.query.filter_by(status="pending").count()
# #             }
# #         })
# #     except Exception as e:
# #         return jsonify({"success": False, "error": str(e)}), 500

# # @app.route("/api/notes", methods=["GET"])
# # def get_notes():
# #     try:
# #         notes = Note.query.filter_by(status="approved").order_by(Note.uploaded_at.desc()).all()
# #         return jsonify({
# #             "success": True,
# #             "notes": [n.to_dict() for n in notes],
# #             "total": len(notes)
# #         })
# #     except Exception as e:
# #         return jsonify({"success": False, "error": str(e)}), 500

# # @app.route("/api/files/<filename>")
# # def get_file(filename):
# #     try:
# #         return send_from_directory(app.config["UPLOAD_FOLDER"], filename)
# #     except:
# #         return jsonify({"success": False, "error": "File not found"}), 404

# # @app.route("/api/courses")
# # def get_courses():
# #     try:
# #         courses = Course.query.all()
# #         return jsonify({
# #             "success": True,
# #             "courses": [c.to_dict() for c in courses]
# #         })
# #     except Exception as e:
# #         return jsonify({"success": False, "error": str(e)}), 500

# # @app.route("/")
# # def home():
# #     return jsonify({
# #         "message": "Notes Hub API",
# #         "status": "running",
# #         "admin": "admin@noteshub.com / admin123"
# #     })

# # # ==================== START ====================

# # if __name__ == "__main__":
# #     init_db()
# #     print("\n" + "="*50)
# #     print("🚀 NOTES HUB - FIXED VERSION")
# #     print("="*50)
# #     print(f"📁 Database: {DATABASE_PATH}")
# #     print(f"📁 Uploads: {UPLOAD_FOLDER}")
# #     print("\n👤 Admin: admin@noteshub.com / admin123")
# #     print("\n📡 Running on http://localhost:5000")
# #     print("="*50)
# #     app.run(debug=True, port=5000)


# """
# Notes Hub Backend - Complete Working Version
# SQLite Database with all features
# """

# import os
# import uuid
# import json
# from datetime import datetime
# from werkzeug.utils import secure_filename
# from werkzeug.security import generate_password_hash, check_password_hash
# from flask import Flask, request, jsonify, send_file, send_from_directory
# from flask_cors import CORS
# from flask_sqlalchemy import SQLAlchemy
# from flask_jwt_extended import (
#     JWTManager, create_access_token, jwt_required,
#     get_jwt_identity, create_refresh_token
# )

# # ==================== INITIALIZE APP ====================

# app = Flask(__name__)

# # Configuration
# basedir = os.path.abspath(os.path.dirname(__file__))
# DATABASE_PATH = os.path.join(basedir, 'instance', 'noteshub.db')
# UPLOAD_FOLDER = os.path.join(basedir, 'uploads')

# # Create directories
# os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# app.config['SECRET_KEY'] = 'notes-hub-secret-key-2024'
# app.config['JWT_SECRET_KEY'] = 'jwt-super-secret-key-change-in-production'
# app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400  # 24 hours
# app.config['JWT_REFRESH_TOKEN_EXPIRES'] = 2592000  # 30 days
# app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DATABASE_PATH}'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB
# app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png'}

# # Initialize extensions
# db = SQLAlchemy(app)
# jwt = JWTManager(app)
# CORS(app, supports_credentials=True)

# # ==================== DATABASE MODELS ====================

# class User(db.Model):
#     __tablename__ = 'users'
    
#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(100), nullable=False)
#     email = db.Column(db.String(100), unique=True, nullable=False)
#     password = db.Column(db.String(200), nullable=False)
#     branch = db.Column(db.String(50))
#     semester = db.Column(db.Integer)
#     role = db.Column(db.String(20), default='student')
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
#     # Relationships
#     uploaded_notes = db.relationship('Note', backref='uploader', lazy=True)
    
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
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
#     # Relationship
#     notes = db.relationship('Note', backref='course', lazy=True)
    
#     def to_dict(self):
#         note_count = Note.query.filter_by(course_id=self.id, status='approved').count()
#         return {
#             'id': self.id,
#             'name': self.name,
#             'branch': self.branch,
#             'semester': self.semester,
#             'code': self.code,
#             'description': self.description,
#             'note_count': note_count,
#             'created_at': self.created_at.isoformat() if self.created_at else None
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
    
#     # Status
#     status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
#     rejection_reason = db.Column(db.Text)
#     downloads = db.Column(db.Integer, default=0)
#     views = db.Column(db.Integer, default=0)
    
#     # Timestamps
#     uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
#     approved_at = db.Column(db.DateTime)
#     updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
#     # Foreign Keys
#     course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
#     user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
#     approved_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
#     def to_dict(self):
#         user = User.query.get(self.user_id)
#         course = Course.query.get(self.course_id)
#         approver = User.query.get(self.approved_by) if self.approved_by else None
        
#         return {
#             'id': self.id,
#             'title': self.title,
#             'description': self.description,
#             'file_name': self.file_name,
#             'original_filename': self.original_filename,
#             'file_type': self.file_type,
#             'file_size': self.file_size,
#             'file_size_formatted': self.format_file_size(),
#             'note_type': self.note_type,
#             'status': self.status,
#             'rejection_reason': self.rejection_reason,
#             'downloads': self.downloads,
#             'views': self.views,
#             'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
#             'approved_at': self.approved_at.isoformat() if self.approved_at else None,
#             'updated_at': self.updated_at.isoformat() if self.updated_at else None,
#             'course_id': self.course_id,
#             'course_name': course.name if course else 'Unknown',
#             'course_code': course.code if course else '',
#             'user_id': self.user_id,
#             'user_name': user.name if user else 'Unknown',
#             'user_email': user.email if user else 'Unknown',
#             'approved_by': self.approved_by,
#             'approved_by_name': approver.name if approver else None
#         }
    
#     def format_file_size(self):
#         if not self.file_size:
#             return "0 KB"
#         size = self.file_size
#         for unit in ['B', 'KB', 'MB', 'GB']:
#             if size < 1024.0:
#                 return f"{size:.1f} {unit}"
#             size /= 1024.0
#         return f"{size:.1f} TB"

# class Rating(db.Model):
#     __tablename__ = 'ratings'
    
#     id = db.Column(db.Integer, primary_key=True)
#     rating = db.Column(db.Integer, nullable=False)
#     review = db.Column(db.Text)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
#     note_id = db.Column(db.Integer, db.ForeignKey('notes.id'), nullable=False)
#     user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
#     __table_args__ = (db.UniqueConstraint('note_id', 'user_id', name='unique_user_note_rating'),)

# class Download(db.Model):
#     __tablename__ = 'downloads'
    
#     id = db.Column(db.Integer, primary_key=True)
#     downloaded_at = db.Column(db.DateTime, default=datetime.utcnow)
#     ip_address = db.Column(db.String(50))
#     user_agent = db.Column(db.Text)
    
#     note_id = db.Column(db.Integer, db.ForeignKey('notes.id'), nullable=False)
#     user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

# # ==================== HELPER FUNCTIONS ====================

# def allowed_file(filename):
#     return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# def init_database():
#     """Initialize database with default data"""
#     with app.app_context():
#         # Drop all tables and recreate (clean start)
#         db.drop_all()
#         db.create_all()
#         print(f"✅ Database created at: {DATABASE_PATH}")
        
#         # Create admin user
#         admin = User(
#             name='Admin',
#             email='admin@noteshub.com',
#             branch='Admin',
#             semester=0,
#             role='admin'
#         )
#         admin.set_password('admin123')
#         db.session.add(admin)
        
#         # Create test student
#         student = User(
#             name='Test Student',
#             email='student@test.com',
#             branch='CSE',
#             semester=3,
#             role='student'
#         )
#         student.set_password('student123')
#         db.session.add(student)
        
#         # Add sample courses
#         sample_courses = [
#             {'name': 'Data Structures', 'branch': 'CSE', 'semester': 3, 'code': 'CSE301'},
#             {'name': 'Database Management', 'branch': 'CSE', 'semester': 4, 'code': 'CSE401'},
#             {'name': 'Computer Networks', 'branch': 'CSE', 'semester': 5, 'code': 'CSE501'},
#             {'name': 'Operating Systems', 'branch': 'CSE', 'semester': 4, 'code': 'CSE402'},
#             {'name': 'Digital Electronics', 'branch': 'ECE', 'semester': 2, 'code': 'ECE202'},
#             {'name': 'Circuit Theory', 'branch': 'ECE', 'semester': 3, 'code': 'ECE301'},
#             {'name': 'Engineering Mathematics', 'branch': 'All', 'semester': 1, 'code': 'MAT101'},
#             {'name': 'Engineering Physics', 'branch': 'All', 'semester': 1, 'code': 'PHY101'},
#             {'name': 'Programming in C', 'branch': 'BCA', 'semester': 1, 'code': 'BCA101'},
#             {'name': 'Principles of Management', 'branch': 'BBA', 'semester': 1, 'code': 'BBA101'},
#         ]
        
#         for course_data in sample_courses:
#             course = Course(**course_data)
#             db.session.add(course)
        
#         db.session.commit()
#         print(f"✅ Database initialized: {User.query.count()} users, {Course.query.count()} courses")

# # ==================== AUTH ROUTES ====================

# @app.route('/api/auth/register', methods=['POST'])
# def register():
#     try:
#         data = request.get_json()
        
#         required = ['name', 'email', 'password', 'branch', 'semester']
#         for field in required:
#             if not data.get(field):
#                 return jsonify({'success': False, 'error': f'{field} is required'}), 400
        
#         if User.query.filter_by(email=data['email']).first():
#             return jsonify({'success': False, 'error': 'Email already registered'}), 409
        
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
#         return jsonify({'success': False, 'error': str(e)}), 500

# @app.route('/api/auth/login', methods=['POST'])
# def login():
#     try:
#         data = request.get_json()
        
#         if not data.get('email') or not data.get('password'):
#             return jsonify({'success': False, 'error': 'Email and password required'}), 400
        
#         user = User.query.filter_by(email=data['email']).first()
        
#         if not user or not user.check_password(data['password']):
#             return jsonify({'success': False, 'error': 'Invalid email or password'}), 401
        
#         access_token = create_access_token(identity=user.id)
#         refresh_token = create_refresh_token(identity=user.id)
        
#         return jsonify({
#             'success': True,
#             'message': 'Login successful',
#             'user': user.to_dict(),
#             'access_token': access_token,
#             'refresh_token': refresh_token
#         }), 200
        
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500

# @app.route('/api/auth/profile', methods=['GET'])
# @jwt_required()
# def get_profile():
#     try:
#         user_id = get_jwt_identity()
#         user = User.query.get(user_id)
        
#         if not user:
#             return jsonify({'success': False, 'error': 'User not found'}), 404
        
#         return jsonify({
#             'success': True,
#             'user': user.to_dict()
#         })
        
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500

# @app.route('/api/auth/refresh', methods=['POST'])
# @jwt_required(refresh=True)
# def refresh():
#     try:
#         user_id = get_jwt_identity()
#         new_token = create_access_token(identity=user_id)
#         return jsonify({'success': True, 'access_token': new_token})
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500

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
        
#         courses = query.order_by(Course.semester, Course.name).all()
        
#         return jsonify({
#             'success': True,
#             'courses': [course.to_dict() for course in courses],
#             'total': len(courses)
#         })
        
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500

# # ==================== NOTE/UPLOAD ROUTES ====================

# @app.route('/api/notes', methods=['GET'])
# def get_notes():
#     try:
#         course_id = request.args.get('course_id')
#         status = request.args.get('status', 'approved')
#         search = request.args.get('search')
        
#         query = Note.query
        
#         if course_id:
#             query = query.filter(Note.course_id == int(course_id))
#         if status:
#             query = query.filter(Note.status == status)
#         if search:
#             query = query.filter(Note.title.contains(search) | Note.description.contains(search))
        
#         notes = query.order_by(Note.uploaded_at.desc()).all()
        
#         return jsonify({
#             'success': True,
#             'notes': [note.to_dict() for note in notes],
#             'total': len(notes)
#         })
        
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500

# @app.route('/api/notes/<int:note_id>', methods=['GET'])
# def get_note(note_id):
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

# @app.route('/api/upload', methods=['POST'])
# @jwt_required()
# def upload_note():
#     """Main upload endpoint"""
#     try:
#         user_id = get_jwt_identity()
#         user = User.query.get(user_id)
        
#         if not user:
#             return jsonify({'success': False, 'error': 'User not found. Please login again.'}), 401
        
#         print(f"📤 Upload attempt by: {user.name} ({user.email})")
        
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
#         course = Course.query.get(course_id)
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
#             uploaded_at=datetime.utcnow(),
#             approved_at=datetime.utcnow() if is_admin else None,
#             approved_by=user_id if is_admin else None
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
#         print(f"❌ Upload error: {str(e)}")
#         return jsonify({'success': False, 'error': str(e)}), 500

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
        
#         # Create download record
#         download = Download(
#             note_id=note_id,
#             user_id=get_jwt_identity() if request.headers.get('Authorization') else None,
#             ip_address=request.remote_addr,
#             user_agent=request.user_agent.string,
#             downloaded_at=datetime.utcnow()
#         )
        
#         db.session.add(download)
#         db.session.commit()
        
#         # Send file
#         return send_file(
#             note.file_path,
#             as_attachment=True,
#             download_name=note.original_filename or note.file_name
#         )
        
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500

# # ==================== FILE SERVING ====================

# @app.route('/api/files/<filename>', methods=['GET'])
# def get_file(filename):
#     try:
#         return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
#     except FileNotFoundError:
#         return jsonify({'success': False, 'error': 'File not found'}), 404

# # ==================== ADMIN ROUTES ====================

# @app.route('/api/admin/pending-notes', methods=['GET'])
# @jwt_required()
# def get_pending_notes():
#     try:
#         user_id = get_jwt_identity()
#         user = User.query.get(user_id)
        
#         if user.role != 'admin':
#             return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
#         pending = Note.query.filter_by(status='pending').order_by(Note.uploaded_at).all()
        
#         notes_data = []
#         for note in pending:
#             note_data = note.to_dict()
#             uploader = User.query.get(note.user_id)
#             course = Course.query.get(note.course_id)
#             note_data['uploader'] = uploader.to_dict() if uploader else None
#             note_data['course_name'] = course.name if course else 'Unknown'
#             notes_data.append(note_data)
        
#         return jsonify({
#             'success': True,
#             'notes': notes_data,
#             'count': len(notes_data)
#         })
        
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500

# @app.route('/api/admin/notes/<int:note_id>/approve', methods=['POST'])
# @jwt_required()
# def approve_note(note_id):
#     try:
#         user_id = get_jwt_identity()
#         user = User.query.get(user_id)
        
#         if user.role != 'admin':
#             return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
#         note = Note.query.get(note_id)
#         if not note:
#             return jsonify({'success': False, 'error': 'Note not found'}), 404
        
#         note.status = 'approved'
#         note.approved_at = datetime.utcnow()
#         note.approved_by = user_id
        
#         db.session.commit()
        
#         return jsonify({
#             'success': True,
#             'message': 'Note approved successfully',
#             'note': note.to_dict()
#         })
        
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({'success': False, 'error': str(e)}), 500

# @app.route('/api/admin/notes/<int:note_id>/reject', methods=['POST'])
# @jwt_required()
# def reject_note(note_id):
#     try:
#         user_id = get_jwt_identity()
#         user = User.query.get(user_id)
        
#         if user.role != 'admin':
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

# @app.route('/api/admin/stats', methods=['GET'])
# @jwt_required()
# def admin_stats():
#     try:
#         user_id = get_jwt_identity()
#         user = User.query.get(user_id)
        
#         if user.role != 'admin':
#             return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
#         stats = {
#             'total_users': User.query.count(),
#             'total_courses': Course.query.count(),
#             'total_notes': Note.query.count(),
#             'approved_notes': Note.query.filter_by(status='approved').count(),
#             'pending_notes': Note.query.filter_by(status='pending').count(),
#             'rejected_notes': Note.query.filter_by(status='rejected').count(),
#             'total_downloads': sum(note.downloads for note in Note.query.all()),
#             'recent_uploads': [note.to_dict() for note in Note.query.order_by(Note.uploaded_at.desc()).limit(5).all()],
#             'top_downloaded': [note.to_dict() for note in Note.query.order_by(Note.downloads.desc()).limit(5).all()]
#         }
        
#         return jsonify({
#             'success': True,
#             'stats': stats
#         })
        
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500

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
#             'total': len(uploads),
#             'stats': {
#                 'approved': len([n for n in notes if n.status == 'approved']),
#                 'pending': len([n for n in notes if n.status == 'pending']),
#                 'rejected': len([n for n in notes if n.status == 'rejected'])
#             }
#         })
        
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500

# # ==================== UTILITY ROUTES ====================

# @app.route('/api/health', methods=['GET'])
# def health_check():
#     try:
#         # Test database connection
#         db.session.execute('SELECT 1')
        
#         stats = {
#             'status': 'healthy',
#             'service': 'notes-hub-api',
#             'timestamp': datetime.utcnow().isoformat(),
#             'database': 'connected',
#             'storage': {
#                 'uploads_folder': os.path.exists(app.config['UPLOAD_FOLDER']),
#                 'uploads_count': len(os.listdir(app.config['UPLOAD_FOLDER'])) if os.path.exists(app.config['UPLOAD_FOLDER']) else 0
#             },
#             'counts': {
#                 'users': User.query.count(),
#                 'courses': Course.query.count(),
#                 'notes': Note.query.count(),
#                 'pending_notes': Note.query.filter_by(status='pending').count()
#             }
#         }
        
#         return jsonify({'success': True, **stats})
        
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e), 'status': 'unhealthy'}), 500

# @app.route('/api/reset-db', methods=['POST'])
# def reset_database():
#     """Reset database (for development only)"""
#     try:
#         init_database()
#         return jsonify({
#             'success': True,
#             'message': 'Database reset successfully'
#         })
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500

# # ==================== ROOT & INFO ====================

# @app.route('/', methods=['GET'])
# def home():
#     return jsonify({
#         'message': '🎉 Notes Hub API',
#         'version': '1.0.0',
#         'status': 'running',
#         'timestamp': datetime.utcnow().isoformat(),
#         'endpoints': {
#             'auth': ['POST /api/auth/login', 'POST /api/auth/register', 'GET /api/auth/profile'],
#             'notes': ['GET /api/notes', 'POST /api/upload', 'GET /api/notes/:id/download'],
#             'courses': ['GET /api/courses'],
#             'user': ['GET /api/my-uploads'],
#             'admin': ['GET /api/admin/pending-notes', 'GET /api/admin/stats'],
#             'utility': ['GET /api/health', 'POST /api/reset-db']
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

# # ==================== START APPLICATION ====================

# if __name__ == '__main__':
#     # Initialize database
#     init_database()
    
#     print("=" * 60)
#     print("🚀 NOTES HUB BACKEND - READY")
#     print("=" * 60)
#     print(f"📁 Database: {DATABASE_PATH}")
#     print(f"📁 Uploads: {UPLOAD_FOLDER}")
    
#     print("\n👤 Pre-configured Users:")
#     print("   1. Admin: admin@noteshub.com / admin123")
#     print("   2. Student: student@test.com / student123")
    
#     print("\n📡 API Endpoints:")
#     print("   • GET  /                     - API Info")
#     print("   • POST /api/auth/login       - Login")
#     print("   • POST /api/upload           - Upload notes (JWT required)")
#     print("   • GET  /api/notes            - Browse notes")
#     print("   • GET  /api/admin/pending-notes - Admin panel")
    
#     print("\n🔧 Development Tools:")
#     print("   • POST /api/reset-db         - Reset database")
#     print("   • GET  /api/health           - Health check")
    
#     print("\n💡 Quick Start:")
#     print("   1. Login as admin")
#     print("   2. Upload notes (auto-approved)")
#     print("   3. Or login as student and wait for approval")
#     print("=" * 60)
    
#     app.run(debug=True, port=5000)




import os
import uuid
import json
from datetime import datetime
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required,
    get_jwt_identity, create_refresh_token
)

# ==================== INITIALIZE APP ====================

app = Flask(__name__)

# Configuration
basedir = os.path.abspath(os.path.dirname(__file__))
DATABASE_PATH = os.path.join(basedir, 'instance', 'noteshub.db')
UPLOAD_FOLDER = os.path.join(basedir, 'uploads')

# Create directories
os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['SECRET_KEY'] = 'notes-hub-secret-key-2024'
app.config['JWT_SECRET_KEY'] = 'jwt-super-secret-key-change-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400  # 24 hours
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = 2592000  # 30 days
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DATABASE_PATH}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB
app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png'}

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app, 
     supports_credentials=True,
     resources={r"/api/*": {"origins": "*"}},
     allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# ==================== DATABASE MODELS ====================

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    branch = db.Column(db.String(50))
    semester = db.Column(db.Integer)
    role = db.Column(db.String(20), default='student')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships - explicitly specify foreign_keys
    uploaded_notes = db.relationship('Note', 
                                     backref='uploader_user', 
                                     lazy=True,
                                     foreign_keys='Note.user_id')
    
    # Relationship for notes approved by this user
    approved_notes = db.relationship('Note',
                                     backref='approver_user',
                                     lazy=True,
                                     foreign_keys='Note.approved_by')
    
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
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    notes = db.relationship('Note', backref='course', lazy=True)
    
    def to_dict(self):
        note_count = Note.query.filter_by(course_id=self.id, status='approved').count()
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
    
    # Status
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    rejection_reason = db.Column(db.Text)
    downloads = db.Column(db.Integer, default=0)
    views = db.Column(db.Integer, default=0)
    
    # Timestamps
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    approved_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    approved_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    def to_dict(self):
        user = User.query.get(self.user_id)
        course = Course.query.get(self.course_id)
        approver = User.query.get(self.approved_by) if self.approved_by else None
        
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'file_name': self.file_name,
            'original_filename': self.original_filename,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'file_size_formatted': self.format_file_size(),
            'note_type': self.note_type,
            'status': self.status,
            'rejection_reason': self.rejection_reason,
            'downloads': self.downloads,
            'views': self.views,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'course_id': self.course_id,
            'course_name': course.name if course else 'Unknown',
            'course_code': course.code if course else '',
            'user_id': self.user_id,
            'user_name': user.name if user else 'Unknown',
            'user_email': user.email if user else 'Unknown',
            'approved_by': self.approved_by,
            'approved_by_name': approver.name if approver else None
        }
    
    def format_file_size(self):
        if not self.file_size:
            return "0 KB"
        size = self.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"

class Rating(db.Model):
    __tablename__ = 'ratings'
    
    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Integer, nullable=False)
    review = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    note_id = db.Column(db.Integer, db.ForeignKey('notes.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Define relationships explicitly
    note = db.relationship('Note', backref='ratings', foreign_keys=[note_id])
    user = db.relationship('User', backref='ratings', foreign_keys=[user_id])
    
    __table_args__ = (db.UniqueConstraint('note_id', 'user_id', name='unique_user_note_rating'),)

class Download(db.Model):
    __tablename__ = 'downloads'
    
    id = db.Column(db.Integer, primary_key=True)
    downloaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    ip_address = db.Column(db.String(50))
    user_agent = db.Column(db.Text)
    
    note_id = db.Column(db.Integer, db.ForeignKey('notes.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Define relationships explicitly
    note = db.relationship('Note', backref='download_records', foreign_keys=[note_id])
    user = db.relationship('User', backref='downloads', foreign_keys=[user_id])

# ==================== HELPER FUNCTIONS ====================

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def init_database():
    """Initialize database with default data"""
    with app.app_context():
        # Drop all tables and recreate (clean start)
        db.drop_all()
        db.create_all()
        print(f"✅ Database created at: {DATABASE_PATH}")
        
        # Create admin user
        admin = User(
            name='Admin',
            email='admin@noteshub.com',
            branch='Admin',
            semester=0,
            role='admin'
        )
        admin.set_password('admin123')
        db.session.add(admin)
        
        # Create test student
        student = User(
            name='Test Student',
            email='student@test.com',
            branch='CSE',
            semester=3,
            role='student'
        )
        student.set_password('student123')
        db.session.add(student)
        
        # Add sample courses
        sample_courses = [
            {'name': 'Data Structures', 'branch': 'CSE', 'semester': 3, 'code': 'CSE301'},
            {'name': 'Database Management', 'branch': 'CSE', 'semester': 4, 'code': 'CSE401'},
            {'name': 'Computer Networks', 'branch': 'CSE', 'semester': 5, 'code': 'CSE501'},
            {'name': 'Operating Systems', 'branch': 'CSE', 'semester': 4, 'code': 'CSE402'},
            {'name': 'Digital Electronics', 'branch': 'ECE', 'semester': 2, 'code': 'ECE202'},
            {'name': 'Circuit Theory', 'branch': 'ECE', 'semester': 3, 'code': 'ECE301'},
            {'name': 'Engineering Mathematics', 'branch': 'All', 'semester': 1, 'code': 'MAT101'},
            {'name': 'Engineering Physics', 'branch': 'All', 'semester': 1, 'code': 'PHY101'},
            {'name': 'Programming in C', 'branch': 'BCA', 'semester': 1, 'code': 'BCA101'},
            {'name': 'Principles of Management', 'branch': 'BBA', 'semester': 1, 'code': 'BBA101'},
        ]
        
        for course_data in sample_courses:
            course = Course(**course_data)
            db.session.add(course)
        
        db.session.commit()
        print(f"✅ Database initialized: {User.query.count()} users, {Course.query.count()} courses")

# ==================== AUTH ROUTES ====================

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        required = ['name', 'email', 'password', 'branch', 'semester']
        for field in required:
            if not data.get(field):
                return jsonify({'success': False, 'error': f'{field} is required'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'success': False, 'error': 'Email already registered'}), 409
        
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
        
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'user': user.to_dict(),
            'access_token': access_token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'success': False, 'error': 'Email and password required'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'success': False, 'error': 'Invalid email or password'}), 401
        
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/auth/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        user_id = get_jwt_identity()
        new_token = create_access_token(identity=user_id)
        return jsonify({'success': True, 'access_token': new_token})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== COURSE ROUTES ====================

@app.route('/api/courses', methods=['GET'])
def get_courses():
    try:
        branch = request.args.get('branch')
        semester = request.args.get('semester')
        
        query = Course.query
        
        if branch and branch != 'All':
            query = query.filter(Course.branch == branch)
        if semester:
            query = query.filter(Course.semester == int(semester))
        
        courses = query.order_by(Course.semester, Course.name).all()
        
        return jsonify({
            'success': True,
            'courses': [course.to_dict() for course in courses],
            'total': len(courses)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== NOTE/UPLOAD ROUTES ====================

@app.route('/api/notes', methods=['GET'])
def get_notes():
    try:
        course_id = request.args.get('course_id')
        status = request.args.get('status', 'approved')
        search = request.args.get('search')
        
        query = Note.query
        
        if course_id:
            query = query.filter(Note.course_id == int(course_id))
        if status:
            query = query.filter(Note.status == status)
        if search:
            query = query.filter(Note.title.contains(search) | Note.description.contains(search))
        
        notes = query.order_by(Note.uploaded_at.desc()).all()
        
        return jsonify({
            'success': True,
            'notes': [note.to_dict() for note in notes],
            'total': len(notes)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/notes/<int:note_id>', methods=['GET'])
def get_note(note_id):
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

@app.route('/api/upload', methods=['POST'])
@jwt_required()
def upload_note():
    """Main upload endpoint"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'success': False, 'error': 'User not found. Please login again.'}), 401
        
        print(f"📤 Upload attempt by: {user.name} ({user.email})")
        
        # Check if file is present
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
        course = Course.query.get(course_id)
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
            uploaded_at=datetime.utcnow(),
            approved_at=datetime.utcnow() if is_admin else None,
            approved_by=user_id if is_admin else None
        )
        
        db.session.add(note)
        db.session.commit()
        
        response_data = {
            'success': True,
            'message': 'File uploaded successfully!' + (' Auto-approved for admin.' if is_admin else ' Waiting for admin approval.'),
            'note': note.to_dict(),
            'file_url': f'/api/files/{unique_filename}',
            'status': note.status
        }
        
        return jsonify(response_data), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Upload error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

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
        
        # Create download record
        download = Download(
            note_id=note_id,
            user_id=get_jwt_identity() if request.headers.get('Authorization') else None,
            ip_address=request.remote_addr,
            user_agent=request.user_agent.string,
            downloaded_at=datetime.utcnow()
        )
        
        db.session.add(download)
        db.session.commit()
        
        # Send file
        return send_file(
            note.file_path,
            as_attachment=True,
            download_name=note.original_filename or note.file_name
        )
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== FILE SERVING ====================

@app.route('/api/files/<filename>', methods=['GET'])
def get_file(filename):
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except FileNotFoundError:
        return jsonify({'success': False, 'error': 'File not found'}), 404

# ==================== ADMIN ROUTES ====================

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
            note_data['uploader'] = uploader.to_dict() if uploader else None
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
        note.approved_by = user_id
        
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
            'message': 'Note rejected successfully',
            'note': note.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

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
            'total_downloads': sum(note.downloads for note in Note.query.all()),
            'recent_uploads': [note.to_dict() for note in Note.query.order_by(Note.uploaded_at.desc()).limit(5).all()],
            'top_downloaded': [note.to_dict() for note in Note.query.order_by(Note.downloads.desc()).limit(5).all()]
        }
        
        return jsonify({
            'success': True,
            'stats': stats
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== USER ROUTES ====================

@app.route('/api/my-uploads', methods=['GET'])
@jwt_required()
def get_my_uploads():
    try:
        user_id = get_jwt_identity()
        
        notes = Note.query.filter_by(user_id=user_id).order_by(Note.uploaded_at.desc()).all()
        
        uploads = []
        for note in notes:
            note_data = note.to_dict()
            course = Course.query.get(note.course_id)
            note_data['course_name'] = course.name if course else 'Unknown'
            uploads.append(note_data)
        
        return jsonify({
            'success': True,
            'uploads': uploads,
            'total': len(uploads),
            'stats': {
                'approved': len([n for n in notes if n.status == 'approved']),
                'pending': len([n for n in notes if n.status == 'pending']),
                'rejected': len([n for n in notes if n.status == 'rejected'])
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== UTILITY ROUTES ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        # Test database connection
        try:
            db.session.execute('SELECT 1')
            db_status = 'connected'
            user_count = User.query.count() if hasattr(User, 'query') else 0
            course_count = Course.query.count() if hasattr(Course, 'query') else 0
            note_count = Note.query.count() if hasattr(Note, 'query') else 0
            pending_notes = Note.query.filter_by(status='pending').count() if hasattr(Note, 'query') else 0
        except Exception as db_error:
            db_status = f'error: {str(db_error)}'
            user_count = course_count = note_count = pending_notes = 0
        
        # Check uploads folder
        upload_folder = app.config['UPLOAD_FOLDER']
        uploads_exist = os.path.exists(upload_folder)
        
        if uploads_exist:
            try:
                uploads_count = len([f for f in os.listdir(upload_folder) if os.path.isfile(os.path.join(upload_folder, f))])
            except:
                uploads_count = 0
        else:
            uploads_count = 0
        
        stats = {
            'status': 'healthy' if db_status == 'connected' else 'unhealthy',
            'service': 'notes-hub-api',
            'timestamp': datetime.utcnow().isoformat(),
            'database': db_status,
            'storage': {
                'uploads_folder': uploads_exist,
                'uploads_count': uploads_count
            },
            'counts': {
                'users': user_count,
                'courses': course_count,
                'notes': note_count,
                'pending_notes': pending_notes
            }
        }
        
        status_code = 200 if db_status == 'connected' else 500
        
        return jsonify({'success': True, **stats}), status_code
        
    except Exception as e:
        return jsonify({
            'success': False, 
            'error': str(e), 
            'status': 'unhealthy',
            'timestamp': datetime.utcnow().isoformat()
        }), 500
 
 
 
@app.route('/api/test', methods=['GET'])
def test_endpoint():
    return jsonify({
        'success': True,
        'message': 'Backend is running',
        'timestamp': datetime.utcnow().isoformat(),
        'endpoint': '/api/test'
    })

@app.route('/api/db-test', methods=['GET'])
def db_test():
    try:
        # Simple test without complex queries
        result = db.session.execute('SELECT 1 as test').fetchone()
        return jsonify({
            'success': True,
            'database': 'connected',
            'test_result': result[0] if result else None
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'database': 'error',
            'error': str(e)
        }), 500
        
               
@app.route('/api/reset-db', methods=['POST'])
def reset_database():
    """Reset database (for development only)"""
    try:
        init_database()
        return jsonify({
            'success': True,
            'message': 'Database reset successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== ROOT & INFO ====================

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': '🎉 Notes Hub API',
        'version': '1.0.0',
        'status': 'running',
        'timestamp': datetime.utcnow().isoformat(),
        'endpoints': {
            'auth': ['POST /api/auth/login', 'POST /api/auth/register', 'GET /api/auth/profile'],
            'notes': ['GET /api/notes', 'POST /api/upload', 'GET /api/notes/:id/download'],
            'courses': ['GET /api/courses'],
            'user': ['GET /api/my-uploads'],
            'admin': ['GET /api/admin/pending-notes', 'GET /api/admin/stats'],
            'utility': ['GET /api/health', 'POST /api/reset-db']
        },
        'credentials': {
            'admin': {'email': 'admin@noteshub.com', 'password': 'admin123'},
            'student': {'email': 'student@test.com', 'password': 'student123'}
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

# ==================== START APPLICATION ====================

if __name__ == '__main__':
    # Initialize database
    init_database()
    
    print("=" * 60)
    print("🚀 NOTES HUB BACKEND - READY")
    print("=" * 60)
    print(f"📁 Database: {DATABASE_PATH}")
    print(f"📁 Uploads: {UPLOAD_FOLDER}")
    
    print("\n👤 Pre-configured Users:")
    print("   1. Admin: admin@noteshub.com / admin123")
    print("   2. Student: student@test.com / student123")
    
    print("\n📡 API Endpoints:")
    print("   • GET  /                     - API Info")
    print("   • POST /api/auth/login       - Login")
    print("   • POST /api/upload           - Upload notes (JWT required)")
    print("   • GET  /api/notes            - Browse notes")
    print("   • GET  /api/admin/pending-notes - Admin panel")
    
    print("\n🔧 Development Tools:")
    print("   • POST /api/reset-db         - Reset database")
    print("   • GET  /api/health           - Health check")
    
    print("\n💡 Quick Start:")
    print("   1. Login as admin")
    print("   2. Upload notes (auto-approved)")
    print("   3. Or login as student and wait for approval")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)