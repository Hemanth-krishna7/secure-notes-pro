from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_login import LoginManager

from config import config_by_name

# Initialize extensions globally
db = SQLAlchemy()
migrate = Migrate()
cors = CORS()
login_manager = LoginManager()

def create_app(config_name='development'):
    """Flask Application Factory."""
    app = Flask(__name__)
    
    # Load configuration
    config_obj = config_by_name.get(config_name, config_by_name['default'])
    app.config.from_object(config_obj)
    
    # Initialize extensions with application context
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Configure Flask-Login
    login_manager.init_app(app)
    
    # Define user loader callback
    @login_manager.user_loader
    def load_user(user_id):
        from app.models.user import User
        return User.query.get(int(user_id))
        
    # Custom unauthorized JSON handler for API compatibility
    @login_manager.unauthorized_handler
    def unauthorized():
        return jsonify({
            "status": "error",
            "message": "Unauthorized access. Please login."
        }), 401
    
    # Configure CORS - allow frontend credentials for session-based auth
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}},
        supports_credentials=True
    )
    
    # Import and register blueprints
    from app.routes.main_routes import main_bp
    from app.routes.auth_routes import auth_bp
    from app.routes.notes_routes import notes_bp
    
    app.register_blueprint(main_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(notes_bp, url_prefix='/api/notes')
    
    # Register global error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({
            "status": "error",
            "message": "Resource not found"
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "Internal server error"
        }), 500
        
    return app
