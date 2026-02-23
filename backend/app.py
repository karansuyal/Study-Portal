from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required,
    get_jwt_identity
)
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone, timedelta
from sqlalchemy import text
import os
import uuid
import random
import secrets
import traceback
from dotenv import load_dotenv
from flask_mail import Mail, Message

# Load environment variables
load_dotenv()

# Initialize app
app = Flask(__name__)

# ==================== CONFIGURATION ====================
basedir = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(basedir, 'uploads')

# Create uploads folder if not exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# App Config
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'notes-hub-secret-key-2024')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-super-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400  # 24 hours

# ==================== MAIL CONFIGURATION ====================
app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'True') == 'True'
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER', app.config['MAIL_USERNAME'])
# Initialize mail
mail = Mail(app)

print("\n" + "="*60)
print("📧 MAIL CONFIGURATION")
print("="*60)
print(f"MAIL_SERVER: {app.config['MAIL_SERVER']}")
print(f"MAIL_PORT: {app.config['MAIL_PORT']}")
print(f"MAIL_USERNAME: {app.config['MAIL_USERNAME']}")
print(f"MAIL_DEFAULT_SENDER: {app.config['MAIL_DEFAULT_SENDER']}")
print("="*60 + "\n")

# ✅ POSTGRESQL CONNECTION WITH RENDER FIX
database_url = os.environ.get('DATABASE_URL')
if database_url and database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql://', 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url or 'postgresql://postgres:postgres@localhost:5432/noteshub'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB
app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png'}

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app, origins=["*"], supports_credentials=True)

# Print database info on startup
print("\n" + "="*70)
print(" 🚀 NOTES HUB BACKEND - POSTGRESQL VERSION")
print("="*70)
print(f" 📁 Database URL: {app.config['SQLALCHEMY_DATABASE_URI']}")
print(f" 📁 Upload folder: {UPLOAD_FOLDER}")
print("="*70 + "\n")

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

    is_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(100))
    verification_token_expiry = db.Column(db.DateTime)
    otp_code = db.Column(db.String(6))
    otp_expiry = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    notes = db.relationship('Note', backref='uploader', lazy=True)

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def generate_verification_token(self):
        self.verification_token = secrets.token_urlsafe(32)
        self.verification_token_expiry = datetime.now(timezone.utc) + timedelta(hours=24)
        return self.verification_token

    def generate_otp(self):
        self.otp_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        self.otp_expiry = datetime.now(timezone.utc) + timedelta(minutes=10)
        return self.otp_code

    def verify_otp(self, otp):
        if self.otp_code == otp and self.otp_expiry > datetime.now(timezone.utc):
            self.is_verified = True
            self.otp_code = None
            self.otp_expiry = None
            return True
        return False

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'branch': self.branch,
            'semester': self.semester,
            'role': self.role,
            'is_verified': self.is_verified,
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

    # Relationships
    notes = db.relationship('Note', backref='course_ref', lazy=True)
    subjects = db.relationship('Subject', backref='course_ref', lazy=True)

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


class UserRating(db.Model):
    __tablename__ = 'user_ratings'

    id = db.Column(db.Integer, primary_key=True)
    note_id = db.Column(db.Integer, db.ForeignKey('notes.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (db.UniqueConstraint('note_id', 'user_id', name='unique_user_note_rating'),)


class Subject(db.Model):
    __tablename__ = 'subjects'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    code = db.Column(db.String(20))
    semester = db.Column(db.Integer, nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)

    # Relationships
    notes = db.relationship('Note', backref='subject_ref', lazy=True)

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
    rating = db.Column(db.Float, default=0)
    rating_count = db.Column(db.Integer, default=0)
    rating_sum = db.Column(db.Integer, default=0)

    status = db.Column(db.String(20), default='pending')
    rejection_reason = db.Column(db.Text)
    downloads = db.Column(db.Integer, default=0)
    views = db.Column(db.Integer, default=0)

    uploaded_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    approved_at = db.Column(db.DateTime)

    # Foreign keys
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def to_dict(self):
        user = db.session.get(User, self.user_id) if self.user_id else None
        course = db.session.get(Course, self.course_id) if self.course_id else None
        subject = db.session.get(Subject, self.subject_id) if self.subject_id else None

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
            'rating': self.rating or 0,
            'rating_count': self.rating_count or 0,
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


# ==================== EMAIL SERVICE ====================

def send_verification_email(to_email, token, name):
    try:
        verification_link = f"https://study-portal-ill8.onrender.com/api/verify-email?token={token}"

        sender_email = "studyportal02@gmail.com"
        sender_password = "wbdi hqpm krch yhix"

        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = to_email
        msg['Subject'] = "Verify Your Study Portal Account"

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <tr>
                    <td style="padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">📚 Study Portal</h1>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 40px 30px;">
                        <h2 style="color: #333; margin-top: 0;">Welcome, {name}! 👋</h2>
                        <p style="color: #666; line-height: 1.6; font-size: 16px;">
                            Thank you for registering at Study Portal. Please verify your email address by clicking the button below:
                        </p>

                        <div style="text-align: center; margin: 35px 0;">
                            <a href="{verification_link}"
                               style="display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                                ✅ Verify Email
                            </a>
                        </div>

                        <p style="color: #666; line-height: 1.6; font-size: 14px;">
                            Or copy and paste this link in your browser:<br>
                            <span style="color: #667eea; word-break: break-all;">{verification_link}</span>
                        </p>

                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

                        <p style="color: #999; font-size: 12px; margin: 0;">
                            ⏰ This link will expire in 24 hours.<br>
                            If you didn't create an account, please ignore this email.
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px; background: #f9f9f9; text-align: center; border-top: 1px solid #eee;">
                        <p style="color: #999; font-size: 12px; margin: 0;">
                            © 2026 Study Portal. All rights reserved.
                        </p>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """

        msg.attach(MIMEText(html, 'html'))

        print(f"📧 Sending email to {to_email}...")
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()

        print(f"✅ Email sent successfully to {to_email}")
        return True

    except Exception as e:
        print(f"❌ Email sending failed: {str(e)}")
        traceback.print_exc()
        return False


# ==================== DATABASE INIT ====================

def init_database():
    """Initialize database with sample data"""
    with app.app_context():
        db.create_all()
        print("✅ Database tables created/verified")

        # Create admin if not exists
        admin = db.session.execute(
            db.select(User).filter_by(email='admin@noteshub.com')
        ).scalar_one_or_none()

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
        student = db.session.execute(
            db.select(User).filter_by(email='student@test.com')
        ).scalar_one_or_none()

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

        # Create courses if not exist
        if db.session.execute(db.select(Course)).first() is None:
            courses = [
                {'name': 'BTECH', 'branch': 'CSE', 'semester': 0, 'code': 'BTECH'},
                {'name': 'BCA', 'branch': 'Computer Applications', 'semester': 0, 'code': 'BCA'},
                {'name': 'BBA', 'branch': 'Business Administration', 'semester': 0, 'code': 'BBA'},
                {'name': 'MBA', 'branch': 'Management', 'semester': 0, 'code': 'MBA'},
                {'name': 'MCA', 'branch': 'Computer Applications', 'semester': 0, 'code': 'MCA'}
            ]
            for c in courses:
                course = Course(**c)
                db.session.add(course)
            print("✅ Sample courses created")

        db.session.commit()

        # Print stats
        print(f"\n📊 DATABASE STATS:")
        print(f"   Users: {db.session.execute(db.select(db.func.count()).select_from(User)).scalar()}")
        print(f"   Courses: {db.session.execute(db.select(db.func.count()).select_from(Course)).scalar()}")
        print(f"   Subjects: {db.session.execute(db.select(db.func.count()).select_from(Subject)).scalar()}")
        print(f"   Notes: {db.session.execute(db.select(db.func.count()).select_from(Note)).scalar()}")


# ==================== HELPER FUNCTIONS ====================

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


def format_bytes(bytes):
    if not bytes:
        return 'N/A'
    units = ['B', 'KB', 'MB', 'GB']
    size = bytes
    unit_index = 0
    while size >= 1024 and unit_index < len(units) - 1:
        size /= 1024
        unit_index += 1
    return f"{size:.1f} {units[unit_index]}"


# ==================== HEALTH CHECK ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        db.session.execute(text('SELECT 1')).scalar()
        return jsonify({
            'success': True,
            'message': 'API is healthy',
            'database': {
                'status': 'connected',
                'type': 'PostgreSQL',
                'users': db.session.execute(db.select(db.func.count()).select_from(User)).scalar(),
                'courses': db.session.execute(db.select(db.func.count()).select_from(Course)).scalar(),
                'notes': db.session.execute(db.select(db.func.count()).select_from(Note)).scalar()
            },
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Database error',
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


# ==================== INIT DB ROUTE ====================

@app.route('/api/init-db', methods=['GET'])
def init_db_route():
    try:
        init_database()
        return jsonify({'success': True, 'message': 'Database initialized!'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500



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
    
    
user = User(
    name=data['name'],
    email=data['email'],
    branch=data['branch'],
    semester=int(data['semester']),
    role=data.get('role', 'student'),
    is_verified=True  # ✅ Ye change kar diya
)
# ==================== AUTH ROUTES ====================

# @app.route('/api/auth/login', methods=['POST'])
# def login():
#     try:
#         data = request.get_json()
#         if not data.get('email') or not data.get('password'):
#             return jsonify({'success': False, 'error': 'Email and password required'}), 400

#         user = User.query.filter_by(email=data['email']).first()

#         if not user or not user.check_password(data['password']):
#             return jsonify({'success': False, 'error': 'Invalid credentials'}), 401

#         if not user.is_verified:
#             return jsonify({
#                 'success': False,
#                 'error': 'Please verify your email first',
#                 'needs_verification': True,
#                 'email': user.email
#             }), 403

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
#         print(f"📥 Registration data: {data}")

#         required = ['name', 'email', 'password', 'branch', 'semester']
#         for field in required:
#             if not data.get(field):
#                 return jsonify({'success': False, 'error': f'{field} required'}), 400

#         existing_user = db.session.execute(
#             db.select(User).filter_by(email=data['email'])
#         ).scalar_one_or_none()

#         if existing_user:
#             return jsonify({'success': False, 'error': 'Email already exists'}), 409

#         user = User(
#             name=data['name'],
#             email=data['email'],
#             branch=data['branch'],
#             semester=int(data['semester']),
#             role=data.get('role', 'student'),
#             is_verified=False
#         )
#         user.set_password(data['password'])

#         token = user.generate_verification_token()
#         print(f"🔑 Generated token: {token}")

#         db.session.add(user)
#         db.session.commit()
#         print(f"✅ User saved with ID: {user.id}")

#         send_verification_email(user.email, token, user.name)

#         return jsonify({
#             'success': True,
#             'message': 'Registration successful! Please check your email to verify your account.',
#             'user': user.to_dict()
#         }), 201

#     except Exception as e:
#         db.session.rollback()
#         print(f"❌ ERROR in register: {str(e)}")
#         traceback.print_exc()
#         return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/auth/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = db.session.get(User, int(user_id))

        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        return jsonify({
            'success': True,
            'user': user.to_dict()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/verify-email', methods=['GET'])
def verify_email():
    try:
        token = request.args.get('token')

        if not token:
            return jsonify({'success': False, 'error': 'No token provided'}), 400

        print(f"🔍 Verifying token: {token}")

        user = User.query.filter_by(verification_token=token).first()

        if not user:
            return jsonify({'success': False, 'error': 'Invalid token'}), 400

        current_time = datetime.now(timezone.utc)

        if user.verification_token_expiry.tzinfo is None:
            expiry = user.verification_token_expiry.replace(tzinfo=timezone.utc)
        else:
            expiry = user.verification_token_expiry

        if expiry < current_time:
            return jsonify({'success': False, 'error': 'Token expired'}), 400

        user.is_verified = True
        user.verification_token = None
        user.verification_token_expiry = None
        db.session.commit()

        print(f"✅ User {user.email} verified successfully")

        return jsonify({
            'success': True,
            'message': 'Email verified successfully! You can now login.'
        })

    except Exception as e:
        print(f"❌ Verification error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ==================== ADMIN ROUTES ====================

@app.route('/api/admin/stats', methods=['GET'])
@jwt_required()
def admin_stats():
    try:
        user_id = get_jwt_identity()
        user = db.session.get(User, int(user_id))
        if not user or user.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403

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


# ==================== COURSE ROUTES ====================

@app.route('/api/courses', methods=['GET'])
def get_all_courses():
    courses = db.session.execute(db.select(Course)).scalars().all()
    return jsonify({'success': True, 'courses': [c.to_dict() for c in courses]})


@app.route('/api/programs', methods=['GET'])
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


@app.route('/api/courses/<int:course_id>', methods=['GET'])
def get_course(course_id):
    course = db.session.get(Course, course_id)
    if not course:
        return jsonify({'success': False, 'error': 'Course not found'}), 404
    return jsonify({'success': True, 'course': course.to_dict()})


# ==================== SUBJECT ROUTES ====================

@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    course_id = request.args.get('course_id')
    semester = request.args.get('semester')

    query = db.select(Subject)
    if course_id:
        query = query.filter_by(course_id=int(course_id))
    if semester:
        query = query.filter_by(semester=int(semester))

    subjects = db.session.execute(query).scalars().all()
    return jsonify({
        'success': True,
        'subjects': [s.to_dict() for s in subjects]
    })


# ==================== NOTE ROUTES ====================

@app.route('/api/notes', methods=['GET'])
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

        print(f"✅ Found {len(notes)} notes")

        return jsonify({
            'success': True,
            'notes': [note.to_dict() for note in notes],
            'total': len(notes)
        })

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/notes/<int:note_id>', methods=['GET'])
def get_note_detail(note_id):
    try:
        print(f"\n{'='*50}")
        print(f"📢 VIEWS API CALLED for note ID: {note_id}")

        note = db.session.get(Note, note_id)
        if not note:
            print(f"❌ Note {note_id} not found!")
            return jsonify({'success': False, 'error': 'Note not found'}), 404

        print(f"📢 Current views before increment: {note.views}")

        note.views += 1
        db.session.commit()

        print(f"✅ Views after increment: {note.views}")
        print(f"{'='*50}\n")

        return jsonify({
            'success': True,
            'note': note.to_dict()
        })

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error in views increment: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/notes/<int:note_id>/rate', methods=['POST'])
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

        existing_rating = db.session.execute(
            db.select(UserRating).filter_by(
                note_id=note_id,
                user_id=user.id
            )
        ).scalar_one_or_none()

        if existing_rating:
            old_rating = existing_rating.rating
            existing_rating.rating = rating_value
            existing_rating.updated_at = datetime.now(timezone.utc)

            note.rating_sum = note.rating_sum - old_rating + rating_value
            note.rating = note.rating_sum / note.rating_count

            message = 'Rating updated successfully'
        else:
            user_rating = UserRating(
                note_id=note_id,
                user_id=user.id,
                rating=rating_value
            )
            db.session.add(user_rating)

            if note.rating_count is None:
                note.rating_count = 0
                note.rating_sum = 0

            note.rating_count += 1
            note.rating_sum += rating_value
            note.rating = note.rating_sum / note.rating_count

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
        print(f"❌ Rating error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ==================== MATERIALS ROUTE (PUBLIC) ====================

@app.route('/api/materials', methods=['GET'])
def get_all_materials():
    try:
        print("\n📦 FETCHING ALL MATERIALS")

        notes = db.session.execute(
            db.select(Note).filter_by(status='approved').order_by(Note.uploaded_at.desc())
        ).scalars().all()

        materials_list = []
        for note in notes:
            course = db.session.get(Course, note.course_id)
            subject = db.session.get(Subject, note.subject_id) if note.subject_id else None
            user = db.session.get(User, note.user_id)

            materials_list.append({
                'id': note.id,
                'title': note.title,
                'description': note.description,
                'type': note.note_type,
                'course': course.name if course else 'Unknown',
                'course_id': note.course_id,
                'subject': subject.name if subject else 'General',
                'subject_id': note.subject_id,
                'file_name': note.file_name,
                'file_size': format_bytes(note.file_size),
                'file_type': note.file_type,
                'downloads': note.downloads,
                'views': note.views,
                'uploaded_at': note.uploaded_at.isoformat() if note.uploaded_at else None,
                'user_name': user.name if user else 'Unknown',
                'download_url': f'/api/notes/{note.id}/download'
            })

        print(f"✅ Found {len(materials_list)} materials")

        return jsonify({
            'success': True,
            'materials': materials_list,
            'total': len(materials_list)
        })

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ==================== UPLOAD ROUTE ====================

@app.route('/api/upload', methods=['POST'])
@jwt_required()
def upload_note():
    try:
        user_id = get_jwt_identity()
        print(f"👤 User ID from token: {user_id}")

        user = db.session.get(User, int(user_id))
        if not user:
            print("❌ User not found")
            return jsonify({'success': False, 'error': 'User not found'}), 404

        if 'file' not in request.files:
            print("❌ No file in request")
            return jsonify({'success': False, 'error': 'No file uploaded'}), 400

        file = request.files['file']
        if file.filename == '':
            print("❌ Empty filename")
            return jsonify({'success': False, 'error': 'No file selected'}), 400

        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        course_id = request.form.get('course_id')
        subject_id = request.form.get('subject_id')
        note_type = request.form.get('type', 'notes')

        print(f"\n📥 UPLOAD REQUEST:")
        print(f"   Title: {title}")
        print(f"   Course ID: {course_id}")
        print(f"   Subject ID: {subject_id}")
        print(f"   Type: {note_type}")

        if not title:
            print("❌ No title")
            return jsonify({'success': False, 'error': 'Title is required'}), 400
        if not course_id:
            print("❌ No course_id")
            return jsonify({'success': False, 'error': 'Course ID is required'}), 400

        if not allowed_file(file.filename):
            print(f"❌ File type not allowed: {file.filename}")
            return jsonify({'success': False, 'error': 'File type not allowed'}), 400

        try:
            course = db.session.get(Course, int(course_id))
            if not course:
                print(f"❌ Course not found: {course_id}")
                return jsonify({'success': False, 'error': f'Course with ID {course_id} not found'}), 404
        except ValueError:
            print(f"❌ Invalid course_id: {course_id}")
            return jsonify({'success': False, 'error': 'Invalid course ID'}), 400

        print(f"✅ Course found: {course.name}")

        course_folder = course.name.replace(' ', '_')
        course_upload_path = os.path.join(app.config['UPLOAD_FOLDER'], course_folder)
        os.makedirs(course_upload_path, exist_ok=True)
        print(f"📁 Folder created: {course_upload_path}")

        original_filename = secure_filename(file.filename)
        file_ext = original_filename.rsplit('.', 1)[1].lower()
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{note_type}_{timestamp}_{uuid.uuid4().hex[:6]}.{file_ext}"
        file_path = os.path.join(course_upload_path, unique_filename)
        file.save(file_path)
        file_size = os.path.getsize(file_path)
        print(f"💾 File saved: {file_path}")

        is_admin = user.role == 'admin'

        note = Note(
            title=title,
            description=description,
            file_name=unique_filename,
            original_filename=original_filename,
            file_path=file_path,
            file_type=file_ext,
            file_size=file_size,
            note_type=note_type,
            course_id=course.id,
            subject_id=subject_id if subject_id else None,
            user_id=user.id,
            status='approved' if is_admin else 'pending',
            uploaded_at=datetime.now(timezone.utc),
            approved_at=datetime.now(timezone.utc) if is_admin else None
        )

        db.session.add(note)
        db.session.commit()
        print(f"✅ Note saved with ID: {note.id}")

        response_data = {
            'success': True,
            'message': 'File uploaded successfully!' + (' Auto-approved for admin.' if is_admin else ' Waiting for admin approval.'),
            'note': note.to_dict(),
            'file_url': f'/api/files/{course_folder}/{unique_filename}',
            'status': note.status
        }
        print(f"📤 Sending response: {response_data}")

        return jsonify(response_data), 201

    except Exception as e:
        db.session.rollback()
        print(f"❌ EXCEPTION: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


# ==================== USER MANAGEMENT ROUTES ====================

@app.route('/api/admin/users', methods=['GET'])
@jwt_required()
def get_all_users():
    try:
        admin_id = get_jwt_identity()
        admin = db.session.get(User, int(admin_id))

        if not admin or admin.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403

        print("\n" + "="*50)
        print("📢 FETCHING ALL USERS")
        print(f"👑 Admin ID: {admin_id}, Admin: {admin.name if admin else 'None'}")

        users = db.session.execute(
            db.select(User).order_by(User.created_at.desc())
        ).scalars().all()

        print(f"📊 Total users in DB: {len(users)}")

        user_list = []
        for user in users:
            upload_count = db.session.execute(
                db.select(db.func.count()).select_from(Note).filter_by(user_id=user.id)
            ).scalar()

            user_dict = user.to_dict()
            user_dict['upload_count'] = upload_count
            user_list.append(user_dict)

            print(f"   - {user.name} ({user.email}) - Uploads: {upload_count}")

        print("="*50 + "\n")

        return jsonify({
            'success': True,
            'users': user_list,
            'total': len(user_list)
        })

    except Exception as e:
        print(f"❌ ERROR in get_all_users: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/admin/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_details(user_id):
    try:
        admin_id = get_jwt_identity()
        admin = db.session.get(User, int(admin_id))

        if not admin or admin.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403

        user = db.session.get(User, user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        return jsonify({
            'success': True,
            'user': user.to_dict()
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    try:
        admin_id = get_jwt_identity()
        admin = db.session.get(User, int(admin_id))

        if not admin or admin.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403

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

        return jsonify({
            'success': True,
            'message': 'User updated successfully',
            'user': user.to_dict()
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    try:
        admin_id = get_jwt_identity()
        admin = db.session.get(User, int(admin_id))

        if not admin or admin.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403

        if admin.id == user_id:
            return jsonify({'success': False, 'error': 'Cannot delete yourself'}), 400

        user = db.session.get(User, user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        print(f"\n🗑️ Attempting to delete user: {user.name} (ID: {user.id})")

        notes = Note.query.filter_by(user_id=user_id).all()
        print(f"📊 Found {len(notes)} notes uploaded by this user")

        deleted_files = 0
        for note in notes:
            if note.file_path and os.path.exists(note.file_path):
                try:
                    os.remove(note.file_path)
                    print(f"✅ Deleted file: {note.file_path}")
                    deleted_files += 1
                except Exception as e:
                    print(f"⚠️ Could not delete file {note.file_path}: {str(e)}")

        for note in notes:
            db.session.delete(note)

        db.session.delete(user)
        db.session.commit()

        print(f"✅ User {user.name} deleted successfully")
        print(f"   Files deleted: {deleted_files}")
        print(f"   Notes deleted: {len(notes)}")

        return jsonify({
            'success': True,
            'message': f'User {user.name} and all their uploads deleted successfully',
            'stats': {
                'files_deleted': deleted_files,
                'notes_deleted': len(notes)
            }
        })

    except Exception as e:
        db.session.rollback()
        print(f"❌ ERROR deleting user: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/admin/notes/<int:note_id>', methods=['DELETE'])
@jwt_required()
def delete_note(note_id):
    try:
        user_id = get_jwt_identity()
        user = db.session.get(User, int(user_id))
        if not user or user.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403

        note = db.session.get(Note, note_id)
        if not note:
            return jsonify({'success': False, 'error': 'Note not found'}), 404

        if os.path.exists(note.file_path):
            try:
                os.remove(note.file_path)
            except:
                pass

        db.session.delete(note)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Note deleted successfully'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ==================== FILE SERVING ====================

@app.route('/api/files/<path:filepath>', methods=['GET'])
def get_file(filepath):
    try:
        directory = os.path.dirname(filepath)
        filename = os.path.basename(filepath)

        if directory:
            full_path = os.path.join(app.config['UPLOAD_FOLDER'], directory)
            return send_from_directory(full_path, filename)
        else:
            return send_from_directory(app.config['UPLOAD_FOLDER'], filepath)
    except Exception as e:
        return jsonify({'success': False, 'error': 'File not found'}), 404


@app.route('/api/notes/<int:note_id>/download', methods=['GET'])
def download_note(note_id):
    try:
        note = db.session.get(Note, note_id)
        if not note:
            return jsonify({'success': False, 'error': 'Note not found'}), 404

        if not os.path.exists(note.file_path):
            return jsonify({'success': False, 'error': 'File not found'}), 404

        note.downloads += 1
        db.session.commit()

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

        return send_file(
            note.file_path,
            as_attachment=True,
            download_name=note.original_filename,
            mimetype=mimetype
        )

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ==================== ROOT ROUTE ====================

@app.route('/')
def home():
    return jsonify({
        'message': 'Notes Hub API',
        'version': '2.0',
        'database': 'PostgreSQL',
        'status': 'running',
        'timestamp': datetime.now(timezone.utc).isoformat()
    })


# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404


@jwt.unauthorized_loader
def unauthorized_response(callback):
    return jsonify({'success': False, 'error': 'Authentication required'}), 401


# ==================== START APP ====================

if __name__ == '__main__':
    init_database()

    print("\n" + "="*70)
    print(" 🚀 NOTES HUB BACKEND - POSTGRESQL VERSION")
    print("="*70)
    print(" 📋 AVAILABLE ROUTES:")
    for rule in app.url_map.iter_rules():
        print(f"    {rule}")
    print("\n" + "="*70)
    print(" 🚀 SERVER STARTING on http://localhost:5000")
    print("="*70 + "\n")

    app.run(debug=True, host='0.0.0.0', port=5000)