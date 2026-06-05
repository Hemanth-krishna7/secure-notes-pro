from datetime import datetime, timezone
from app import db

class Attachment(db.Model):
    """Attachment Model representing secure uploaded files associated with a note."""
    __tablename__ = 'attachments'

    id = db.Column(db.Integer, primary_key=True)
    original_filename = db.Column(db.String(255), nullable=False)
    stored_filename = db.Column(db.String(255), nullable=False)
    filepath = db.Column(db.String(512), nullable=False)
    mime_type = db.Column(db.String(100), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)
    note_id = db.Column(db.Integer, db.ForeignKey('notes.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    note = db.relationship('Note', back_populates='attachments')

    def to_dict(self):
        created_at_utc = self.created_at
        if created_at_utc and created_at_utc.tzinfo is None:
            created_at_utc = created_at_utc.replace(tzinfo=timezone.utc)

        return {
            'id': self.id,
            'original_filename': self.original_filename,
            'stored_filename': self.stored_filename,
            'filepath': self.filepath,
            'mime_type': self.mime_type,
            'file_size': self.file_size,
            'note_id': self.note_id,
            'created_at': created_at_utc.isoformat() if created_at_utc else None
        }
