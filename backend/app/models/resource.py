from app import db
from datetime import datetime

class Resource(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    skill_id = db.Column(db.Integer, db.ForeignKey('skill.id'))
    title = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text)
    file_path = db.Column(db.String(255))
    resource_type = db.Column(db.String(20))  # document, video, link, etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User')
    skill = db.relationship('Skill') 