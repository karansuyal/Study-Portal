from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import uuid

db = SQLAlchemy()

# ==================== MODELS ====================

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False, index=True)
    password = db.Column(db.String(200), nullable=False)
    branch = db.Column(db.String(50))
    semester = db.Column(db.Integer)
    role = db.Column(db.String(20), default='student')  # student, admin, faculty
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    uploaded_notes = db.relationship('Note', backref='uploader', lazy=True, 
                                     cascade='all, delete-orphan')
    ratings = db.relationship('Rating', backref='rater', lazy=True, 
                              cascade='all, delete-orphan')
    downloads = db.relationship('Download', backref='downloader', lazy=True, 
                                cascade='all, delete-orphan')
    
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
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'note_count': len(self.uploaded_notes),
            'download_count': len(self.downloads)
        }

class Course(db.Model):
    __tablename__ = 'courses'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False, index=True)
    branch = db.Column(db.String(50), nullable=False, index=True)
    semester = db.Column(db.Integer, nullable=False, index=True)
    code = db.Column(db.String(20), unique=True, index=True)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    notes = db.relationship('Note', backref='course', lazy=True, 
                            cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'branch': self.branch,
            'semester': self.semester,
            'code': self.code,
            'description': self.description,
            'note_count': len(self.notes),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Note(db.Model):
    __tablename__ = 'notes'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False, index=True)
    description = db.Column(db.Text)
    file_name = db.Column(db.String(200))
    original_filename = db.Column(db.String(200))
    file_path = db.Column(db.String(500))
    file_type = db.Column(db.String(20))
    file_size = db.Column(db.Integer)  # in bytes
    note_type = db.Column(db.String(20), default='notes')  # notes, question_paper, lab_file, etc.
    
    # Status
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    rejection_reason = db.Column(db.Text)
    views = db.Column(db.Integer, default=0)
    downloads = db.Column(db.Integer, default=0)
    
    # Timestamps
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    approved_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    approved_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Relationships
    ratings = db.relationship('Rating', backref='note', lazy=True, 
                              cascade='all, delete-orphan')
    download_records = db.relationship('Download', backref='note', lazy=True, 
                                       cascade='all, delete-orphan')
    
    # For search
    search_vector = db.Column(db.Text)
    
    def get_average_rating(self):
        ratings = [r.rating for r in self.ratings]
        if not ratings:
            return 0
        return round(sum(ratings) / len(ratings), 1)
    
    def to_dict(self):
        from . import db  # Import here to avoid circular
        from sqlalchemy import func
        
        # Get average rating using SQLAlchemy
        avg_rating = db.session.query(func.avg(Rating.rating)).filter(
            Rating.note_id == self.id
        ).scalar() or 0
        
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
            'views': self.views,
            'downloads': self.downloads,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'course_id': self.course_id,
            'user_id': self.user_id,
            'approved_by': self.approved_by,
            'average_rating': round(float(avg_rating), 1),
            'rating_count': len(self.ratings)
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
    rating = db.Column(db.Integer, nullable=False)  # 1-5
    review = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign Keys
    note_id = db.Column(db.Integer, db.ForeignKey('notes.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    # Unique constraint
    __table_args__ = (db.UniqueConstraint('note_id', 'user_id', name='unique_user_note_rating'),)

class Download(db.Model):
    __tablename__ = 'downloads'
    
    id = db.Column(db.Integer, primary_key=True)
    downloaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    ip_address = db.Column(db.String(50))
    user_agent = db.Column(db.Text)
    
    # Foreign Keys
    note_id = db.Column(db.Integer, db.ForeignKey('notes.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)  # Null for anonymous
    
    def to_dict(self):
        return {
            'id': self.id,
            'downloaded_at': self.downloaded_at.isoformat() if self.downloaded_at else None,
            'note_id': self.note_id,
            'user_id': self.user_id,
            'ip_address': self.ip_address
        }

# ==================== HELPER FUNCTIONS ====================

def init_db(app):
    """Initialize database"""
    db.init_app(app)
    
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Create admin user if not exists
        from config import Config
        admin = User.query.filter_by(email=Config.ADMIN_EMAIL).first()
        if not admin:
            admin = User(
                name='Admin',
                email=Config.ADMIN_EMAIL,
                branch='Admin',
                semester=0,
                role='admin'
            )
            admin.set_password(Config.ADMIN_PASSWORD)
            db.session.add(admin)
            db.session.commit()
            print("✅ Admin user created")
        
        # Add sample courses if empty
        if Course.query.count() == 0:
            add_sample_courses()
        
        print(f"✅ Database initialized with {User.query.count()} users, {Course.query.count()} courses")

def add_sample_courses():
    """Add sample courses to database"""
    sample_courses = [
        # B.Tech Courses
        {'name': 'Data Structures', 'branch': 'CSE', 'semester': 3, 'code': 'CSE301'},
        {'name': 'Database Management', 'branch': 'CSE', 'semester': 4, 'code': 'CSE401'},
        {'name': 'Computer Networks', 'branch': 'CSE', 'semester': 5, 'code': 'CSE501'},
        {'name': 'Operating Systems', 'branch': 'CSE', 'semester': 4, 'code': 'CSE402'},
        {'name': 'Digital Electronics', 'branch': 'ECE', 'semester': 2, 'code': 'ECE202'},
        {'name': 'Circuit Theory', 'branch': 'ECE', 'semester': 3, 'code': 'ECE301'},
        {'name': 'Thermodynamics', 'branch': 'ME', 'semester': 3, 'code': 'ME301'},
        {'name': 'Fluid Mechanics', 'branch': 'ME', 'semester': 4, 'code': 'ME401'},
        {'name': 'Engineering Drawing', 'branch': 'CE', 'semester': 1, 'code': 'CE101'},
        
        # Common Courses
        {'name': 'Engineering Mathematics-I', 'branch': 'All', 'semester': 1, 'code': 'MAT101'},
        {'name': 'Engineering Physics', 'branch': 'All', 'semester': 1, 'code': 'PHY101'},
        {'name': 'Engineering Chemistry', 'branch': 'All', 'semester': 1, 'code': 'CHE101'},
        {'name': 'Professional Communication', 'branch': 'All', 'semester': 2, 'code': 'COM201'},
        
        # BCA Courses
        {'name': 'Programming in C', 'branch': 'BCA', 'semester': 1, 'code': 'BCA101'},
        {'name': 'Web Technologies', 'branch': 'BCA', 'semester': 3, 'code': 'BCA301'},
        {'name': 'Software Engineering', 'branch': 'BCA', 'semester': 4, 'code': 'BCA401'},
        
        # BBA Courses
        {'name': 'Principles of Management', 'branch': 'BBA', 'semester': 1, 'code': 'BBA101'},
        {'name': 'Business Economics', 'branch': 'BBA', 'semester': 2, 'code': 'BBA201'},
        {'name': 'Financial Accounting', 'branch': 'BBA', 'semester': 3, 'code': 'BBA301'},
    ]
    
    for course_data in sample_courses:
        if not Course.query.filter_by(code=course_data['code']).first():
            course = Course(**course_data)
            db.session.add(course)
    
    db.session.commit()
    print(f"✅ Added {len(sample_courses)} sample courses")