from flask import Blueprint, request
from flask_login import current_user
from app import db
from app.models.tag import Tag
from app.utils.helpers import success_response, error_response

tags_bp = Blueprint('tags', __name__)

@tags_bp.before_request
def require_login():
    """Ensure that all tag endpoints require an active session."""
    if request.method == 'OPTIONS':
        return
    if not current_user.is_authenticated:
        return error_response("Unauthorized access. Please login.", 401)

@tags_bp.route('', methods=['GET'])
@tags_bp.route('/', methods=['GET'])
def get_tags():
    """Fetches all tags belonging to the authenticated user."""
    try:
        tags = Tag.query.filter_by(user_id=current_user.id).order_by(Tag.name.asc()).all()
        return success_response(
            data=[tag.to_dict() for tag in tags],
            message="Tags retrieved successfully."
        )
    except Exception as e:
        return error_response("An error occurred while fetching tags.", 500)

@tags_bp.route('', methods=['POST'])
@tags_bp.route('/', methods=['POST'])
def create_tag():
    """Creates a new tag for the authenticated user."""
    try:
        data = request.get_json() or {}
        name = data.get('name', '').strip()

        if not name:
            return error_response("Tag name is required.", 400)

        # Enforce name uniqueness per user (case-sensitive or insensitive? Let's do case-insensitive/exact comparison)
        existing = Tag.query.filter_by(user_id=current_user.id, name=name).first()
        if existing:
            return error_response("Tag name must be unique. A tag with this name already exists.", 400)

        tag = Tag(name=name, user_id=current_user.id)
        db.session.add(tag)
        db.session.commit()

        return success_response(
            data=tag.to_dict(),
            message="Tag created successfully.",
            status_code=201
        )
    except Exception as e:
        db.session.rollback()
        return error_response("An error occurred while creating the tag.", 500)

@tags_bp.route('/<int:tag_id>', methods=['DELETE'])
def delete_tag(tag_id):
    """Deletes a specific tag belonging to the authenticated user."""
    try:
        tag = Tag.query.filter_by(id=tag_id, user_id=current_user.id).first()
        if not tag:
            return error_response("Tag not found.", 404)

        db.session.delete(tag)
        db.session.commit()

        return success_response(
            message="Tag deleted successfully."
        )
    except Exception as e:
        db.session.rollback()
        return error_response("An error occurred while deleting the tag.", 500)
