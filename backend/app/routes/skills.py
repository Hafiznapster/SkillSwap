from flask import Blueprint, request, jsonify
from app.models.skill import Skill, UserSkill
from app.models.user import User
from app import db
from flask_login import login_required, current_user

skills_bp = Blueprint('skills', __name__)

@skills_bp.route('/skills', methods=['GET'])
def get_all_skills():
    skills = Skill.query.all()
    return jsonify([{
        'id': skill.id,
        'name': skill.name,
        'category': skill.category,
        'description': skill.description
    } for skill in skills])

@skills_bp.route('/skills', methods=['POST'])
@login_required
def create_skill():
    data = request.get_json()
    
    # Check if skill already exists
    existing = Skill.query.filter_by(name=data['name'], category=data['category']).first()
    if existing:
        return jsonify({'error': 'Skill already exists'}), 400
        
    skill = Skill(
        name=data['name'],
        category=data['category'],
        description=data.get('description', '')
    )
    
    db.session.add(skill)
    db.session.commit()
    
    return jsonify({
        'id': skill.id,
        'name': skill.name,
        'category': skill.category,
        'description': skill.description
    }), 201

@skills_bp.route('/user/skills/teaching', methods=['POST'])
@login_required
def add_teaching_skill():
    data = request.get_json()
    
    # Check if skill exists
    skill = Skill.query.get(data['skill_id'])
    if not skill:
        return jsonify({'error': 'Skill not found'}), 404
        
    user_skill = UserSkill(
        teacher_id=current_user.id,
        skill_id=data['skill_id'],
        proficiency_level=data['proficiency_level']
    )
    
    db.session.add(user_skill)
    db.session.commit()
    
    return jsonify({'message': 'Teaching skill added successfully'}), 201

@skills_bp.route('/user/skills/learning', methods=['POST'])
@login_required
def add_learning_skill():
    data = request.get_json()
    
    # Check if skill exists
    skill = Skill.query.get(data['skill_id'])
    if not skill:
        return jsonify({'error': 'Skill not found'}), 404
        
    user_skill = UserSkill(
        learner_id=current_user.id,
        skill_id=data['skill_id'],
        proficiency_level=data['proficiency_level']
    )
    
    db.session.add(user_skill)
    db.session.commit()
    
    return jsonify({'message': 'Learning skill added successfully'}), 201

@skills_bp.route('/match', methods=['GET'])
@login_required
def get_matches():
    # Find users who want to learn skills that the current user wants to teach
    teaching_skills = [us.skill_id for us in current_user.skills_teaching]
    potential_learners = UserSkill.query.filter(
        UserSkill.learner_id != None,
        UserSkill.skill_id.in_(teaching_skills)
    ).all()
    
    # Find users who want to teach skills that the current user wants to learn
    learning_skills = [us.skill_id for us in current_user.skills_learning]
    potential_teachers = UserSkill.query.filter(
        UserSkill.teacher_id != None,
        UserSkill.skill_id.in_(learning_skills)
    ).all()
    
    # Combine and format the results
    matches = []
    
    for user_skill in potential_learners:
        user = User.query.get(user_skill.learner_id)
        skill = Skill.query.get(user_skill.skill_id)
        
        matches.append({
            'user_id': user.id,
            'username': user.username,
            'skill_id': skill.id,
            'skill_name': skill.name,
            'match_type': 'you_teach'
        })
    
    for user_skill in potential_teachers:
        user = User.query.get(user_skill.teacher_id)
        skill = Skill.query.get(user_skill.skill_id)
        
        matches.append({
            'user_id': user.id,
            'username': user.username,
            'skill_id': skill.id,
            'skill_name': skill.name,
            'match_type': 'you_learn'
        })
    
    return jsonify(matches) 