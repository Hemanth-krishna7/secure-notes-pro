import re
from flask import Blueprint, request
from flask_login import login_user, logout_user, current_user
from app import db
from app.models.user import User
from app.utils.helpers import success_response, error_response

auth_bp = Blueprint('auth', __name__)

# Standard email format regex pattern
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Registers a new user profile.
    Performs field validations, hashes password, saves to database,
    and returns a success response without logging the user in.
    """
    data = request.get_json() or {}
    
    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    
    # 1. Validation Checks
    if not full_name:
        return error_response("Full name is required.", 400)
        
    if not email:
        return error_response("Email is required.", 400)
        
    if not EMAIL_REGEX.match(email):
        return error_response("Invalid email format.", 400)
        
    if not password:
        return error_response("Password is required.", 400)
        
    if len(password) < 8:
        return error_response("Password must be at least 8 characters long.", 400)
        
    # 2. Email Uniqueness Check
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return error_response("Email address is already registered.", 409)
        
    try:
        # 3. Create and save User
        user = User(full_name=full_name, email=email)
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        return success_response(
            data=user.to_dict(),
            message="Registration successful! Please sign in.",
            status_code=201
        )
    except Exception as e:
        db.session.rollback()
        return error_response("An unexpected database error occurred.", 500)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticates the user and initiates a session context."""
    data = request.get_json() or {}
    
    email = data.get('email', '').strip()
    password = data.get('password', '')
    
    if not email or not password:
        return error_response("Email and password are required.", 400)
        
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return error_response("Invalid email or password.", 401)
        
    # Start session
    login_user(user, remember=True)
    
    return success_response(
        data=user.to_dict(),
        message="Login successful."
    )

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Closes the authenticated session."""
    if not current_user.is_authenticated:
        return error_response("No active session to terminate.", 401)
        
    logout_user()
    return success_response(message="Logged out successfully.")

@auth_bp.route('/me', methods=['GET'])
def get_profile():
    """Returns the profile statistics of the currently active session user."""
    if not current_user.is_authenticated:
        return error_response("Session expired or inactive.", 401)
        
    return success_response(
        data=current_user.to_dict(),
        message="Profile retrieved successfully."
    )
