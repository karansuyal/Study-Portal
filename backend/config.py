import os
from datetime import timedelta

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    # Security
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'notes-hub-super-secret-key-2024-change-this'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-super-secret-key-change-in-production'
    
    # JWT Settings
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        f'sqlite:///{os.path.join(basedir, "instance", "noteshub.db")}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # File Upload
    UPLOAD_FOLDER = os.path.join(basedir, 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    
    # Allowed file extensions
    ALLOWED_EXTENSIONS = {
        'pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 
        'jpg', 'jpeg', 'png', 'zip', 'rar'
    }
    
    # Admin email
    ADMIN_EMAIL = 'admin@noteshub.com'
    ADMIN_PASSWORD = 'admin123'
    
    # CORS
    CORS_HEADERS = 'Content-Type'
    
    @staticmethod
    def init_app(app):
        # Create necessary directories
        os.makedirs(os.path.join(basedir, 'instance'), exist_ok=True)
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)