from datetime import datetime
from uuid import uuid4

from config.database import db


class ProjectInvite(db.Model):
    __tablename__ = 'project_invites'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, index=True)
    email = db.Column(db.String(120), nullable=False, index=True)
    role = db.Column(db.String(20), default='member', nullable=False)
    token = db.Column(db.String(64), default=lambda: uuid4().hex, unique=True, nullable=False, index=True)
    status = db.Column(db.String(20), default='pending', nullable=False, index=True)
    invited_by_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    responded_at = db.Column(db.DateTime, nullable=True)

    project = db.relationship('Project', back_populates='invites')
    invited_by = db.relationship('User', foreign_keys=[invited_by_id])

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'project_name': self.project.name if self.project else None,
            'email': self.email,
            'role': self.role,
            'status': self.status,
            'invited_by_id': self.invited_by_id,
            'invited_by_username': self.invited_by.username if self.invited_by else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'responded_at': self.responded_at.isoformat() if self.responded_at else None,
        }
