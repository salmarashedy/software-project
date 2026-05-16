import re
from datetime import datetime

from sqlalchemy import func

from config.database import db
from models.project import Project
from models.project_invite import ProjectInvite
from models.project_member import ProjectMember
from models.task import Task
from models.user import User


def _has_project_access(current_user, project_id):
    return bool(
        Project.query
        .outerjoin(ProjectMember, ProjectMember.project_id == Project.id)
        .filter(Project.id == project_id)
        .filter((Project.owner_id == current_user.id) | (ProjectMember.user_id == current_user.id))
        .first()
    )


def _is_project_owner(current_user, project_id):
    return bool(Project.query.filter_by(id=project_id, owner_id=current_user.id).first())


def _normalize_email(value):
    return (value or '').strip().lower()


class ProjectController:
    @staticmethod
    def get_projects(current_user):
        try:
            accessible_project_ids = (
                db.session.query(Project.id)
                .outerjoin(ProjectMember, ProjectMember.project_id == Project.id)
                .filter((Project.owner_id == current_user.id) | (ProjectMember.user_id == current_user.id))
                .distinct()
                .subquery()
            )

            rows = (
                db.session.query(
                    Project,
                    func.count(func.distinct(Task.id)).label('task_count'),
                    func.count(func.distinct(ProjectMember.id)).label('member_count'),
                )
                .outerjoin(Task, Task.project_id == Project.id)
                .outerjoin(ProjectMember, ProjectMember.project_id == Project.id)
                .filter(Project.id.in_(accessible_project_ids))
                .group_by(Project.id)
                .order_by(Project.created_at.asc())
                .all()
            )

            return {
                'success': True,
                'data': [
                    project.to_dict(
                        task_count=task_count,
                        member_count=member_count,
                        current_user_id=current_user.id,
                    )
                    for project, task_count, member_count in rows
                ],
            }, 200
        except Exception as error:
            print('Error fetching projects:', error)
            return {'success': False, 'message': 'Failed to fetch projects'}, 500

    @staticmethod
    def create_project(current_user, payload):
        try:
            name = (payload.get('name') or '').strip()
            if not name:
                return {'success': False, 'message': 'Project name is required'}, 400

            if Project.query.filter(func.lower(Project.name) == name.lower()).first():
                return {'success': False, 'message': 'Project already exists'}, 400

            project = Project(
                owner_id=current_user.id,
                name=name,
                description=(payload.get('description') or '').strip(),
                color=payload.get('color') or '#6C3BFF',
            )

            db.session.add(project)
            db.session.flush()
            db.session.add(ProjectMember(project_id=project.id, user_id=current_user.id, role='owner'))
            db.session.commit()

            return {'success': True, 'data': project.to_dict(task_count=0, member_count=1, current_user_id=current_user.id)}, 201
        except Exception as error:
            db.session.rollback()
            print('Error creating project:', error)
            return {'success': False, 'message': 'Failed to create project'}, 500

    @staticmethod
    def get_project_members(current_user, project_id):
        try:
            if not _has_project_access(current_user, project_id):
                return {'success': False, 'message': 'Project not found'}, 404

            members = (
                ProjectMember.query
                .filter_by(project_id=project_id)
                .join(User, User.id == ProjectMember.user_id)
                .order_by(ProjectMember.role.desc(), User.username.asc())
                .all()
            )

            return {'success': True, 'data': [member.to_dict() for member in members]}, 200
        except Exception as error:
            print('Error fetching project members:', error)
            return {'success': False, 'message': 'Failed to fetch project members'}, 500

    @staticmethod
    def invite_member(current_user, project_id, payload):
        try:
            if not _is_project_owner(current_user, project_id):
                return {'success': False, 'message': 'Only the project owner can invite members'}, 403

            email = _normalize_email(payload.get('email'))
            role = 'member'

            if not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email):
                return {'success': False, 'message': 'A valid invite email is required'}, 400

            existing_user = User.query.filter(func.lower(User.email) == email).first()
            if existing_user and ProjectMember.query.filter_by(project_id=project_id, user_id=existing_user.id).first():
                return {'success': False, 'message': 'That user is already a project member'}, 400

            existing_invite = ProjectInvite.query.filter_by(
                project_id=project_id,
                email=email,
                status='pending',
            ).first()
            if existing_invite:
                return {'success': True, 'data': existing_invite.to_dict(), 'message': 'Invite already pending'}, 200

            invite = ProjectInvite(
                project_id=project_id,
                email=email,
                role=role,
                invited_by_id=current_user.id,
            )
            db.session.add(invite)
            db.session.commit()

            return {'success': True, 'data': invite.to_dict()}, 201
        except Exception as error:
            db.session.rollback()
            print('Error inviting project member:', error)
            return {'success': False, 'message': 'Failed to invite project member'}, 500

    @staticmethod
    def get_project_invites(current_user, project_id):
        try:
            if not _is_project_owner(current_user, project_id):
                return {'success': False, 'message': 'Only the project owner can view invites'}, 403

            invites = (
                ProjectInvite.query
                .filter_by(project_id=project_id)
                .order_by(ProjectInvite.created_at.desc())
                .all()
            )

            return {'success': True, 'data': [invite.to_dict() for invite in invites]}, 200
        except Exception as error:
            print('Error fetching project invites:', error)
            return {'success': False, 'message': 'Failed to fetch project invites'}, 500

    @staticmethod
    def get_my_invites(current_user):
        try:
            invites = (
                ProjectInvite.query
                .filter(func.lower(ProjectInvite.email) == current_user.email.lower())
                .filter(ProjectInvite.status == 'pending')
                .order_by(ProjectInvite.created_at.desc())
                .all()
            )

            return {'success': True, 'data': [invite.to_dict() for invite in invites]}, 200
        except Exception as error:
            print('Error fetching my project invites:', error)
            return {'success': False, 'message': 'Failed to fetch invites'}, 500

    @staticmethod
    def respond_to_invite(current_user, invite_id, action):
        try:
            invite = ProjectInvite.query.get(invite_id)
            if not invite or invite.status != 'pending' or invite.email.lower() != current_user.email.lower():
                return {'success': False, 'message': 'Invite not found'}, 404

            if action not in ('accept', 'decline'):
                return {'success': False, 'message': 'Invite action must be accept or decline'}, 400

            invite.status = 'accepted' if action == 'accept' else 'declined'
            invite.responded_at = datetime.utcnow()

            if action == 'accept':
                existing_member = ProjectMember.query.filter_by(
                    project_id=invite.project_id,
                    user_id=current_user.id,
                ).first()
                if not existing_member:
                    db.session.add(ProjectMember(project_id=invite.project_id, user_id=current_user.id, role=invite.role))

            db.session.commit()
            return {'success': True, 'data': invite.to_dict()}, 200
        except Exception as error:
            db.session.rollback()
            print('Error responding to invite:', error)
            return {'success': False, 'message': 'Failed to respond to invite'}, 500

    @staticmethod
    def delete_project(current_user, project_id):
        try:
            if not _is_project_owner(current_user, project_id):
                return {'success': False, 'message': 'Only the project owner can delete the project'}, 403

            project = Project.query.get(project_id)
            if not project:
                return {'success': False, 'message': 'Project not found'}, 404

            # Delete all tasks associated with the project to trigger their cascades
            tasks = Task.query.filter_by(project_id=project_id).all()
            for task in tasks:
                db.session.delete(task)
            
            db.session.delete(project)
            db.session.commit()

            return {'success': True, 'message': 'Project deleted successfully'}, 200
        except Exception as error:
            db.session.rollback()
            print('Error deleting project:', error)
            return {'success': False, 'message': 'Failed to delete project'}, 500
