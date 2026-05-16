import os
import pytest

# Set database to in-memory SQLite before app is imported
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'

from app import create_app
from config.database import db

@pytest.fixture(scope="session")
def app():
    """Create and configure a new app instance for each test session."""
    app = create_app()
    app.config.update({
        "TESTING": True,
        "WTF_CSRF_ENABLED": False,
        "SERVER_NAME": "localhost",
    })
    
    # We yield the app with its app context
    with app.app_context():
        yield app

@pytest.fixture(scope="function")
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture(scope="function")
def _db(app):
    """A clean database for each test."""
    with app.app_context():
        db.create_all()
        yield db
        db.session.remove()
        db.drop_all()
