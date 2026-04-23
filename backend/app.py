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
import sendgrid 
from sendgrid.helpers.mail import Mail, Email, To, Content
import uuid
from datetime import datetime
from flask import redirect 
from cloudinary_config import configure_cloudinary
import cloudinary.uploader
import cloudinary.api
import google.generativeai as genai
import resend
from google_drive import upload_to_drive
from flask_jwt_extended import jwt_required, get_jwt_identity

configure_cloudinary()

# Resend configuration
resend.api_key = os.environ.get('RESEND_API_KEY')

# Load environment variables
load_dotenv()
print(f"📁 .env file loaded, MAIL_USERNAME from env: {os.environ.get('MAIL_USERNAME')}")

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
app.config['JWT_ALGORITHM'] = 'HS256'
app.config['JWT_DECODE_ALGORITHMS'] = ['HS256']

print("\n" + "="*60)
print("📧 MAIL CONFIGURATION")
print("="*60)
print("📧 Using SendGrid for emails")
print("="*60 + "\n")

# ✅ POSTGRESQL CONNECTION WITH RENDER 
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
CORS(app, origins=["*"], supports_credentials=True, 
     allow_headers=["Content-Type", "Authorization", "Accept"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

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
    cloudinary_url = db.Column(db.String(500))  
    cloudinary_public_id = db.Column(db.String(200))
    is_youtube = db.Column(db.Boolean, default=False)
    youtube_url = db.Column(db.String(500))
    youtube_id = db.Column(db.String(20))
    youtube_thumbnail = db.Column(db.String(500))
    youtube_embed_url = db.Column(db.String(500))

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
            'user_email': user.email if user else 'Unknown',
            'cloudinary_url': self.cloudinary_url,  
            'cloudinary_public_id': self.cloudinary_public_id,
            'is_youtube': self.is_youtube or False,
            'youtube_url': self.youtube_url,
            'youtube_id': self.youtube_id,
            'youtube_thumbnail': self.youtube_thumbnail,
            'youtube_embed_url': self.youtube_embed_url
        }
        
        
        
# ==================== EMAIL SERVICE ====================

def send_verification_email(to_email, token, name):
    try:
        verification_link = f"https://study-portal-ill8.onrender.com/api/verify-email?token={token}"
        
        SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
        
        # Email content
        html_content = f"""
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
        
        # Send email via SendGrid
        sg = sendgrid.SendGridAPIClient(api_key=SENDGRID_API_KEY)
        from_email = Email("studyportal02@gmail.com")  # Verified sender
        to_email = To(to_email)
        subject = "Verify Your Study Portal Account"
        content = Content("text/html", html_content)
        
        mail = Mail(from_email, to_email, subject, content)
        response = sg.client.mail.send.post(request_body=mail.get())
        
        print(f"📧 SendGrid response: {response.status_code}")
        if response.status_code == 202:
            print(f"✅ Email sent successfully to {to_email}")
            return True
        else:
            print(f"❌ SendGrid error: {response.status_code}")
            return False
            
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

        if not user.is_verified:
            return jsonify({
                'success': False,
                'error': 'Please verify your email first',
                'needs_verification': True,
                'email': user.email
            }), 403

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
        print(f"📥 Registration data: {data}")

        required = ['name', 'email', 'password', 'branch', 'semester']
        for field in required:
            if not data.get(field):
                return jsonify({'success': False, 'error': f'{field} required'}), 400

        existing_user = db.session.execute(
            db.select(User).filter_by(email=data['email'])
        ).scalar_one_or_none()

        if existing_user:
            return jsonify({'success': False, 'error': 'Email already exists'}), 409

        user = User(
            name=data['name'],
            email=data['email'],
            branch=data['branch'],
            semester=int(data['semester']),
            role=data.get('role', 'student'),
            is_verified=False
        )
        user.set_password(data['password'])

        token = user.generate_verification_token()
        print(f"🔑 Generated token: {token}")

        db.session.add(user)
        db.session.commit()
        print(f"✅ User saved with ID: {user.id}")

        send_verification_email(user.email, token, user.name)

        return jsonify({
            'success': True,
            'message': 'Registration successful! Please check your email to verify your account.',
            'user': user.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"❌ ERROR in register: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500
    
# ==================== FORGOT PASSWORD ROUTES ====================

def send_password_reset_email(to_email, token, name):
    try:
        reset_link = f"https://study-portal-app.vercel.app/reset-password?token={token}"
        
        print(f"📧 Preparing password reset email for: {to_email}")
        print(f"🔗 Reset link: {reset_link}")
        
        SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
        if not SENDGRID_API_KEY:
            print("❌ SENDGRID_API_KEY not found in environment variables")
            return False
            
        print(f"✅ SendGrid API Key found (length: {len(SENDGRID_API_KEY)})")
        
        import sendgrid
        from sendgrid.helpers.mail import Mail, Email, To, Content
        
        html_content = f"""
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
                        <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
                        <p style="color: #666; line-height: 1.6; font-size: 16px;">
                            Hello {name}, we received a request to reset your password. Click the button below to set a new password:
                        </p>

                        <div style="text-align: center; margin: 35px 0;">
                            <a href="{reset_link}"
                               style="display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                                🔑 Reset Password
                            </a>
                        </div>

                        <p style="color: #666; line-height: 1.6; font-size: 14px;">
                            Or copy and paste this link in your browser:<br>
                            <span style="color: #667eea; word-break: break-all;">{reset_link}</span>
                        </p>

                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

                        <p style="color: #999; font-size: 12px; margin: 0;">
                            ⏰ This link will expire in 1 hour.<br>
                            If you didn't request this, please ignore this email.
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
        
        sg = sendgrid.SendGridAPIClient(api_key=SENDGRID_API_KEY)
        from_email = Email("studyportal02@gmail.com")
        to_email = To(to_email)
        subject = "Password Reset Request - Study Portal"
        content = Content("text/html", html_content)
        
        mail = Mail(from_email, to_email, subject, content)
        print(f"📤 Sending via SendGrid...")
        
        response = sg.client.mail.send.post(request_body=mail.get())
        
        print(f"📧 SendGrid response status: {response.status_code}")
        print(f"📧 SendGrid response body: {response.body}")
        print(f"📧 SendGrid response headers: {response.headers}")
        
        if response.status_code == 202:
            print(f"✅ Password reset email sent to {to_email}")
            return True
        else:
            print(f"❌ SendGrid error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Password reset email failed: {str(e)}")
        traceback.print_exc()
        return False


@app.route('/api/auth/forgot-password', methods=['POST', 'OPTIONS'])
def forgot_password():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = jsonify({'success': True})
        response.headers.add('Access-Control-Allow-Origin', 'https://study-portal-app.vercel.app')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 200
        
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'success': False, 'error': 'Email is required'}), 400
            
        # Find user
        user = User.query.filter_by(email=email).first()
        
        # Always return success even if user not found (security)
        if not user:
            print(f"🔍 Forgot password attempt for non-existent email: {email}")
            return jsonify({
                'success': True, 
                'message': 'If an account exists with this email, you will receive password reset instructions.'
            }), 200
            
        # Generate reset token
        reset_token = secrets.token_urlsafe(32)
        user.verification_token = reset_token
        user.verification_token_expiry = datetime.now(timezone.utc) + timedelta(hours=1)
        db.session.commit()
        
        # Send reset email
        send_password_reset_email(user.email, reset_token, user.name)
        
        return jsonify({
            'success': True,
            'message': 'Password reset instructions sent to your email.'
        }), 200
        
    except Exception as e:
        print(f"❌ Forgot password error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/auth/reset-password', methods=['POST', 'OPTIONS'])
def reset_password():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = jsonify({'success': True})
        response.headers.add('Access-Control-Allow-Origin', 'https://study-portal-app.vercel.app')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 200
        
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('password')
        
        if not token or not new_password:
            return jsonify({'success': False, 'error': 'Token and password are required'}), 400
            
        # Find user by token
        user = User.query.filter_by(verification_token=token).first()
        
        if not user:
            return jsonify({'success': False, 'error': 'Invalid or expired token'}), 400
            
        # Check expiry
        current_time = datetime.now(timezone.utc)
        if user.verification_token_expiry.tzinfo is None:
            expiry = user.verification_token_expiry.replace(tzinfo=timezone.utc)
        else:
            expiry = user.verification_token_expiry
            
        if expiry < current_time:
            return jsonify({'success': False, 'error': 'Token expired'}), 400
            
        # Update password
        user.set_password(new_password)
        user.verification_token = None
        user.verification_token_expiry = None
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Password reset successfully! You can now login with your new password.'
        }), 200
        
    except Exception as e:
        print(f"❌ Reset password error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500



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

# ==================== AI CHATBOT (GEMINI API) ====================
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    print("✅ Gemini AI configured successfully")
    
    # Test available models
    try:
        available_models = genai.list_models()
        gemini_models = [m.name for m in available_models if 'gemini' in m.name]
        print(f"📋 Available Gemini models: {gemini_models[:5]}")
    except:
        print("⚠️ Could not list models")
else:
    print("⚠️ GEMINI_API_KEY not found, chatbot will use fallback mode")

# Helper function to get user context
def get_user_context(user_id):
    try:
        user = db.session.get(User, int(user_id))
        if not user:
            return None
        
        # Get user's enrolled subjects
        recent_subjects = db.session.execute(
            db.select(Note.subject_id, db.func.count(Note.id))
            .filter_by(user_id=user.id)
            .group_by(Note.subject_id)
            .limit(5)
        ).all()
        
        subject_names = []
        for sub_id, _ in recent_subjects:
            if sub_id:
                subject = db.session.get(Subject, sub_id)
                if subject:
                    subject_names.append(subject.name)
        
        return {
            'name': user.name,
            'course': user.branch or 'General',
            'semester': user.semester or 'Not specified',
            'subjects': subject_names if subject_names else ['General Studies']
        }
    except Exception as e:
        print(f"Error getting user context: {e}")
        return None

# Search database for relevant content
def search_knowledge_base(query, user_id=None):
    try:
        query_terms = query.lower().split()
        
        # Search subjects
        subjects = []
        for term in query_terms[:3]:
            subj = Subject.query.filter(Subject.name.ilike(f'%{term}%')).limit(3).all()
            subjects.extend(subj)
        
        # Search notes
        notes = []
        for term in query_terms[:3]:
            note = Note.query.filter(
                Note.title.ilike(f'%{term}%'),
                Note.status == 'approved'
            ).limit(3).all()
            notes.extend(note)
        
        # Search PYQs
        pyqs = []
        for term in query_terms[:3]:
            pyq = Note.query.filter(
                Note.note_type == 'pyq',
                Note.title.ilike(f'%{term}%'),
                Note.status == 'approved'
            ).limit(2).all()
            pyqs.extend(pyq)
        
        return {
            'subjects': list(set(subjects))[:5],
            'notes': list(set(notes))[:5],
            'pyqs': list(set(pyqs))[:3]
        }
    except Exception as e:
        print(f"Search error: {e}")
        return {'subjects': [], 'notes': [], 'pyqs': []}

# Function to get Gemini response
def get_gemini_response(prompt):
    model_names = [
        "models/gemini-2.5-flash",
        "models/gemini-2.0-flash",
        "models/gemini-2.5-pro"
    ]
    
    for model_name in model_names:
        try:
            print(f"🔄 Trying model: {model_name}")
            
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            
            if response and hasattr(response, "text"):
                print(f"✅ Success with model: {model_name}")
                return response.text.strip()
                
        except Exception as e:
            print(f"❌ Model {model_name} failed: {str(e)[:100]}")
            continue
    
    return "AI is temporarily unavailable 😔"

# Chatbot endpoint
@app.route('/api/chat', methods=['POST', 'OPTIONS'])
@jwt_required(optional=True)
def chat_with_ai():
    # Handle preflight
    if request.method == 'OPTIONS':
        response = jsonify({'success': True})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
        return response, 200
    
    try:
        user_id = get_jwt_identity()
        user_context = None
        
        if user_id:
            user = db.session.get(User, int(user_id))
            if user:
                user_context = get_user_context(user.id)
        
        data = request.get_json()
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({'success': False, 'error': 'Message is required'}), 400
        
        # Search database for relevant content
        search_results = search_knowledge_base(user_message, user_id)
        
        # Prepare context from search results
        context = ""
        if search_results['subjects']:
            context += "\n📚 **Relevant Subjects:**\n"
            for sub in search_results['subjects'][:3]:
                context += f"- {sub.name}\n"
        
        if search_results['notes']:
            context += "\n📄 **Available Notes:**\n"
            for note in search_results['notes'][:3]:
                context += f"- {note.title}\n"
        
        if search_results['pyqs']:
            context += "\n📝 **PYQs Available:**\n"
            for pyq in search_results['pyqs'][:2]:
                context += f"- {pyq.title}\n"
        
        # Prepare prompt
        if user_context:
            prompt = f"""You are a helpful study assistant for a college student.

**Student Profile:**
- Name: {user_context['name']}
- Course: {user_context['course']}
- Semester: {user_context['semester']}

**Relevant Materials from Portal:**
{context if context else "No specific materials found in database for this query."}

**Student's Question:** {user_message}

**Instructions:**
1. Be friendly and encouraging 😊
2. Use the relevant materials from above if they help answer the question
3. If specific notes/PYQs are mentioned, suggest them
4. Keep response concise (max 150-200 words)
5. If you don't know something, suggest checking the study portal or asking a teacher

**Your Response:**"""
        else:
            prompt = f"""You are a helpful study assistant for a student.

**Relevant Materials from Portal:**
{context if context else "No specific materials found."}

**Student's Question:** {user_message}

**Instructions:**
1. Be friendly and helpful 
2. Give concise answers (max 150 words)
3. Suggest checking the study portal for more resources

**Your Response:**"""

        # Call Gemini API or use fallback
        ai_response = None
        
        if GEMINI_API_KEY:
            ai_response = get_gemini_response(prompt)
        
        # If Gemini failed or not configured, use fallback
        if not ai_response:
            ai_response = fallback_response(user_message, context)
        
        # Add helpful tip if materials found
        if search_results['notes'] or search_results['pyqs']:
            ai_response += "\n\n💡 **Tip:** Check the Materials section on the portal for more study resources!"
        
        return jsonify({
            'success': True,
            'response': ai_response
        })
        
    except Exception as e:
        print(f"❌ Chat error: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'success': True,
            'response': "I'm having a bit of trouble right now. Please try again in a moment! 🙏"
        })

def fallback_response(question, context):
    """Fallback when Gemini API is not available"""
    question_lower = question.lower()
    
    if 'notes' in question_lower or 'study material' in question_lower:
        return "📚 You can find study materials in the **Materials** section! Browse by course, year, and semester to access notes, PYQs, and syllabus."
    
    elif 'pyq' in question_lower or 'previous year' in question_lower:
        return "📝 Previous Year Questions are available in the Materials section. Select your course and subject to find PYQs for exam preparation!"
    
    elif 'exam' in question_lower or 'prepare' in question_lower:
        return "🎯 Exam preparation tips:\n• Review all PYQs\n• Make short notes\n• Practice regularly\n• Check the syllabus for important topics\n\nGood luck with your exams! 💪"
    
    elif 'syllabus' in question_lower:
        return "📋 Syllabus for all courses is available in the Materials section. Select your course, year, and semester to find the complete syllabus."
    
    else:
        return f"👋 Hi there! I'm your study assistant. You can ask me about:\n\n📚 Notes & Study Materials\n📝 Previous Year Questions (PYQs)\n📋 Syllabus\n🎯 Exam Preparation\n\nWhat would you like to know about {question}?"
    
    
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
    
    
@app.route('/api/admin/pending-notes', methods=['GET'])
@jwt_required()
def get_pending_notes():
    try:
        # Verify admin
        user_id = get_jwt_identity()
        user = db.session.get(User, int(user_id))
        if not user or user.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
        # Fetch pending notes
        notes = Note.query.filter_by(status='pending').order_by(Note.uploaded_at.desc()).all()
        
        return jsonify({
            'success': True,
            'notes': [note.to_dict() for note in notes]
        })
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/approved-notes', methods=['GET'])
@jwt_required()
def get_approved_notes():
    try:
        # Verify admin
        user_id = get_jwt_identity()
        user = db.session.get(User, int(user_id))
        if not user or user.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
        # Fetch approved notes
        notes = Note.query.filter_by(status='approved').order_by(Note.uploaded_at.desc()).all()
        
        return jsonify({
            'success': True,
            'notes': [note.to_dict() for note in notes]
        })
    except Exception as e:
        print(f"❌ Error: {str(e)}")
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
        
        if note.rating_count is None:
            note.rating_count = 0
        if note.rating_sum is None:
            note.rating_sum = 0
            
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
            note.rating = note.rating_sum / note.rating_count if note.rating_count > 0 else 0

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
        print(f"❌ Rating error: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500
    
    
@app.route('/api/notes/<int:note_id>/user-rating', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)
def get_user_rating(note_id):
    # Handle preflight OPTIONS request
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
            db.select(UserRating).filter_by(
                note_id=note_id,
                user_id=user.id
            )
        ).scalar_one_or_none()
        
        return jsonify({
            'success': True,
            'rating': rating.rating if rating else 0
        })
        
    except Exception as e:
        print(f"❌ Error fetching user rating: {str(e)}")
        return jsonify({'success': False, 'rating': 0}), 200


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
                'cloudinary_url': note.cloudinary_url,
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
    
    
# ==================== UPLOAD ROUTE (WITH YOUTUBE SUPPORT) ====================
@app.route('/api/upload', methods=['POST', 'OPTIONS'])
@jwt_required()
def upload_note():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = jsonify({'success': True})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
        return response, 200
        
    try:
        user_id = get_jwt_identity()
        print(f"👤 User ID from token: {user_id}")

        user = db.session.get(User, int(user_id))
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        # ✅ CHECK IF IT'S A YOUTUBE VIDEO
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
            
            # Validate YouTube ID (should be 11 characters)
            if len(youtube_id) != 11:
                return jsonify({'success': False, 'error': 'Invalid YouTube video ID'}), 400
            
            youtube_thumbnail = f"https://img.youtube.com/vi/{youtube_id}/maxresdefault.jpg"
            youtube_embed_url = f"https://www.youtube.com/embed/{youtube_id}"
            
            # Parse description JSON if exists
            try:
                youtube_data = json.loads(description) if description else {}
                actual_description = youtube_data.get('description', '')
            except:
                actual_description = description
            
            is_admin = user.role == 'admin'
            
            # Create note record for YouTube video
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
                # YouTube specific fields
                is_youtube=True,
                youtube_url=youtube_url,
                youtube_id=youtube_id,
                youtube_thumbnail=youtube_thumbnail,
                youtube_embed_url=youtube_embed_url,
                # Additional fields
                file_name=youtube_id,
                original_filename=f"{title}.youtube",
                file_type='youtube',
                file_path=youtube_url
            )
            
            db.session.add(note)
            db.session.commit()
            
            print(f"✅ YouTube video saved with ID: {note.id}")
            print(f"🎥 YouTube ID: {youtube_id}")
            
            return jsonify({
                'success': True,
                'message': 'YouTube video added successfully!',
                'note': note.to_dict(),
                'status': note.status
            }), 201
        
        # ==================== FILE UPLOAD HANDLING (EXISTING CODE) ====================
        else:
            if 'file' not in request.files:
                return jsonify({'success': False, 'error': 'No file uploaded'}), 400

            file = request.files['file']
            if file.filename == '':
                return jsonify({'success': False, 'error': 'No file selected'}), 400

            if not allowed_file(file.filename):
                return jsonify({'success': False, 'error': 'File type not allowed'}), 400

            print(f"✅ Course found: {course.name}")

            # ==================== PREPARE FILENAME ====================
            import cloudinary.uploader
            import time
            import tempfile
            import os

            original_filename = secure_filename(file.filename)

            if '.' in original_filename:
                file_ext = original_filename.rsplit('.', 1)[1].lower()
            else:
                file_ext = ""

            timestamp = int(time.time())
            unique_id = uuid.uuid4().hex[:8]
            base_filename = f"{timestamp}_{unique_id}_{original_filename}"

            # ==================== GET SUBJECT NAME ====================
            subject_name = "General"
            if subject_id and subject_id != 'null':
                subject = db.session.get(Subject, int(subject_id))
                if subject:
                    subject_name = subject.name
                    print(f"📚 Subject: {subject_name} (ID: {subject_id})")

            # ==================== CREATE CLOUDINARY FOLDER STRUCTURE ====================
            course_folder = course.name.replace(' ', '_').replace('/', '_')
            semester_folder = f"Semester_{semester}"
            subject_folder = subject_name.replace(' ', '_').replace('/', '_')
            
            cloudinary_folder = f"study_portal/{course_folder}/{semester_folder}/{subject_folder}/{note_type}"

            resource_type = "raw" if file_ext in ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'] else "image"

            print(f"📤 Uploading to Cloudinary folder: {cloudinary_folder}")
            print(f"📄 Resource Type: {resource_type}")

            # ==================== CLOUDINARY UPLOAD ====================
            upload_result = cloudinary.uploader.upload(
                file,
                folder=cloudinary_folder,
                public_id=f"{timestamp}_{unique_id}",
                resource_type=resource_type,
                type="upload",
                overwrite=False
            )

            print("✅ Cloudinary upload successful!")

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
                print(f"✅ Google Drive backup complete")
                
            except ImportError:
                print("⚠️ Google Drive module not found, skipping backup")
            except Exception as e:
                print(f"⚠️ Google Drive backup failed: {e}")

            # ==================== DATABASE SAVE ====================
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
                # YouTube fields as False
                is_youtube=False
            )

            db.session.add(note)
            db.session.commit()

            print(f"✅ Note saved with ID: {note.id}")

            return jsonify({
                'success': True,
                'message': 'File uploaded successfully!',
                'note': note.to_dict(),
                'file_url': cloudinary_url,
                'status': note.status
            }), 201

    except Exception as e:
        db.session.rollback()
        print(f"❌ Upload Error: {str(e)}")
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



@app.route('/api/admin/notes/<int:note_id>/approve', methods=['POST', 'OPTIONS'])
@jwt_required()
def approve_note(note_id):
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        user_id = get_jwt_identity()
        user = db.session.get(User, int(user_id))
        if not user or user.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
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

@app.route('/api/admin/notes/<int:note_id>/reject', methods=['POST', 'OPTIONS'])
@jwt_required()
def reject_note(note_id):
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        user_id = get_jwt_identity()
        user = db.session.get(User, int(user_id))
        if not user or user.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
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
        print(f"🔍 FILE REQUEST: {filepath}")  # Debug line
        directory = os.path.dirname(filepath)
        filename = os.path.basename(filepath)

        # Multiple paths check karo
        possible_paths = []
        
        if directory:
            path1 = os.path.join(app.config['UPLOAD_FOLDER'], directory, filename)
            possible_paths.append(('with directory', path1))
        
        path2 = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        possible_paths.append(('without directory', path2))
        
        # Try to find the file
        for path_type, full_path in possible_paths:
            print(f"🔍 Trying {path_type}: {full_path}")
            if os.path.exists(full_path):
                print(f"✅ Found at: {full_path}")
                if directory:
                    return send_from_directory(os.path.join(app.config['UPLOAD_FOLDER'], directory), filename)
                else:
                    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
        
        print(f"❌ File not found in any location")
        return jsonify({'success': False, 'error': 'File not found'}), 404
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({'success': False, 'error': 'File not found'}), 404
    
    
@app.route('/api/notes/<int:note_id>/download', methods=['GET'])
def download_note(note_id):
    try:
        note = db.session.get(Note, note_id)
        if not note:
            return jsonify({'success': False, 'error': 'Note not found'}), 404

        if note.cloudinary_url:
            print(f"✅ Redirecting to Cloudinary: {note.cloudinary_url}")
            return redirect(note.cloudinary_url)
        
        # Debug - check file path
        print(f"🔍 Download - Note ID: {note_id}")
        print(f"🔍 File path from DB: {note.file_path}")
        print(f"🔍 File exists: {os.path.exists(note.file_path)}")

        if not os.path.exists(note.file_path):
            # Try alternative paths
            filename = os.path.basename(note.file_path)
            course = note.course_ref.name.replace(' ', '_')
            
            alt_paths = [
                os.path.join(app.config['UPLOAD_FOLDER'], filename),  
                os.path.join(app.config['UPLOAD_FOLDER'], course, filename),  
            ]
            
            found = False
            for alt_path in alt_paths:
                print(f"🔍 Trying alternative: {alt_path}")
                if os.path.exists(alt_path):
                    note.file_path = alt_path
                    db.session.commit()
                    print(f"✅ Found at alternative path")
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

        return send_file(
            note.file_path,
            as_attachment=True,
            download_name=note.original_filename,
            mimetype=mimetype
        )

    except Exception as e:
        print(f"❌ Download error: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500
    
    
@app.route('/api/notes/<int:note_id>/stats', methods=['GET'])
def get_note_stats(note_id):
    """Unified endpoint for views/downloads/rating"""
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
    
    
# ==================== DOWNLOAD COUNT INCREMENT ENDPOINT ====================

@app.route('/api/notes/<int:note_id>/download', methods=['POST', 'OPTIONS'])
def increment_download_count(note_id):
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = jsonify({'success': True})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
        return response, 200
        
    try:
        print(f"\n📥 DOWNLOAD COUNT INCREMENT for note ID: {note_id}")
        
        note = db.session.get(Note, note_id)
        if not note:
            print(f"❌ Note {note_id} not found!")
            return jsonify({'success': False, 'error': 'Note not found'}), 404

        print(f"📊 Current downloads before increment: {note.downloads}")

        note.downloads += 1
        db.session.commit()

        print(f"✅ Downloads after increment: {note.downloads}")
        print(f"{'='*50}\n")

        return jsonify({
            'success': True,
            'message': 'Download count incremented',
            'downloads': note.downloads
        })

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error in download increment: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500



@app.route('/api/materials/<int:note_id>/download', methods=['POST', 'OPTIONS'])
def increment_download_count_alt(note_id):
    return increment_download_count(note_id)
    
    
@app.route('/api/debug/files', methods=['GET', 'OPTIONS'])
def debug_files():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        # Check if user is admin
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'Authentication required'}), 401
            
        token = auth_header[7:]
        try:
            from flask_jwt_extended import decode_token
            decoded = decode_token(token)
            user_id = decoded['sub']
        except:
            return jsonify({'success': False, 'error': 'Invalid token'}), 401
            
        user = db.session.get(User, int(user_id))
        if not user or user.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
            
        
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
                'upload_folder': app.config['UPLOAD_FOLDER']
            }
            
            
            if note.file_name:
               
                alt_path1 = os.path.join(app.config['UPLOAD_FOLDER'], note.file_name)
                file_info['alt_path1'] = alt_path1
                file_info['alt_path1_exists'] = os.path.exists(alt_path1)
                
                
                if note.course_ref:
                    course_folder = note.course_ref.name.replace(' ', '_')
                    alt_path2 = os.path.join(app.config['UPLOAD_FOLDER'], course_folder, note.file_name)
                    file_info['alt_path2'] = alt_path2
                    file_info['alt_path2_exists'] = os.path.exists(alt_path2)
            
            result.append(file_info)
        
        
        folder_structure = []
        for root, dirs, files in os.walk(app.config['UPLOAD_FOLDER']):
            for file in files:
                folder_structure.append({
                    'path': os.path.join(root, file),
                    'relative': os.path.relpath(os.path.join(root, file), app.config['UPLOAD_FOLDER'])
                })
        
        return jsonify({
            'success': True,
            'notes': result,
            'folder_structure': folder_structure,
            'upload_folder': app.config['UPLOAD_FOLDER']
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ==================== ROOT ROUTE ====================

@app.route('/')
def home():
    return jsonify({
        'message': 'Study Portal API',
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

# ==================== ADMIN PANEL ROUTES ====================

@app.route('/admin')
def serve_admin():
    """Serve admin panel HTML"""
    try:
       
        if os.path.exists('static/admin.html'):
            return send_from_directory('static', 'admin.html')
        elif os.path.exists('admin.html'):
            return send_file('admin.html')
        else:
            return jsonify({'error': 'Admin panel not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/admin/<path:filename>')
def serve_admin_static(filename):
    """Serve admin static files"""
    try:
        if os.path.exists(f'static/{filename}'):
            return send_from_directory('static', filename)
        elif os.path.exists(filename):
            return send_file(filename)
        else:
            return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
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