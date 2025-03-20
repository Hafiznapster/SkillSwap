from flask import Blueprint, request, jsonify

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    # Get data from request
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    # Validate input
    if not username or not email or not password:
        return jsonify({'error': 'Missing required fields'}), 400
    
    # For now, just print and return success
    print(f"Blueprint register attempt: {username}, {email}")
    
    return jsonify({'message': 'User registered successfully via blueprint'}), 201 