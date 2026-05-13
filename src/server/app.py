# src/server/app.py
"""
Task Management API - Flask Backend

This is the main Flask application file that sets up:
- Flask app initialization
- Database configuration
- CORS configuration
- Blueprint registration for API routes
- Error handling middleware

To run this application:
    python app.py

The API will be available at: http://localhost:5000
"""

import os
from flask import Flask, jsonify
from flask_cors import CORS

# Import configuration and database
from config import db, init_db

# Import blueprints (routes)
from routes import subtask_bp, comment_bp, health_bp


def create_app():
    """
    Application factory function.
    
    Creates and configures the Flask application with:
    - Database setup
    - CORS configuration
    - Route blueprints
    - Error handlers
    
    Returns:
        Flask: Configured Flask application instance
    """
    # Create Flask app
    app = Flask(__name__)
    
    # Set Flask configuration
    app.config['JSON_SORT_KEYS'] = False
    
    # Initialize database with Flask app
    init_db(app)
    
    # Enable CORS for all routes
    # This allows frontend to communicate with the backend
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        }
    })
    
    # Register blueprints (API route groups)
    app.register_blueprint(health_bp)
    app.register_blueprint(subtask_bp)
    app.register_blueprint(comment_bp)
    
    # Error handler for 404 (Not Found)
    @app.errorhandler(404)
    def not_found_error(error):
        """Handle 404 errors."""
        return jsonify({
            'success': False,
            'error': 'Endpoint not found'
        }), 404
    
    # Error handler for 405 (Method Not Allowed)
    @app.errorhandler(405)
    def method_not_allowed_error(error):
        """Handle 405 errors."""
        return jsonify({
            'success': False,
            'error': 'Method not allowed'
        }), 405
    
    # Error handler for 500 (Internal Server Error)
    @app.errorhandler(500)
    def internal_server_error(error):
        """Handle 500 errors."""
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500
    
    return app


# Create the Flask app instance
app = create_app()


if __name__ == '__main__':
    """
    Run the Flask development server.
    
    Configure environment variables:
    - FLASK_ENV: Set to 'development' for debug mode
    - DATABASE_URL: Set to custom database URL (default: sqlite:///task_management.db)
    - FLASK_DEBUG: Set to 1 to enable debug mode
    """
    
    # Determine debug mode from environment
    debug = os.getenv('FLASK_DEBUG', '1') == '1'
    
    # Run the app on localhost:5000
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=debug
    )
