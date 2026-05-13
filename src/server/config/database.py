# src/server/config/database.py
# Database configuration and initialization for SQLAlchemy

import os
from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy instance
db = SQLAlchemy()


def init_db(app):
    """
    Initialize database with Flask app.
    Sets up SQLAlchemy configuration and creates all tables.
    
    Args:
        app: Flask application instance
    """
    # Configure SQLAlchemy
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        'DATABASE_URL',
        'sqlite:///task_management.db'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize database with app
    db.init_app(app)
    
    # Create all tables
    with app.app_context():
        db.create_all()
