from datetime import date

from config.database import db
from config.socket import socketio
from models.project import Project
from models.project_member import ProjectMember
from models.task import Task
from models.user import User


def _normalize_tags(value):
    if isinstance(value, list):
        return [str(tag).strip() for tag in value if str(tag).strip()]
    return []


def _parse_due_date(value):
    if value in (None, ''):
        return None

    if isinstance(value, date):
        return value

    if isinstance(value, str):
        try:
            return date.fromisoformat(value)
        except ValueError:
            return None

    return None


def _accessible_project_ids(current_user):
    owned_projects = Project.query.with_entities(Project.id).filter(Project.owner_id == current_user.id)
    member_projects = (
        db.session.query(ProjectMember.project_id)
        .filter(ProjectMember.user_id == current_user.id)
    )
    return {project_id for (project_id,) in owned_projects.union(member_projects).all()}


def _default_project_id(current_user):
    accessible_project_ids = sorted(_accessible_project_ids(current_user))
    return accessible_project_ids[0] if accessible_project_ids else None


def _parse_project_id(value):
    if value in (None, ''):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _task_is_accessible(task, current_user):
    if not task:
        return False
    if task.project_id is None:
        return False
    return task.project_id in _accessible_project_ids(current_user)


def _parse_assignee_user_id(value):
    if value in (None, ''):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _resolve_assignee(project_id, assignee_user_id):
    if assignee_user_id is None:
        return None, None

    membership = ProjectMember.query.filter_by(project_id=project_id, user_id=assignee_user_id).first()
    if not membership:
        return None, ({'success': False, 'message': 'Assignee must be a member of the project'}, 400)

    user = User.query.get(assignee_user_id)
    if not user:
        return None, ({'success': False, 'message': 'Assignee not found'}, 404)

    return user, None


class TaskController:
    @staticmethod
    def get_all_tasks(current_user):
        try:
            accessible_project_ids = _accessible_project_ids(current_user)
            if not accessible_project_ids:
                return {'success': True, 'data': []}, 200

            tasks = (
                Task.query
                .filter(Task.project_id.in_(accessible_project_ids))
                .order_by(Task.created_at.desc())
                .all()
            )
            return {'success': True, 'data': [task.to_dict() for task in tasks]}, 200
        except Exception as error:
            print('Error fetching tasks:', error)
            return {'success': False, 'message': 'Failed to fetch tasks'}, 500

    @staticmethod
    def get_task_by_id(current_user, task_id):
        try:
            task = Task.query.get(task_id)
            if not _task_is_accessible(task, current_user):
                return {'success': False, 'message': 'Task not found'}, 404

            return {'success': True, 'data': task.to_dict()}, 200
        except Exception as error:
            print('Error fetching task:', error)
            return {'success': False, 'message': 'Failed to fetch task'}, 500

    @staticmethod
    def create_task(current_user, payload):
        try:
            title = (payload.get('title') or '').strip()
            if not title:
                return {'success': False, 'message': 'Title is required'}, 400

            project_id = _parse_project_id(payload.get('project_id')) or _default_project_id(current_user)
            if project_id is None:
                return {'success': False, 'message': 'No accessible project available'}, 400
            if project_id not in _accessible_project_ids(current_user):
                return {'success': False, 'message': 'You do not have access to that project'}, 403

            assignee_user_id = _parse_assignee_user_id(payload.get('assignee_user_id'))
            assignee, error = _resolve_assignee(project_id, assignee_user_id)
            if error:
                return error

            task = Task(
                project_id=project_id,
                title=title,
                description=(payload.get('description') or '').strip(),
                status=payload.get('status') or 'To Do',
                priority=payload.get('priority') or 'Medium',
                assignee_user_id=assignee.id if assignee else None,
                assignee_name=assignee.username if assignee else '',
                assignee_avatar=(payload.get('assignee_avatar') or '').strip(),
                due_date=_parse_due_date(payload.get('due_date')),
                tags=_normalize_tags(payload.get('tags')),
            )

            db.session.add(task)
            db.session.commit()

            socketio.emit('task:created', task.to_dict())
            return {'success': True, 'data': task.to_dict()}, 201
        except Exception as error:
            db.session.rollback()
            print('Error creating task:', error)
            return {'success': False, 'message': 'Failed to create task'}, 500

    @staticmethod
    def update_task(current_user, task_id, payload):
        try:
            task = Task.query.get(task_id)
            if not _task_is_accessible(task, current_user):
                return {'success': False, 'message': 'Task not found'}, 404

            if 'title' in payload and payload.get('title') is not None:
                task.title = payload.get('title').strip() if isinstance(payload.get('title'), str) else task.title
            if 'description' in payload:
                task.description = (payload.get('description') or '').strip()
            if 'project_id' in payload:
                next_project_id = _parse_project_id(payload.get('project_id')) or _default_project_id(current_user)
                if next_project_id is None:
                    return {'success': False, 'message': 'No accessible project available'}, 400
                if next_project_id not in _accessible_project_ids(current_user):
                    return {'success': False, 'message': 'You do not have access to that project'}, 403
                task.project_id = next_project_id
                if task.assignee_user_id:
                    assignee, error = _resolve_assignee(next_project_id, task.assignee_user_id)
                    if error:
                        task.assignee_user_id = None
                        task.assignee_name = ''
                        task.assignee_avatar = ''
            if 'status' in payload and payload.get('status') is not None:
                task.status = payload.get('status')
            if 'priority' in payload and payload.get('priority') is not None:
                task.priority = payload.get('priority')
            if 'assignee_user_id' in payload:
                assignee_user_id = _parse_assignee_user_id(payload.get('assignee_user_id'))
                assignee, error = _resolve_assignee(task.project_id, assignee_user_id)
                if error:
                    return error
                task.assignee_user_id = assignee.id if assignee else None
                task.assignee_name = assignee.username if assignee else ''
            if 'assignee_avatar' in payload and payload.get('assignee_avatar') is not None:
                task.assignee_avatar = (payload.get('assignee_avatar') or '').strip()
            if 'due_date' in payload:
                task.due_date = _parse_due_date(payload.get('due_date'))
            if 'tags' in payload and payload.get('tags') is not None:
                task.tags = _normalize_tags(payload.get('tags'))

            db.session.commit()

            updated = task.to_dict()
            socketio.emit('task:updated', updated)
            return {'success': True, 'data': updated}, 200
        except Exception as error:
            db.session.rollback()
            print('Error updating task:', error)
            return {'success': False, 'message': 'Failed to update task'}, 500

    @staticmethod
    def delete_task(current_user, task_id):
        try:
            task = Task.query.get(task_id)
            if not _task_is_accessible(task, current_user):
                return {'success': False, 'message': 'Task not found'}, 404

            db.session.delete(task)
            db.session.commit()

            socketio.emit('task:deleted', {'id': int(task_id)})
            return {'success': True, 'message': f'Task {task_id} deleted successfully'}, 200
        except Exception as error:
            db.session.rollback()
            print('Error deleting task:', error)
            return {'success': False, 'message': 'Failed to delete task'}, 500
