# src/server/models/subtask.py
# SQLAlchemy model for Subtask entity

from datetime import datetime
from config.database import db


class Subtask(db.Model):
    """
    Subtask database model.
    
    Represents a subtask that belongs to a main task.
    A task can have multiple subtasks.
    
    Attributes:
        id (int): Primary key
        task_id (int): Foreign key referencing the parent task
        title (str): Title/description of the subtask
        completed (bool): Completion status of the subtask
        created_at (datetime): Timestamp when subtask was created
    """
    __tablename__ = 'subtasks'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Key (references Task table)
    task_id = db.Column(db.Integer, nullable=False, index=True)
    
    # Subtask Data
    title = db.Column(db.String(255), nullable=False)
    completed = db.Column(db.Boolean, default=False, nullable=False)
    
    # Timestamp
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f'<Subtask {self.id}: {self.title}>'
    
    def to_dict(self):
        """Convert subtask to dictionary for JSON response."""
        return {
            'id': self.id,
            'taskId': self.task_id,
            'title': self.title,
            'completed': self.completed,
            'createdAt': self.created_at.isoformat()
        }
