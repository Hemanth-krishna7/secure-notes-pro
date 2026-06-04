# SecureNotes Pro Service Layer
# This package will contain files containing business logic classes to isolate routes from models.

class BaseService:
    """Base class for all business services."""
    def __init__(self, db_session=None):
        self.db_session = db_session

class AuthService(BaseService):
    """AuthService class skeleton for future user management, password verification, etc."""
    pass

class NoteService(BaseService):
    """NoteService class skeleton for future note CRUD orchestration."""
    pass
