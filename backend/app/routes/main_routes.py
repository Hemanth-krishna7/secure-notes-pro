from flask import Blueprint, jsonify

main_bp = Blueprint('main', __name__)

@main_bp.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "SecureNotes Pro API"
    }), 200
