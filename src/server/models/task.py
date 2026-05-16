from datetime import datetime

from config.database import db


class Task(db.Model):
    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='SET NULL'), nullable=True, index=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default='', nullable=False)
    status = db.Column(db.String(20), default='To Do', nullable=False)
    priority = db.Column(db.String(10), default='Medium', nullable=False)
    assignee_user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True)
    assignee_name = db.Column(db.String(100), default='', nullable=False)
    assignee_avatar = db.Column(db.String(255), default='', nullable=False)
    due_date = db.Column(db.Date, nullable=True)
    tags = db.Column(db.JSON, default=list, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    project = db.relationship('Project', back_populates='tasks')
    assignee = db.relationship('User')

    subtasks = db.relationship('Subtask', back_populates='task', cascade='all, delete-orphan', passive_deletes=True)
    comments = db.relationship('Comment', back_populates='task', cascade='all, delete-orphan', passive_deletes=True)

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'project_name': self.project.name if self.project else None,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'assignee_user_id': self.assignee_user_id,
            'assignee_name': self.assignee_name,
            'assignee_email': self.assignee.email if self.assignee else None,
            'assignee_avatar': self.assignee_avatar,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'tags': self.tags or [],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
