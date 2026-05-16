from config import db 
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    projects_owned = db.relationship('Project', back_populates='owner')
    project_memberships = db.relationship('ProjectMember', back_populates='user', cascade='all, delete-orphan', passive_deletes=True)

    def __repr__(self):
        return f'<User {self.username}>'
