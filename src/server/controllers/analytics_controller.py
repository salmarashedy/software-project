from sqlalchemy import func

from config.database import db
from models.project import Project
from models.project_member import ProjectMember
from models.subtask import Subtask
from models.task import Task


def _to_number(value):
    if value is None:
        return 0
    return int(value)


class AnalyticsController:
    @staticmethod
    def get_overview(current_user):
        try:
            owned_projects = Project.query.with_entities(Project.id).filter(Project.owner_id == current_user.id)
            member_projects = (
                db.session.query(ProjectMember.project_id)
                .filter(ProjectMember.user_id == current_user.id)
            )
            accessible_project_ids = {project_id for (project_id,) in owned_projects.union(member_projects).all()}

            if not accessible_project_ids:
                return {
                    'success': True,
                    'data': {
                        'summary': {
                            'totalTasks': 0,
                            'completedTasks': 0,
                            'pendingTasks': 0,
                            'totalSubtasks': 0,
                            'completedSubtasks': 0,
                            'taskCompletionRate': 0,
                            'subtaskCompletionRate': 0,
                            'productivityRate': 0,
                        },
                        'tasksPerUser': [],
                        'tasksPerStatus': [],
                        'completedVsPending': [
                            {'label': 'Completed', 'value': 0},
                            {'label': 'Pending', 'value': 0},
                        ],
                    },
                }, 200

            scoped_tasks = Task.query.filter(Task.project_id.in_(accessible_project_ids))
            scoped_task_ids = scoped_tasks.with_entities(Task.id).subquery()

            total_tasks = scoped_tasks.with_entities(func.count(Task.id)).scalar() or 0
            completed_tasks = (
                scoped_tasks.with_entities(func.count(Task.id))
                .filter(func.lower(Task.status).in_(['done', 'completed']))
                .scalar()
                or 0
            )
            total_subtasks = (
                db.session.query(func.count(Subtask.id))
                .filter(Subtask.task_id.in_(scoped_task_ids))
                .scalar()
                or 0
            )
            completed_subtasks = (
                db.session.query(func.count(Subtask.id))
                .filter(Subtask.task_id.in_(scoped_task_ids))
                .filter(Subtask.completed.is_(True))
                .scalar()
                or 0
            )

            pending_tasks = max(total_tasks - completed_tasks, 0)
            task_completion_rate = round((completed_tasks / total_tasks) * 100) if total_tasks else 0
            subtask_completion_rate = round((completed_subtasks / total_subtasks) * 100) if total_subtasks else 0
            productivity_rate = (
                round((task_completion_rate + subtask_completion_rate) / 2)
                if total_subtasks
                else task_completion_rate
            )

            user_label = func.coalesce(func.nullif(func.trim(Task.assignee_name), ''), 'Unassigned')
            status_label = func.coalesce(func.nullif(func.trim(Task.status), ''), 'To Do')

            user_rows = (
                scoped_tasks.with_entities(user_label.label('label'), func.count(Task.id).label('value'))
                .group_by(user_label)
                .order_by(func.count(Task.id).desc(), user_label.asc())
                .all()
            )

            status_rows = (
                scoped_tasks.with_entities(status_label.label('label'), func.count(Task.id).label('value'))
                .group_by(status_label)
                .order_by(func.count(Task.id).desc(), status_label.asc())
                .all()
            )

            return {
                'success': True,
                'data': {
                    'summary': {
                        'totalTasks': _to_number(total_tasks),
                        'completedTasks': _to_number(completed_tasks),
                        'pendingTasks': _to_number(pending_tasks),
                        'totalSubtasks': _to_number(total_subtasks),
                        'completedSubtasks': _to_number(completed_subtasks),
                        'taskCompletionRate': task_completion_rate,
                        'subtaskCompletionRate': subtask_completion_rate,
                        'productivityRate': productivity_rate,
                    },
                    'tasksPerUser': [
                        {'label': row.label or 'Unassigned', 'value': _to_number(row.value)}
                        for row in user_rows
                    ],
                    'tasksPerStatus': [
                        {'label': row.label or 'To Do', 'value': _to_number(row.value)}
                        for row in status_rows
                    ],
                    'completedVsPending': [
                        {'label': 'Completed', 'value': _to_number(completed_tasks)},
                        {'label': 'Pending', 'value': _to_number(pending_tasks)},
                    ],
                },
            }, 200
        except Exception as error:
            print('Error loading analytics overview:', error)
            return {'success': False, 'message': 'Failed to load analytics overview'}, 500
