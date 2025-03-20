from flask import Blueprint, request, jsonify, current_app
from app.models.resource import Resource
from app import db
from flask_login import login_required, current_user
import os
from werkzeug.utils import secure_filename
import uuid

resources_bp = Blueprint('resources', __name__)

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@resources_bp.route('/resources', methods=['GET'])
def get_resources():
    skill_id = request.args.get('skill_id')
    query = Resource.query
    
    if skill_id:
        query = query.filter_by(skill_id=skill_id)
    
    resources = query.order_by(Resource.created_at.desc()).all()
    
    return jsonify([{
        'id': resource.id,
        'title': resource.title,
        'description': resource.description,
        'author': resource.user.username,
        'skill': resource.skill.name,
        'resource_type': resource.resource_type,
        'file_path': resource.file_path,
        'created_at': resource.created_at.isoformat()
    } for resource in resources])

@resources_bp.route('/resources', methods=['POST'])
@login_required
def create_resource():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Generate unique filename to prevent collisions
        unique_filename = f"{uuid.uuid4()}_{filename}"
        
        upload_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], 'resources')
        os.makedirs(upload_folder, exist_ok=True)
        
        file_path = os.path.join(upload_folder, unique_filename)
        file.save(file_path)
        
        resource = Resource(
            user_id=current_user.id,
            skill_id=request.form.get('skill_id'),
            title=request.form.get('title'),
            description=request.form.get('description', ''),
            file_path=file_path,
            resource_type=request.form.get('resource_type')
        )
        
        db.session.add(resource)
        db.session.commit()
        
        return jsonify({
            'id': resource.id,
            'title': resource.title,
            'description': resource.description,
            'file_path': resource.file_path,
            'resource_type': resource.resource_type
        }), 201
    
    return jsonify({'error': 'File type not allowed'}), 400 