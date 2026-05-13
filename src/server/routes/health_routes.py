# src/server/routes/health_routes.py
# Health check and status routes

from flask import Blueprint, jsonify

# Create blueprint for health routes
health_bp = Blueprint('health', __name__, url_prefix='/api')


@health_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint.
    
    Returns basic information about the API status.
    
    Returns:
        200: API is healthy with status information
    """
    return jsonify({
        'success': True,
        'status': 'healthy',
        'message': 'Task Management API is running'
    }), 200
