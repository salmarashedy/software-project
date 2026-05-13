# src/server/models/comment.py
# SQLAlchemy model for Comment entity

from datetime import datetime
from config.database import db


class Comment(db.Model):
    """
    Comment database model.
    
    Represents a comment attached to a task.
    A task can have multiple comments.
    
    Attributes:
        id (int): Primary key
        task_id (int): Foreign key referencing the parent task
        author (str): Name/username of the comment author
        text (str): Content of the comment
        created_at (datetime): Timestamp when comment was created
    """
    __tablename__ = 'comments'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Key (references Task table)
    task_id = db.Column(db.Integer, nullable=False, index=True)
    
    # Comment Data
    author = db.Column(db.String(100), nullable=False)
    text = db.Column(db.Text, nullable=False)
    
    # Timestamp
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f'<Comment {self.id}: {self.author} on task {self.task_id}>'
    
    def to_dict(self):
        """Convert comment to dictionary for JSON response."""
        return {
            'id': self.id,
            'taskId': self.task_id,
            'author': self.author,
            'text': self.text,
            'createdAt': self.created_at.isoformat()
        }
