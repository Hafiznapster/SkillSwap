from flask import Blueprint, request, jsonify
from app.models.session import Session
from app.models.rating import Rating
from app.models.timebank import TimeBank
from app.models.notification import Notification
from app import db
from flask_login import login_required, current_user
from datetime import datetime

sessions_bp = Blueprint('sessions', __name__)

@sessions_bp.route('/sessions/request', methods=['POST'])
@login_required
def request_session():
    data = request.get_json()
    
    # Create the session
    session = Session(
        teacher_id=data['teacher_id'],
        learner_id=current_user.id,
        skill_id=data['skill_id'],
        start_time=datetime.fromisoformat(data['start_time']),
        end_time=datetime.fromisoformat(data['end_time']),
        location=data.get('location', ''),
        notes=data.get('notes', '')
    )
    
    db.session.add(session)
    
    # Create notification for the teacher
    notification = Notification(
        user_id=data['teacher_id'],
        message=f"{current_user.username} has requested a session for skill teaching",
        notification_type='request',
        related_id=session.id
    )
    
    db.session.add(notification)
    db.session.commit()
    
    return jsonify({'message': 'Session requested successfully', 'session_id': session.id}), 201

@sessions_bp.route('/sessions/<int:session_id>/status', methods=['PUT'])
@login_required
def update_session_status(session_id):
    data = request.get_json()
    session = Session.query.get_or_404(session_id)
    
    # Check authorization
    if current_user.id != session.teacher_id and current_user.id != session.learner_id:
        return jsonify({'error': 'Unauthorized'}), 403
        
    old_status = session.status
    session.status = data['status']
    
    db.session.commit()
    
    # Create notifications
    if old_status != data['status']:
        if data['status'] == 'confirmed':
            recipient_id = session.learner_id
            message = f"Your session has been confirmed by the teacher"
        elif data['status'] == 'completed':
            recipient_id = session.teacher_id if current_user.id == session.learner_id else session.learner_id
            message = f"Session has been marked as completed"
            
            # Add time credits if the session is completed
            duration_hours = (session.end_time - session.start_time).total_seconds() / 3600
            
            # Credit for teacher
            teacher_timebank = TimeBank(
                user_id=session.teacher_id,
                session_id=session.id,
                hours=duration_hours,
                description=f"Teaching session completed"
            )
            
            # Debit for learner
            learner_timebank = TimeBank(
                user_id=session.learner_id,
                session_id=session.id,
                hours=-duration_hours,
                description=f"Learning session completed"
            )
            
            db.session.add(teacher_timebank)
            db.session.add(learner_timebank)
            
        else:
            recipient_id = session.teacher_id if current_user.id == session.learner_id else session.learner_id
            message = f"Session status changed to {data['status']}"
            
        notification = Notification(
            user_id=recipient_id,
            message=message,
            notification_type='session',
            related_id=session.id
        )
        
        db.session.add(notification)
        db.session.commit()
    
    return jsonify({'message': 'Session status updated successfully'})

@sessions_bp.route('/sessions/<int:session_id>/rate', methods=['POST'])
@login_required
def rate_session(session_id):
    data = request.get_json()
    session = Session.query.get_or_404(session_id)
    
    # Check authorization
    if current_user.id != session.teacher_id and current_user.id != session.learner_id:
        return jsonify({'error': 'Unauthorized'}), 403
        
    # Determine ratee
    ratee_id = session.teacher_id if current_user.id == session.learner_id else session.learner_id
    
    rating = Rating(
        session_id=session.id,
        rater_id=current_user.id,
        ratee_id=ratee_id,
        rating=data['rating'],
        feedback=data.get('feedback', '')
    )
    
    db.session.add(rating)
    
    # Create notification
    notification = Notification(
        user_id=ratee_id,
        message=f"You have received a rating from {current_user.username}",
        notification_type='rating',
        related_id=rating.id
    )
    
    db.session.add(notification)
    db.session.commit()
    
    return jsonify({'message': 'Rating submitted successfully'})

@sessions_bp.route('/sessions/upcoming', methods=['GET'])
@login_required
def get_upcoming_sessions():
    upcoming_sessions = Session.query.filter(
        ((Session.teacher_id == current_user.id) | (Session.learner_id == current_user.id)),
        Session.status.in_(['pending', 'confirmed']),
        Session.start_time > datetime.utcnow()
    ).order_by(Session.start_time).all()
    
    return jsonify([{
        'id': session.id,
        'teacher': session.teacher.username,
        'learner': session.learner.username,
        'skill': session.skill.name,
        'start_time': session.start_time.isoformat(),
        'end_time': session.end_time.isoformat(),
        'location': session.location,
        'status': session.status
    } for session in upcoming_sessions]) 