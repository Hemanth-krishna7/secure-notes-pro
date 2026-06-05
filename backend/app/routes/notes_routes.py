from flask import Blueprint, request
from flask_login import current_user
from app import db
from app.models.note import Note
from app.utils.helpers import success_response, error_response

notes_bp = Blueprint('notes', __name__)

@notes_bp.before_request
def require_login():
    """Ensure that all note endpoints require an active session."""
    if request.method == 'OPTIONS':
        return
    if not current_user.is_authenticated:
        return error_response("Unauthorized access. Please login.", 401)

@notes_bp.route('', methods=['GET'])
@notes_bp.route('/', methods=['GET'])
def get_notes():
    """Fetches all notes belonging to the authenticated user."""
    try:
        # Order by pinned first, then last updated
        notes = Note.query.filter_by(user_id=current_user.id).order_by(
            Note.is_pinned.desc(),
            Note.updated_at.desc()
        ).all()
        return success_response(
            data=[note.to_dict() for note in notes],
            message="Notes retrieved successfully."
        )
    except Exception as e:
        return error_response("An error occurred while fetching notes.", 500)

@notes_bp.route('', methods=['POST'])
@notes_bp.route('/', methods=['POST'])
def create_note():
    """Creates a new note for the authenticated user."""
    try:
        data = request.get_json() or {}
        title = data.get('title', '').strip()
        content = data.get('content', '')
        color = data.get('color', '#ffffff').strip()
        is_pinned = data.get('is_pinned', False)
        is_favorite = data.get('is_favorite', False)

        if not title:
            return error_response("Title is required.", 400)

        note = Note(
            title=title,
            content=content,
            color=color,
            is_pinned=bool(is_pinned),
            is_favorite=bool(is_favorite),
            user_id=current_user.id
        )
        db.session.add(note)
        db.session.commit()

        return success_response(
            data=note.to_dict(),
            message="Note created successfully.",
            status_code=201
        )
    except Exception as e:
        db.session.rollback()
        return error_response("An error occurred while creating the note.", 500)

@notes_bp.route('/<int:note_id>', methods=['GET'])
def get_note(note_id):
    """Fetches a specific note belonging to the authenticated user."""
    try:
        note = Note.query.filter_by(id=note_id, user_id=current_user.id).first()
        if not note:
            return error_response("Note not found.", 404)
        return success_response(
            data=note.to_dict(),
            message="Note retrieved successfully."
        )
    except Exception as e:
        return error_response("An error occurred while fetching the note.", 500)

@notes_bp.route('/<int:note_id>', methods=['PUT', 'PATCH'])
def update_note(note_id):
    """Updates a specific note belonging to the authenticated user."""
    try:
        note = Note.query.filter_by(id=note_id, user_id=current_user.id).first()
        if not note:
            return error_response("Note not found.", 404)

        data = request.get_json() or {}
        
        # Validating title if provided
        if 'title' in data:
            title = data.get('title', '').strip()
            if not title:
                return error_response("Title is required.", 400)
            note.title = title

        if 'content' in data:
            note.content = data.get('content')
            
        if 'color' in data:
            color = data.get('color', '#ffffff').strip()
            note.color = color

        if 'is_pinned' in data:
            note.is_pinned = bool(data.get('is_pinned'))

        if 'is_favorite' in data:
            note.is_favorite = bool(data.get('is_favorite'))

        db.session.commit()

        return success_response(
            data=note.to_dict(),
            message="Note updated successfully."
        )
    except Exception as e:
        db.session.rollback()
        return error_response("An error occurred while updating the note.", 500)

@notes_bp.route('/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    """Deletes a specific note belonging to the authenticated user."""
    try:
        note = Note.query.filter_by(id=note_id, user_id=current_user.id).first()
        if not note:
            return error_response("Note not found.", 404)

        db.session.delete(note)
        db.session.commit()

        return success_response(
            message="Note deleted successfully."
        )
    except Exception as e:
        db.session.rollback()
        return error_response("An error occurred while deleting the note.", 500)
