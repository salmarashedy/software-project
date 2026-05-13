# src/server/config/__init__.py
# Configuration module for Flask app

from .database import db, init_db

__all__ = ['db', 'init_db']
