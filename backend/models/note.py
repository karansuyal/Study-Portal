from datetime import datetime
from database.connection import db

class Note(db.Model):
    __tablename__ = 'notes'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    file_path = db.Column(db.String(500))
    file_name = db.Column(db.String(200))
    file_type = db.Column(db.String(50))
    note_type = db.Column(db.String(20), default='notes')
    downloads = db.Column(db.Integer, default=0)
    rating = db.Column(db.Float, default=0.0)
    is_approved = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign keys - Comment out for now
    # course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    # user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships - Comment out for now
    # reviews = db.relationship('Review', backref='note', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'file_name': self.file_name,
            'file_type': self.file_type,
            'note_type': self.note_type,
            'downloads': self.downloads,
            'rating': self.rating,
            'is_approved': self.is_approved,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<Note {self.title}>'