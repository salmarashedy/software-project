# src/server/routes/__init__.py
# Routes module for API endpoints

from flask import Blueprint
from .subtask_routes import subtask_bp
from .comment_routes import comment_bp
from .health_routes import health_bp
from .auth_routes import auth_bp
__all__ = ['subtask_bp', 'comment_bp', 'health_bp' 'auth_bp']
