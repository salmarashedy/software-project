# Subtasks backend feature
# src/server/controllers/subtask_controller.py
# Business logic controller for Subtask operations

from config.database import db
from models.subtask import Subtask


class SubtaskController:
    """
    Controller for handling Subtask business logic.
    
    Manages CRUD operations for subtasks including:
    - Creating new subtasks
    - Retrieving subtasks for a task
    - Updating subtask completion status
    - Deleting subtasks
    """
    
    @staticmethod
    def create_subtask(task_id, title):
        """
        Create a new subtask for a task.
        
        Args:
            task_id (int): The parent task ID
            title (str): The subtask title
            
        Returns:
            dict: The created subtask data or error response
            
        Raises:
            ValueError: If required fields are missing
        """
        try:
            # Validate input
            if not title or not title.strip():
                return {
                    'success': False,
                    'error': 'Subtask title is required'
                }, 400
            
            # Create new subtask
            subtask = Subtask(task_id=task_id, title=title.strip())
            
            # Add to database
            db.session.add(subtask)
            db.session.commit()
            
            return {
                'success': True,
                'data': subtask.to_dict()
            }, 201
            
        except Exception as e:
            db.session.rollback()
            return {
                'success': False,
                'error': f'Failed to create subtask: {str(e)}'
            }, 500
    
    @staticmethod
    def get_subtasks_by_task(task_id):
        """
        Get all subtasks for a specific task.
        
        Args:
            task_id (int): The parent task ID
            
        Returns:
            dict: List of subtasks for the task
        """
        try:
            subtasks = Subtask.query.filter_by(task_id=task_id).all()
            
            return {
                'success': True,
                'data': [subtask.to_dict() for subtask in subtasks]
            }, 200
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to retrieve subtasks: {str(e)}'
            }, 500
    
    @staticmethod
    def update_subtask_status(subtask_id, completed):
        """
        Update the completion status of a subtask.
        
        Args:
            subtask_id (int): The subtask ID
            completed (bool): The new completion status
            
        Returns:
            dict: The updated subtask data or error response
        """
        try:
            # Find subtask
            subtask = Subtask.query.get(subtask_id)
            if not subtask:
                return {
                    'success': False,
                    'error': f'Subtask {subtask_id} not found'
                }, 404
            
            # Update status
            subtask.completed = completed
            db.session.commit()
            
            return {
                'success': True,
                'data': subtask.to_dict()
            }, 200
            
        except Exception as e:
            db.session.rollback()
            return {
                'success': False,
                'error': f'Failed to update subtask: {str(e)}'
            }, 500
    
    @staticmethod
    def delete_subtask(subtask_id):
        """
        Delete a subtask.
        
        Args:
            subtask_id (int): The subtask ID
            
        Returns:
            dict: Success message or error response
        """
        try:
            # Find subtask
            subtask = Subtask.query.get(subtask_id)
            if not subtask:
                return {
                    'success': False,
                    'error': f'Subtask {subtask_id} not found'
                }, 404
            
            # Delete from database
            db.session.delete(subtask)
            db.session.commit()
            
            return {
                'success': True,
                'message': f'Subtask {subtask_id} deleted successfully'
            }, 200
            
        except Exception as e:
            db.session.rollback()
            return {
                'success': False,
                'error': f'Failed to delete subtask: {str(e)}'
            }, 500
