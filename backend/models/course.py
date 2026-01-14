from datetime import datetime
from database.connection import db

class Course(db.Model):
    __tablename__ = 'courses'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(200), nullable=False)
    branch = db.Column(db.String(50), nullable=False)
    semester = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text)
    credits = db.Column(db.Integer, default=3)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships - Comment out for now
    # notes = db.relationship('Note', backref='course', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'branch': self.branch,
            'semester': self.semester,
            'description': self.description,
            'credits': self.credits
        }
    
    def __repr__(self):
        return f'<Course {self.code} - {self.name}>'