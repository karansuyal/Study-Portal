"""
All database models, moved out of app.py.

Fix applied here: added index=True on columns that get filtered or joined on
constantly (course_id, subject_id, user_id, status, semester, branch, etc).
Without these, every "notes by semester/branch/course" query does a full
table scan. As your data grows past a few thousand rows this is the
difference between a query taking milliseconds vs seconds.

Note: adding index=True here only affects NEW tables created by db.create_all().
Since your DB already exists on Render, you need to actually create these
indexes on the live database too — see migrations/001_add_indexes.sql.
"""

import secrets
import random
from datetime import datetime, timezone, timedelta

from extensions import db


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)  # unique=True already creates an index
    password = db.Column(db.String(200), nullable=False)
    branch = db.Column(db.String(50), index=True)
    semester = db.Column(db.Integer, index=True)
    role = db.Column(db.String(20), default='student', index=True)

    is_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(100))
    verification_token_expiry = db.Column(db.DateTime)
    otp_code = db.Column(db.String(6))
    otp_expiry = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    notes = db.relationship('Note', backref='uploader', lazy=True)

    def set_password(self, password):
        from werkzeug.security import generate_password_hash
        self.password = generate_password_hash(password)

    def check_password(self, password):
        from werkzeug.security import check_password_hash
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
    branch = db.Column(db.String(50), nullable=False, index=True)
    semester = db.Column(db.Integer, nullable=False, index=True)
    code = db.Column(db.String(20), unique=True)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

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
    note_id = db.Column(db.Integer, db.ForeignKey('notes.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    rating = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (db.UniqueConstraint('note_id', 'user_id', name='unique_user_note_rating'),)


class Subject(db.Model):
    __tablename__ = 'subjects'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    code = db.Column(db.String(20))
    semester = db.Column(db.Integer, nullable=False, index=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False, index=True)

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
    note_type = db.Column(db.String(20), default='notes', index=True)
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

    status = db.Column(db.String(20), default='pending', index=True)
    rejection_reason = db.Column(db.Text)
    downloads = db.Column(db.Integer, default=0)
    views = db.Column(db.Integer, default=0)

    uploaded_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    approved_at = db.Column(db.DateTime)

    # These are the columns filtered on in /api/notes, /api/materials, chatbot
    # search, and the admin panel — so they all get an index.
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False, index=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'), index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

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
