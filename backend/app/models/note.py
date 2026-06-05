from datetime import datetime, timezone
from app import db

class Note(db.Model):
    """Note Model representing secure user notes."""
    __tablename__ = 'notes'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=True)
    color = db.Column(db.String(7), default="#ffffff", nullable=False)
    is_pinned = db.Column(db.Boolean, default=False, nullable=False)
    is_favorite = db.Column(db.Boolean, default=False, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    category_id = db.Column(db.Integer, db.ForeignKey('categories.id', ondelete='SET NULL'), nullable=True)
    is_archived = db.Column(db.Boolean, default=False, nullable=False)

    # Relationships
    category = db.relationship('Category', back_populates='notes')
    tags = db.relationship('Tag', secondary='note_tags', backref=db.backref('notes', lazy='dynamic'))
    attachments = db.relationship('Attachment', back_populates='note', cascade='all, delete-orphan')

    def to_dict(self):
        """Serializes the note object into a dictionary."""
        created_at_utc = self.created_at
        if created_at_utc and created_at_utc.tzinfo is None:
            created_at_utc = created_at_utc.replace(tzinfo=timezone.utc)
            
        updated_at_utc = self.updated_at
        if updated_at_utc and updated_at_utc.tzinfo is None:
            updated_at_utc = updated_at_utc.replace(tzinfo=timezone.utc)

        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'color': self.color,
            'is_pinned': self.is_pinned,
            'is_favorite': self.is_favorite,
            'is_archived': self.is_archived,
            'category_id': self.category_id,
            'category': self.category.to_dict() if self.category else {"id": None, "name": "Uncategorized"},
            'tags': [tag.to_dict() for tag in self.tags],
            'attachments': [a.to_dict() for a in self.attachments],
            'user_id': self.user_id,
            'created_at': created_at_utc.isoformat() if created_at_utc else None,
            'updated_at': updated_at_utc.isoformat() if updated_at_utc else None
        }
