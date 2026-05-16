from datetime import datetime

from config.database import db


class Project(db.Model):
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    description = db.Column(db.Text, default='', nullable=False)
    color = db.Column(db.String(32), default='#6C3BFF', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    owner = db.relationship('User', back_populates='projects_owned')
    tasks = db.relationship('Task', back_populates='project')
    members = db.relationship('ProjectMember', back_populates='project', cascade='all, delete-orphan', passive_deletes=True)
    invites = db.relationship('ProjectInvite', back_populates='project', cascade='all, delete-orphan', passive_deletes=True)

    def to_dict(self, task_count=0, member_count=0, current_user_id=None):
        return {
            'id': self.id,
            'owner_id': self.owner_id,
            'owner_username': self.owner.username if self.owner else None,
            'name': self.name,
            'description': self.description,
            'color': self.color,
            'task_count': task_count,
            'member_count': member_count,
            'is_owner': current_user_id is not None and self.owner_id == current_user_id,
            'is_member': current_user_id is not None and any(member.user_id == current_user_id for member in self.members),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
