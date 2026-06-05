import os
from flask import Blueprint, request, current_app
from flask_login import current_user
from app import db
from app.models.note import Note
from app.models.category import Category
from app.models.tag import Tag
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
    """Fetches all notes belonging to the authenticated user (defaults to active notes)."""
    try:
        archived = request.args.get('archived', 'false').lower() == 'true'
        # Order by pinned first, then last updated
        notes = Note.query.filter_by(user_id=current_user.id, is_archived=archived).order_by(
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
        category_id = data.get('category_id')
        tag_ids = data.get('tag_ids', [])

        if not title:
            return error_response("Title is required.", 400)

        # Validate category ownership
        if category_id:
            category = Category.query.filter_by(id=category_id, user_id=current_user.id).first()
            if not category:
                return error_response("Invalid category.", 400)
        else:
            # Default to Uncategorized category
            uncategorized = Category.query.filter_by(user_id=current_user.id, name='Uncategorized').first()
            if uncategorized:
                category_id = uncategorized.id

        # Validate tags ownership
        tags = []
        if tag_ids:
            tags = Tag.query.filter(Tag.id.in_(tag_ids), Tag.user_id == current_user.id).all()
            if len(tags) != len(tag_ids):
                return error_response("One or more invalid tags.", 400)

        note = Note(
            title=title,
            content=content,
            color=color,
            is_pinned=bool(is_pinned),
            is_favorite=bool(is_favorite),
            category_id=category_id,
            user_id=current_user.id
        )
        if tags:
            note.tags = tags

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

        # Support category updates
        if 'category_id' in data:
            category_id = data.get('category_id')
            if category_id:
                category = Category.query.filter_by(id=category_id, user_id=current_user.id).first()
                if not category:
                    return error_response("Invalid category.", 400)
                note.category_id = category_id
            else:
                # Default to Uncategorized category
                uncategorized = Category.query.filter_by(user_id=current_user.id, name='Uncategorized').first()
                note.category_id = uncategorized.id if uncategorized else None

        # Support tag updates
        if 'tag_ids' in data:
            tag_ids = data.get('tag_ids', [])
            if tag_ids:
                tags = Tag.query.filter(Tag.id.in_(tag_ids), Tag.user_id == current_user.id).all()
                if len(tags) != len(tag_ids):
                    return error_response("One or more invalid tags.", 400)
                note.tags = tags
            else:
                note.tags = []

        db.session.commit()

        return success_response(
            data=note.to_dict(),
            message="Note updated successfully."
        )
    except Exception as e:
        db.session.rollback()
        return error_response("An error occurred while updating the note.", 500)

@notes_bp.route('/<int:note_id>/archive', methods=['PUT'])
def archive_note(note_id):
    """Archives a specific note (sets is_archived = True)."""
    try:
        note = Note.query.filter_by(id=note_id, user_id=current_user.id).first()
        if not note:
            return error_response("Note not found.", 404)
        
        note.is_archived = True
        db.session.commit()

        return success_response(
            data=note.to_dict(),
            message="Note archived successfully."
        )
    except Exception as e:
        db.session.rollback()
        return error_response("An error occurred while archiving the note.", 500)

@notes_bp.route('/<int:note_id>/restore', methods=['PUT'])
def restore_note(note_id):
    """Restores a specific note from the archive (sets is_archived = False)."""
    try:
        note = Note.query.filter_by(id=note_id, user_id=current_user.id).first()
        if not note:
            return error_response("Note not found.", 404)
        
        note.is_archived = False
        db.session.commit()

        return success_response(
            data=note.to_dict(),
            message="Note restored successfully."
        )
    except Exception as e:
        db.session.rollback()
        return error_response("An error occurred while restoring the note.", 500)

@notes_bp.route('/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    """Permanently deletes a note, restricted to archived notes only."""
    try:
        note = Note.query.filter_by(id=note_id, user_id=current_user.id).first()
        if not note:
            return error_response("Note not found.", 404)

        if not note.is_archived:
            return error_response("Only archived notes can be permanently deleted.", 400)

        # Delete associated physical files and thumbnails
        for attachment in note.attachments:
            try:
                if os.path.exists(attachment.filepath):
                    os.remove(attachment.filepath)
            except Exception as e:
                pass
            try:
                thumb_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'thumbs', attachment.stored_filename)
                if os.path.exists(thumb_path):
                    os.remove(thumb_path)
            except Exception as e:
                pass

        db.session.delete(note)
        db.session.commit()

        return success_response(
            message="Note permanently deleted successfully."
        )
    except Exception as e:
        db.session.rollback()
        return error_response("An error occurred while deleting the note.", 500)
