"""
Study Portal backend — entrypoint.
"""

import os
from datetime import datetime, timezone

from flask import Flask, jsonify, send_file, send_from_directory
from flask_cors import CORS
from sqlalchemy import text
from dotenv import load_dotenv

from cloudinary_config import configure_cloudinary
import resend

from extensions import db, jwt, mail, oauth, limiter
from models import User, Course, Subject, Note

load_dotenv()

configure_cloudinary()
resend.api_key = os.environ.get('RESEND_API_KEY')

# ==================== APP + CONFIG ====================
app = Flask(__name__)

basedir = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(basedir, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# SECURITY FIX: no more hardcoded fallback secrets. If SECRET_KEY or
# JWT_SECRET_KEY aren't set in the environment, the app now refuses to start
# instead of silently falling back to a well-known default value that
# anyone reading this (public) repo could use to forge JWTs.
SECRET_KEY = os.environ.get('SECRET_KEY')
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
if not SECRET_KEY or not JWT_SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY and JWT_SECRET_KEY must be set as environment variables. "
        "Set them in your Render dashboard (or .env locally) — do not hardcode them."
    )

app.config['SECRET_KEY'] = SECRET_KEY
app.config['JWT_SECRET_KEY'] = JWT_SECRET_KEY
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400
app.config['JWT_ALGORITHM'] = 'HS256'
app.config['JWT_DECODE_ALGORITHMS'] = ['HS256']

app.config['MAIL_SERVER'] = 'smtp-relay.brevo.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER', 'studyportal02@gmail.com')

database_url = os.environ.get('DATABASE_URL')
if database_url and database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql://', 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url or 'postgresql://postgres:postgres@localhost:5432/noteshub'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png'}

# ==================== EXTENSIONS ====================
db.init_app(app)
jwt.init_app(app)
mail.init_app(app)
oauth.init_app(app)
limiter.init_app(app)

# SECURITY FIX: origins=["*"] + supports_credentials=True is an invalid/unsafe
# combination (browsers reject wildcard origins when credentials are allowed).
# Locked down to your actual frontend domains instead. Add any other domains
# (e.g. a staging URL) to this list as needed.
ALLOWED_ORIGINS = [
    "https://study-portal-app.vercel.app",
    "http://localhost:3000",
]
CORS(app, origins=ALLOWED_ORIGINS, supports_credentials=True,
     allow_headers=["Content-Type", "Authorization", "Accept"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
oauth.register(
    name='google',
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile', 'prompt': 'select_account'}
)

print("\n" + "=" * 70)
print(" 🚀 STUDY PORTAL BACKEND")
print(f" 📁 Database: {'connected' if database_url else 'using local fallback'}")
print(f" 📁 Upload folder: {UPLOAD_FOLDER}")
print("=" * 70 + "\n")

# ==================== BLUEPRINTS ====================
from routes.auth import auth_bp
from routes.courses import courses_bp
from routes.notes import notes_bp
from routes.admin import admin_bp
from routes.chatbot import chatbot_bp

app.register_blueprint(auth_bp)
app.register_blueprint(courses_bp)
app.register_blueprint(notes_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(chatbot_bp)


# ==================== DATABASE INIT ====================
def init_database():
    """Initialize database with sample data (admin user, test student, sample courses)."""
    with app.app_context():
        db.create_all()
        print(" Database tables created/verified")

        admin = db.session.execute(db.select(User).filter_by(email='admin@noteshub.com')).scalar_one_or_none()
        if not admin:
            admin = User(name='Admin', email='admin@noteshub.com', branch='Admin', semester=0, role='admin')
            admin.set_password('admin123')
            db.session.add(admin)
            print(" Admin user created")

        student = db.session.execute(db.select(User).filter_by(email='student@test.com')).scalar_one_or_none()
        if not student:
            student = User(name='Test Student', email='student@test.com', branch='CSE', semester=3, role='student')
            student.set_password('student123')
            db.session.add(student)
            print(" Test student created")

        if db.session.execute(db.select(Course)).first() is None:
            courses = [
                {'name': 'BTECH', 'branch': 'CSE', 'semester': 0, 'code': 'BTECH'},
                {'name': 'BCA', 'branch': 'Computer Applications', 'semester': 0, 'code': 'BCA'},
                {'name': 'BBA', 'branch': 'Business Administration', 'semester': 0, 'code': 'BBA'},
                {'name': 'MBA', 'branch': 'Management', 'semester': 0, 'code': 'MBA'},
                {'name': 'MCA', 'branch': 'Computer Applications', 'semester': 0, 'code': 'MCA'}
            ]
            for c in courses:
                db.session.add(Course(**c))
            print(" Sample courses created")

        db.session.commit()


# ==================== HEALTH / MISC ====================
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
        return jsonify({'success': False, 'message': 'Database error', 'error': str(e),
                         'timestamp': datetime.now(timezone.utc).isoformat()}), 500


@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({'success': True, 'message': 'API is working', 'timestamp': datetime.now(timezone.utc).isoformat()})


@app.route('/api/init-db', methods=['GET'])
def init_db_route():
    try:
        init_database()
        return jsonify({'success': True, 'message': 'Database initialized!'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/')
def home():
    return jsonify({
        'message': 'Study Portal API',
        'version': '2.0',
        'database': 'PostgreSQL',
        'status': 'running',
        'timestamp': datetime.now(timezone.utc).isoformat()
    })


@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404


@jwt.unauthorized_loader
def unauthorized_response(callback):
    return jsonify({'success': False, 'error': 'Authentication required'}), 401


# ==================== ADMIN PANEL STATIC FILES ====================
@app.route('/admin')
def serve_admin():
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
    try:
        if os.path.exists(f'static/{filename}'):
            return send_from_directory('static', filename)
        elif os.path.exists(filename):
            return send_file(filename)
        else:
            return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==================== START (local dev only) ====================
if __name__ == '__main__':
    init_database()

    print("\n" + "=" * 70)
    print(" 📋 AVAILABLE ROUTES:")
    for rule in app.url_map.iter_rules():
        print(f"    {rule}")
    print("=" * 70 + "\n")

    app.run(debug=True, host='0.0.0.0', port=5000)
else:
    # When gunicorn imports this module (production), also make sure the
    # database is initialized on first boot.
    init_database()