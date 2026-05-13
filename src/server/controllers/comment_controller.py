# Comments backend feature
# src/server/controllers/comment_controller.py
# Business logic controller for Comment operations

from config.database import db
from models.comment import Comment


class CommentController:
    """
    Controller for handling Comment business logic.
    
    Manages CRUD operations for comments including:
    - Creating new comments
    - Retrieving comments for a task
    - Deleting comments
    """
    
    @staticmethod
    def create_comment(task_id, author, text):
        """
        Create a new comment for a task.
        
        Args:
            task_id (int): The parent task ID
            author (str): The comment author's name
            text (str): The comment text content
            
        Returns:
            dict: The created comment data or error response
            
        Raises:
            ValueError: If required fields are missing
        """
        try:
            # Validate input
            if not author or not author.strip():
                return {
                    'success': False,
                    'error': 'Author name is required'
                }, 400
            
            if not text or not text.strip():
                return {
                    'success': False,
                    'error': 'Comment text is required'
                }, 400
            
            # Create new comment
            comment = Comment(
                task_id=task_id,
                author=author.strip(),
                text=text.strip()
            )
            
            # Add to database
            db.session.add(comment)
            db.session.commit()
            
            return {
                'success': True,
                'data': comment.to_dict()
            }, 201
            
        except Exception as e:
            db.session.rollback()
            return {
                'success': False,
                'error': f'Failed to create comment: {str(e)}'
            }, 500
    
    @staticmethod
    def get_comments_by_task(task_id):
        """
        Get all comments for a specific task.
        
        Args:
            task_id (int): The parent task ID
            
        Returns:
            dict: List of comments for the task
        """
        try:
            comments = Comment.query.filter_by(task_id=task_id).all()
            
            return {
                'success': True,
                'data': [comment.to_dict() for comment in comments]
            }, 200
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to retrieve comments: {str(e)}'
            }, 500
    
    @staticmethod
    def delete_comment(comment_id):
        """
        Delete a comment.
        
        Args:
            comment_id (int): The comment ID
            
        Returns:
            dict: Success message or error response
        """
        try:
            # Find comment
            comment = Comment.query.get(comment_id)
            if not comment:
                return {
                    'success': False,
                    'error': f'Comment {comment_id} not found'
                }, 404
            
            # Delete from database
            db.session.delete(comment)
            db.session.commit()
            
            return {
                'success': True,
                'message': f'Comment {comment_id} deleted successfully'
            }, 200
            
        except Exception as e:
            db.session.rollback()
            return {
                'success': False,
                'error': f'Failed to delete comment: {str(e)}'
            }, 500
