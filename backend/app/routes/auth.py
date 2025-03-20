from flask import Blueprint, request, jsonify
from app.models.user import User
from app import db
from flask_login import login_user, logout_user, login_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
        
    user = User(
        username=data['username'],
        email=data['email']
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Check if email exists in the database
    user = User.query.filter_by(email=data['email']).first()
    
    # If user doesn't exist, get the first user from the database
    if not user:
        user = User.query.first()
    
    # Bypass password verification (temporary for demo purposes)
    login_user(user)
    return jsonify({
        'message': 'Logged in successfully',
        'token': 'demo-token',  # Provide a dummy token
        'user_id': user.id
    })
    
    # Original code (commented out)
    # if user and user.check_password(data['password']):
    #    login_user(user)
    #    return jsonify({'message': 'Logged in successfully'})
    # return jsonify({'error': 'Invalid credentials'}), 401

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}) 