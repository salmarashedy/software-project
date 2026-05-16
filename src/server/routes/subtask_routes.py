# src/server/routes/subtask_routes.py
# API routes for Subtask endpoints

from flask import Blueprint, request, jsonify
from controllers.auth_controller import token_required
from controllers.subtask_controller import SubtaskController

# Create blueprint for subtask routes
subtask_bp = Blueprint('subtasks', __name__, url_prefix='/api/subtasks')


@subtask_bp.route('', methods=['POST'])
@token_required
def create_subtask(current_user):
    """
    Create a new subtask.
    
    Expected JSON body:
    {
        "taskId": <int>,
        "title": "<string>"
    }
    
    Returns:
        201: Created subtask object
        400: Bad request (missing or invalid data)
        500: Server error
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return jsonify({
                'success': False,
                'error': 'Request body is required'
            }), 400
        
        task_id = data.get('taskId')
        title = data.get('title')
        
        if not task_id or not title:
            return jsonify({
                'success': False,
                'error': 'taskId and title are required'
            }), 400
        
        # Call controller
        response, status_code = SubtaskController.create_subtask(current_user, task_id, title)
        return jsonify(response), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Unexpected error: {str(e)}'
        }), 500


@subtask_bp.route('/task/<int:task_id>', methods=['GET'])
@token_required
def get_subtasks_for_task(current_user, task_id):
    """
    Get all subtasks for a specific task.
    
    Args:
        task_id (int): The parent task ID (path parameter)
    
    Returns:
        200: List of subtasks for the task
        500: Server error
    """
    try:
        response, status_code = SubtaskController.get_subtasks_by_task(current_user, task_id)
        return jsonify(response), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Unexpected error: {str(e)}'
        }), 500


@subtask_bp.route('/<int:subtask_id>', methods=['PUT'])
@token_required
def update_subtask_status(current_user, subtask_id):
    """
    Update subtask completion status.
    
    Args:
        subtask_id (int): The subtask ID (path parameter)
    
    Expected JSON body:
    {
        "completed": <boolean>
    }
    
    Returns:
        200: Updated subtask object
        400: Bad request (missing or invalid data)
        404: Subtask not found
        500: Server error
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'completed' not in data:
            return jsonify({
                'success': False,
                'error': 'completed field is required'
            }), 400
        
        completed = data.get('completed')
        
        # Validate type
        if not isinstance(completed, bool):
            return jsonify({
                'success': False,
                'error': 'completed must be a boolean'
            }), 400
        
        # Call controller
        response, status_code = SubtaskController.update_subtask_status(current_user, subtask_id, completed)
        return jsonify(response), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Unexpected error: {str(e)}'
        }), 500


@subtask_bp.route('/<int:subtask_id>', methods=['DELETE'])
@token_required
def delete_subtask(current_user, subtask_id):
    """
    Delete a subtask.
    
    Args:
        subtask_id (int): The subtask ID (path parameter)
    
    Returns:
        200: Success message
        404: Subtask not found
        500: Server error
    """
    try:
        response, status_code = SubtaskController.delete_subtask(current_user, subtask_id)
        return jsonify(response), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Unexpected error: {str(e)}'
        }), 500
