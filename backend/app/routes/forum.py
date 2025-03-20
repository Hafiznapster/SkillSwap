from flask import Blueprint, request, jsonify
from app.models.forum import ForumCategory, ForumTopic, ForumPost
from app import db
from flask_login import login_required, current_user

forum_bp = Blueprint('forum', __name__)

@forum_bp.route('/forum/categories', methods=['GET'])
def get_categories():
    categories = ForumCategory.query.all()
    return jsonify([{
        'id': category.id,
        'name': category.name,
        'description': category.description,
        'topic_count': len(category.topics)
    } for category in categories])

@forum_bp.route('/forum/categories/<int:category_id>/topics', methods=['GET'])
def get_topics(category_id):
    topics = ForumTopic.query.filter_by(category_id=category_id).order_by(ForumTopic.created_at.desc()).all()
    return jsonify([{
        'id': topic.id,
        'title': topic.title,
        'content': topic.content,
        'author': topic.user.username,
        'created_at': topic.created_at.isoformat(),
        'post_count': len(topic.posts)
    } for topic in topics])

@forum_bp.route('/forum/topics', methods=['POST'])
@login_required
def create_topic():
    data = request.get_json()
    
    topic = ForumTopic(
        category_id=data['category_id'],
        user_id=current_user.id,
        title=data['title'],
        content=data['content']
    )
    
    db.session.add(topic)
    db.session.commit()
    
    return jsonify({
        'id': topic.id,
        'title': topic.title,
        'content': topic.content,
        'author': current_user.username,
        'created_at': topic.created_at.isoformat()
    }), 201

@forum_bp.route('/forum/topics/<int:topic_id>/posts', methods=['GET'])
def get_posts(topic_id):
    posts = ForumPost.query.filter_by(topic_id=topic_id).order_by(ForumPost.created_at).all()
    return jsonify([{
        'id': post.id,
        'content': post.content,
        'author': post.user.username,
        'created_at': post.created_at.isoformat()
    } for post in posts])

@forum_bp.route('/forum/posts', methods=['POST'])
@login_required
def create_post():
    data = request.get_json()
    
    post = ForumPost(
        topic_id=data['topic_id'],
        user_id=current_user.id,
        content=data['content']
    )
    
    db.session.add(post)
    db.session.commit()
    
    return jsonify({
        'id': post.id,
        'content': post.content,
        'author': current_user.username,
        'created_at': post.created_at.isoformat()
    }), 201 