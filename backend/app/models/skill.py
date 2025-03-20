from app import db

class Skill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False)
    category = db.Column(db.String(64), nullable=False)
    description = db.Column(db.Text)
    
    # Relationships
    user_skills = db.relationship('UserSkill', backref='skill')

class UserSkill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    learner_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    skill_id = db.Column(db.Integer, db.ForeignKey('skill.id'))
    proficiency_level = db.Column(db.String(20))  # beginner, intermediate, advanced
    verified = db.Column(db.Boolean, default=False) 