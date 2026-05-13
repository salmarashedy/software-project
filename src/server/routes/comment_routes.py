# src/server/routes/comment_routes.py
# API routes for Comment endpoints

from flask import Blueprint, request, jsonify
from controllers.comment_controller import CommentController

# Create blueprint for comment routes
comment_bp = Blueprint('comments', __name__, url_prefix='/api/comments')


@comment_bp.route('', methods=['POST'])
def create_comment():
    """
    Create a new comment on a task.
    
    Expected JSON body:
    {
        "taskId": <int>,
        "author": "<string>",
        "text": "<string>"
    }
    
    Returns:
        201: Created comment object
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
        author = data.get('author')
        text = data.get('text')
        
        if not task_id or not author or not text:
            return jsonify({
                'success': False,
                'error': 'taskId, author, and text are required'
            }), 400
        
        # Call controller
        response, status_code = CommentController.create_comment(task_id, author, text)
        return jsonify(response), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Unexpected error: {str(e)}'
        }), 500


@comment_bp.route('/task/<int:task_id>', methods=['GET'])
def get_comments_for_task(task_id):
    """
    Get all comments for a specific task.
    
    Args:
        task_id (int): The parent task ID (path parameter)
    
    Returns:
        200: List of comments for the task
        500: Server error
    """
    try:
        response, status_code = CommentController.get_comments_by_task(task_id)
        return jsonify(response), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Unexpected error: {str(e)}'
        }), 500


@comment_bp.route('/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    """
    Delete a comment.
    
    Args:
        comment_id (int): The comment ID (path parameter)
    
    Returns:
        200: Success message
        404: Comment not found
        500: Server error
    """
    try:
        response, status_code = CommentController.delete_comment(comment_id)
        return jsonify(response), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Unexpected error: {str(e)}'
        }), 500
