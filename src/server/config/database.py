# src/server/config/database.py
# Database configuration and initialization for SQLAlchemy

import os
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect, text

# Initialize SQLAlchemy instance
db = SQLAlchemy()


def init_db(app):
    """
    Initialize database with Flask app.
    Sets up SQLAlchemy configuration and creates all tables.
    
    Args:
        app: Flask application instance
    """
    # Configure SQLAlchemy
    db_url = os.getenv('DATABASE_URL', '')
    # Log what we received (mask password for safety)
    if db_url:
        parts = db_url.split('@')
        masked = parts[-1] if len(parts) > 1 else db_url[:30]
        print(f'[DB INIT] DATABASE_URL received, host portion: {masked}')
    else:
        print('[DB INIT] DATABASE_URL is empty, falling back to SQLite')

    # Fix postgres:// scheme (SQLAlchemy requires postgresql://)
    if db_url.startswith('postgres://'):
        db_url = db_url.replace('postgres://', 'postgresql://', 1)
    
    # Fall back to SQLite only if URL is missing or clearly invalid
    if not db_url or not db_url.startswith(('postgresql://', 'sqlite://')):
        print('[DB INIT] WARNING: Falling back to SQLite (DATABASE_URL unresolvable)')
        db_url = 'sqlite:///task_management.db'

    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize database with app
    db.init_app(app)

    # Import models so SQLAlchemy registers every table before create_all().
    from models import Comment, Project, ProjectInvite, ProjectMember, Subtask, Task, User  # noqa: F401
    
    # Create all tables
    with app.app_context():
        db.create_all()

        inspector = inspect(db.engine)
        table_names = set(inspector.get_table_names())

        if 'projects' not in table_names:
            db.session.execute(
                text(
                    """
                    CREATE TABLE IF NOT EXISTS projects (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        owner_id INTEGER,
                        name VARCHAR(120) NOT NULL UNIQUE,
                        description TEXT NOT NULL DEFAULT '',
                        color VARCHAR(32) NOT NULL DEFAULT '#6C3BFF',
                        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                    )
                    """
                )
            )
            db.session.commit()

        if 'project_members' not in table_names:
            db.session.execute(
                text(
                    """
                    CREATE TABLE IF NOT EXISTS project_members (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        project_id INTEGER NOT NULL,
                        user_id INTEGER NOT NULL,
                        role VARCHAR(20) NOT NULL DEFAULT 'member',
                        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(project_id, user_id)
                    )
                    """
                )
            )
            db.session.commit()

        project_columns = {column['name'] for column in inspector.get_columns('projects')} if 'projects' in table_names else set()
        if 'projects' in table_names and 'owner_id' not in project_columns:
            db.session.execute(text('ALTER TABLE projects ADD COLUMN owner_id INTEGER'))
            db.session.commit()

        task_columns = {column['name'] for column in inspector.get_columns('tasks')} if 'tasks' in table_names else set()
        if 'tasks' in table_names and 'project_id' not in task_columns:
            db.session.execute(text('ALTER TABLE tasks ADD COLUMN project_id INTEGER'))
            db.session.commit()
        if 'tasks' in table_names and 'assignee_user_id' not in task_columns:
            db.session.execute(text('ALTER TABLE tasks ADD COLUMN assignee_user_id INTEGER'))
            db.session.commit()

        if not Project.query.first():
            default_projects = [
                Project(name='Operations', description='Daily execution and support work', color='#6C3BFF'),
                Project(name='Product', description='Feature work and iteration', color='#22D3EE'),
                Project(name='Design', description='Creative and visual tasks', color='#F59E0B'),
            ]
            db.session.add_all(default_projects)
            db.session.commit()

        default_project = Project.query.order_by(Project.id.asc()).first()
        if default_project:
            db.session.execute(
                text('UPDATE tasks SET project_id = :project_id WHERE project_id IS NULL'),
                {'project_id': default_project.id},
            )
            db.session.commit()

        if 'project_invites' not in table_names:
            db.session.execute(
                text(
                    """
                    CREATE TABLE IF NOT EXISTS project_invites (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        project_id INTEGER NOT NULL,
                        email VARCHAR(120) NOT NULL,
                        role VARCHAR(20) NOT NULL DEFAULT 'member',
                        token VARCHAR(64) NOT NULL UNIQUE,
                        status VARCHAR(20) NOT NULL DEFAULT 'pending',
                        invited_by_id INTEGER,
                        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        responded_at DATETIME
                    )
                    """
                )
            )
            db.session.commit()

        first_user = User.query.order_by(User.id.asc()).first()
        if first_user:
            Project.query.filter(Project.owner_id.is_(None)).update({'owner_id': first_user.id})
            db.session.commit()

        if first_user and not ProjectMember.query.first():
            users = User.query.all()
            projects = Project.query.all()
            for user in users:
                for project in projects:
                    role = 'owner' if project.owner_id == user.id else 'member'
                    db.session.add(ProjectMember(project_id=project.id, user_id=user.id, role=role))
            db.session.commit()
