from app import db
from datetime import datetime

class Rating(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('session.id'))
    rater_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    ratee_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    rating = db.Column(db.Integer)  # 1-5 star rating
    feedback = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    rater = db.relationship('User', foreign_keys=[rater_id])
    ratee = db.relationship('User', foreign_keys=[ratee_id]) 