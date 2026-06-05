from datetime import datetime, timezone
from app import db

# Association Table for Many-to-Many Relationship
note_tags = db.Table('note_tags',
    db.Column('note_id', db.Integer, db.ForeignKey('notes.id', ondelete='CASCADE'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id', ondelete='CASCADE'), primary_key=True)
)

class Tag(db.Model):
    """Tag Model representing customizable labels for notes."""
    __tablename__ = 'tags'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = db.relationship('User', back_populates='tags')

    def to_dict(self):
        """Serializes the tag object into a dictionary."""
        created_at_utc = self.created_at
        if created_at_utc and created_at_utc.tzinfo is None:
            created_at_utc = created_at_utc.replace(tzinfo=timezone.utc)
            
        updated_at_utc = self.updated_at
        if updated_at_utc and updated_at_utc.tzinfo is None:
            updated_at_utc = updated_at_utc.replace(tzinfo=timezone.utc)

        return {
            'id': self.id,
            'name': self.name,
            'user_id': self.user_id,
            'created_at': created_at_utc.isoformat() if created_at_utc else None,
            'updated_at': updated_at_utc.isoformat() if updated_at_utc else None
        }
