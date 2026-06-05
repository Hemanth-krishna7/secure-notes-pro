from flask import Blueprint, request
from flask_login import current_user
from app import db
from app.models.category import Category
from app.models.note import Note
from app.utils.helpers import success_response, error_response

categories_bp = Blueprint('categories', __name__)

@categories_bp.before_request
def require_login():
    """Ensure that all category endpoints require an active session."""
    if request.method == 'OPTIONS':
        return
    if not current_user.is_authenticated:
        return error_response("Unauthorized access. Please login.", 401)

@categories_bp.route('', methods=['GET'])
@categories_bp.route('/', methods=['GET'])
def get_categories():
    """Fetches all categories belonging to the authenticated user."""
    try:
        categories = Category.query.filter_by(user_id=current_user.id).order_by(Category.name.asc()).all()
        return success_response(
            data=[category.to_dict() for category in categories],
            message="Categories retrieved successfully."
        )
    except Exception as e:
        return error_response("An error occurred while fetching categories.", 500)

@categories_bp.route('', methods=['POST'])
@categories_bp.route('/', methods=['POST'])
def create_category():
    """Creates a new category for the authenticated user."""
    try:
        data = request.get_json() or {}
        name = data.get('name', '').strip()

        if not name:
            return error_response("Category name is required.", 400)

        # Check if user already has a category with this name
        existing = Category.query.filter_by(user_id=current_user.id, name=name).first()
        if existing:
            return error_response("A category with this name already exists.", 400)

        category = Category(name=name, user_id=current_user.id)
        db.session.add(category)
        db.session.commit()

        return success_response(
            data=category.to_dict(),
            message="Category created successfully.",
            status_code=201
        )
    except Exception as e:
        db.session.rollback()
        return error_response("An error occurred while creating the category.", 500)

@categories_bp.route('/<int:category_id>', methods=['PUT', 'PATCH'])
def update_category(category_id):
    """Updates a specific category name."""
    try:
        category = Category.query.filter_by(id=category_id, user_id=current_user.id).first()
        if not category:
            return error_response("Category not found.", 404)

        if category.name == 'Uncategorized':
            return error_response("The 'Uncategorized' category cannot be renamed.", 400)

        data = request.get_json() or {}
        name = data.get('name', '').strip()

        if not name:
            return error_response("Category name is required.", 400)

        if name == 'Uncategorized':
            return error_response("Cannot rename category to 'Uncategorized'.", 400)

        # Check uniqueness excluding the current category
        existing = Category.query.filter(
            Category.user_id == current_user.id,
            Category.name == name,
            Category.id != category_id
        ).first()
        if existing:
            return error_response("A category with this name already exists.", 400)

        category.name = name
        db.session.commit()

        return success_response(
            data=category.to_dict(),
            message="Category updated successfully."
        )
    except Exception as e:
        db.session.rollback()
        return error_response("An error occurred while updating the category.", 500)

@categories_bp.route('/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    """Deletes a specific category and moves its notes to 'Uncategorized'."""
    try:
        category = Category.query.filter_by(id=category_id, user_id=current_user.id).first()
        if not category:
            return error_response("Category not found.", 404)

        if category.name == 'Uncategorized':
            return error_response("The 'Uncategorized' category cannot be deleted.", 400)

        # Find or create Uncategorized category
        uncategorized = Category.query.filter_by(user_id=current_user.id, name='Uncategorized').first()
        if not uncategorized:
            uncategorized = Category(name='Uncategorized', user_id=current_user.id)
            db.session.add(uncategorized)
            db.session.commit()

        # Migrate notes in this category to Uncategorized
        notes = Note.query.filter_by(category_id=category_id, user_id=current_user.id).all()
        for note in notes:
            note.category_id = uncategorized.id

        db.session.delete(category)
        db.session.commit()

        return success_response(
            message="Category deleted successfully. All associated notes have been moved to 'Uncategorized'."
        )
    except Exception as e:
        db.session.rollback()
        return error_response("An error occurred while deleting the category.", 500)
