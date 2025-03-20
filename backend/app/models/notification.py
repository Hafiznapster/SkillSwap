from app import db
from datetime import datetime

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    message = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(20))  # match, request, session, etc.
    read = db.Column(db.Boolean, default=False)
    related_id = db.Column(db.Integer)  # ID of related entity (session, user, etc.)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User') 