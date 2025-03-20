from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS
from backend.config import Config
import os

db = SQLAlchemy()
login_manager = LoginManager()

def create_app():
    app = Flask(__name__, 
                template_folder=os.path.abspath('F:/College projects/Neethu/code 2/templates'),
                static_folder=os.path.abspath('F:/College projects/Neethu/code 2/static'))
    
    app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    CORS(app)
    
    # Register API blueprints
    from app.routes.auth import auth_bp
    from app.routes.skills import skills_bp
    from app.routes.sessions import sessions_bp
    from app.routes.forum import forum_bp
    from app.routes.resources import resources_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(skills_bp, url_prefix='/api')
    app.register_blueprint(sessions_bp, url_prefix='/api')
    app.register_blueprint(forum_bp, url_prefix='/api')
    app.register_blueprint(resources_bp, url_prefix='/api')
    
    # Register view blueprint for HTML templates
    from app.routes.views import views_bp
    app.register_blueprint(views_bp)
    
    # Load the user
    from app.models.user import User
    
    @login_manager.user_loader
    def load_user(id):
        return User.query.get(int(id))
    
    # Debug output for troubleshooting
    template_dir = os.path.abspath('F:/College projects/Neethu/code 2/templates')
    print(f"Template directory: {template_dir}")
    print(f"Directory exists: {os.path.exists(template_dir)}")
    if os.path.exists(template_dir):
        print(f"Directory contents: {os.listdir(template_dir)}")
    
    return app 