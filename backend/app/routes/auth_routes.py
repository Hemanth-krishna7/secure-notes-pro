import re
from flask import Blueprint, request
from flask_login import (
    login_user,
    logout_user,
    current_user,
    login_required
)

from app import db
from app.models.user import User
from app.utils.helpers import success_response, error_response

auth_bp = Blueprint('auth', __name__)

# Standard email format regex pattern
EMAIL_REGEX = re.compile(
    r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
)


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Registers a new user profile.
    Performs field validations, hashes password,
    saves to database, and logs the user in.
    """

    data = request.get_json() or {}

    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')

    # Validation Checks
    if not full_name:
        return error_response("Full name is required.", 400)

    if not email:
        return error_response("Email is required.", 400)

    if not EMAIL_REGEX.match(email):
        return error_response("Invalid email format.", 400)

    if not password:
        return error_response("Password is required.", 400)

    if len(password) < 8:
        return error_response(
            "Password must be at least 8 characters long.",
            400
        )

    # Email Uniqueness Check
    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return error_response(
            "Email address is already registered.",
            409
        )

    try:
        # Create User
        user = User(
            full_name=full_name,
            email=email
        )

        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        # Seed Default Categories
        from app.models.category import Category

        default_categories = [
            'Uncategorized',
            'Personal',
            'Study',
            'Work'
        ]

        for cat_name in default_categories:
            category = Category(
                name=cat_name,
                user_id=user.id
            )
            db.session.add(category)

        db.session.commit()

        # Automatically login after registration
        login_user(user, remember=True)

        return success_response(
            data=user.to_dict(),
            message="Registration successful! Logging you in...",
            status_code=201
        )

    except Exception:
        db.session.rollback()

        return error_response(
            "An unexpected database error occurred.",
            500
        )


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticates user and creates session.
    """

    data = request.get_json() or {}

    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not email or not password:
        return error_response(
            "Email and password are required.",
            400
        )

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return error_response(
            "Invalid email or password.",
            401
        )

    login_user(user, remember=True)

    return success_response(
        data=user.to_dict(),
        message="Login successful."
    )


@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """
    Terminates the active session.
    """

    logout_user()

    return success_response(
        message="Logged out successfully."
    )


@auth_bp.route('/me', methods=['GET'])
@login_required
def get_profile():
    """
    Returns currently authenticated user's profile.
    """

    return success_response(
        data=current_user.to_dict(),
        message="Profile retrieved successfully."
    )