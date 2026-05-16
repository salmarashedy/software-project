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
from dotenv import load_dotenv

from config import db, init_db
from routes.auth_routes import auth_bp
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
    app.config['JSON_SORT_KEYS'] = False
    
    init_db(app)

    CORS(app, resources={r"/*": {"origins": "*"}})
    
    from routes import health_bp, subtask_bp, comment_bp 
    app.register_blueprint(health_bp)
    app.register_blueprint(subtask_bp)
    app.register_blueprint(comment_bp)
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({'success': False, 'error': 'Endpoint not found'}), 404
    
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
