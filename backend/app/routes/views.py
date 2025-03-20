from flask import Blueprint, render_template, redirect, url_for, session

views_bp = Blueprint('views', __name__)

@views_bp.route('/')
def home():
    return render_template('home.html')

@views_bp.route('/login')
def login():
    return render_template('auth/login.html')

@views_bp.route('/register')
def register():
    return render_template('auth/register.html')

@views_bp.route('/profile')
def profile():
    # Check if user is logged in through JavaScript
    return render_template('user/profile.html')

@views_bp.route('/user/<int:user_id>')
def user_profile(user_id):
    return render_template('user/profile.html', user_id=user_id)

@views_bp.route('/skills')
def skills():
    return render_template('skills/index.html')

@views_bp.route('/matches')
def matches():
    return render_template('matches/index.html')

@views_bp.route('/sessions')
def sessions():
    return render_template('sessions/index.html')

@views_bp.route('/forum')
def forum():
    return render_template('forum/index.html')

@views_bp.route('/forum/topic/<int:topic_id>')
def forum_topic(topic_id):
    return render_template('forum/topic.html', topic_id=topic_id)

@views_bp.route('/resources')
def resources():
    return render_template('resources/index.html')

@views_bp.route('/timebank')
def timebank():
    return render_template('timebank/index.html')

@views_bp.route('/about')
def about():
    return render_template('about.html')

@views_bp.route('/contact')
def contact():
    return render_template('contact.html')

@views_bp.route('/privacy')
def privacy():
    return render_template('privacy.html') 