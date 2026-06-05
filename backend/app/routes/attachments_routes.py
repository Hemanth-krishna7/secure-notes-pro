import os
import uuid
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_login import login_required, current_user
from PIL import Image

from app import db
from app.models.note import Note
from app.models.attachment import Attachment

attachments_bp = Blueprint('attachments', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
ALLOWED_MIME_TYPES = {'image/png', 'image/jpeg', 'image/jpg', 'image/webp'}

def allowed_file(filename, mime_type):
    # Check extension
    ext = os.path.splitext(filename)[1].lower().replace('.', '')
    # Check mime type
    return ext in ALLOWED_EXTENSIONS and mime_type in ALLOWED_MIME_TYPES

@attachments_bp.route('/notes/<int:note_id>/attachments', methods=['POST'])
@login_required
def upload_attachment(note_id):
    note = Note.query.get_or_404(note_id)
    
    # Ownership check
    if note.user_id != current_user.id:
        return jsonify({"status": "error", "message": "Unauthorized access to this note"}), 403
        
    # Maximum 10 attachments per note check
    if len(note.attachments) >= 10:
        return jsonify({"status": "error", "message": "Maximum 10 attachments allowed per note"}), 400
        
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file part in the request"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"status": "error", "message": "No file selected for uploading"}), 400
        
    # Read MIME type
    mime_type = file.content_type
    
    # Validate extension and MIME type
    if not allowed_file(file.filename, mime_type):
        return jsonify({
            "status": "error", 
            "message": "Invalid file type. Only PNG, JPG, JPEG, and WEBP images are allowed."
        }), 400
        
    # Check file size (10MB limit)
    # Using tell() to determine size without reading everything into memory
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    
    if file_size > 10 * 1024 * 1024:
        return jsonify({"status": "error", "message": "File size exceeds the 10MB limit."}), 400
        
    # Generate UUID stored filename
    original_filename = file.filename
    ext = os.path.splitext(original_filename)[1].lower()
    stored_filename = f"{uuid.uuid4().hex}{ext}"
    
    # Ensure UPLOAD_FOLDER is configured and exists
    upload_dir = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_dir, exist_ok=True)
    
    filepath = os.path.join(upload_dir, stored_filename)
    
    # Save original file
    file.save(filepath)
    
    # Create thumbnail
    try:
        thumbs_dir = os.path.join(upload_dir, 'thumbs')
        os.makedirs(thumbs_dir, exist_ok=True)
        
        with Image.open(filepath) as img:
            img.thumbnail((300, 300))
            # Keep original format
            img.save(os.path.join(thumbs_dir, stored_filename))
    except Exception as e:
        # Log thumbnail exception, but don't fail upload
        current_app.logger.error(f"Failed to generate thumbnail: {str(e)}")
        
    # Save Attachment record
    attachment = Attachment(
        original_filename=original_filename,
        stored_filename=stored_filename,
        filepath=filepath,
        mime_type=mime_type,
        file_size=file_size,
        note_id=note.id
    )
    
    db.session.add(attachment)
    db.session.commit()
    
    return jsonify({
        "status": "success",
        "message": "Attachment uploaded successfully",
        "data": attachment.to_dict()
    }), 201

@attachments_bp.route('/attachments/<int:attachment_id>', methods=['GET'])
@login_required
def get_attachment(attachment_id):
    attachment = Attachment.query.get_or_404(attachment_id)
    
    # Ownership check
    if attachment.note.user_id != current_user.id:
        return jsonify({"status": "error", "message": "Unauthorized"}), 403
        
    directory = current_app.config['UPLOAD_FOLDER']
    stored_name = attachment.stored_filename
    
    # Handle serving of thumbnails if requested
    if request.args.get('thumbnail') == 'true':
        thumbs_dir = os.path.join(directory, 'thumbs')
        if os.path.exists(os.path.join(thumbs_dir, stored_name)):
            directory = thumbs_dir
            
    return send_from_directory(directory, stored_name)

@attachments_bp.route('/attachments/<int:attachment_id>', methods=['DELETE'])
@login_required
def delete_attachment(attachment_id):
    attachment = Attachment.query.get_or_404(attachment_id)
    
    # Ownership check
    if attachment.note.user_id != current_user.id:
        return jsonify({"status": "error", "message": "Unauthorized"}), 403
        
    # Delete physical file
    try:
        if os.path.exists(attachment.filepath):
            os.remove(attachment.filepath)
    except Exception as e:
        current_app.logger.error(f"Failed to delete original file: {str(e)}")
        
    # Delete thumbnail
    try:
        thumb_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'thumbs', attachment.stored_filename)
        if os.path.exists(thumb_path):
            os.remove(thumb_path)
    except Exception as e:
        current_app.logger.error(f"Failed to delete thumbnail file: {str(e)}")
        
    # Delete DB record
    db.session.delete(attachment)
    db.session.commit()
    
    return jsonify({
        "status": "success",
        "message": "Attachment deleted successfully"
    })
