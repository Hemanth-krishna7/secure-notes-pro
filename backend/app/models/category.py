from datetime import datetime, timezone
from app import db

class Category(db.Model):
    """Category Model representing organization groups for notes."""
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = db.relationship('User', back_populates='categories')
    notes = db.relationship('Note', back_populates='category')

    def to_dict(self):
        """Serializes the category object into a dictionary."""
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
