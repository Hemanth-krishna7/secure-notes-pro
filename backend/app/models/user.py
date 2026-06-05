from datetime import datetime, timezone
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from app import db

class User(UserMixin, db.Model):
    """User Model representing application credentials and profile."""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, index=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    notes = db.relationship('Note', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        """Hashes the password and saves it to password_hash."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Checks if hashed password matches the input password."""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        """Serializes the user object into a dictionary."""
        return {
            'id': self.id,
            'full_name': self.full_name,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
