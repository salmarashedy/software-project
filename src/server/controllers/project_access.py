from config.database import db
from models.comment import Comment
from models.project import Project
from models.project_member import ProjectMember
from models.subtask import Subtask
from models.task import Task


def accessible_project_ids(current_user):
    owned_projects = Project.query.with_entities(Project.id).filter(Project.owner_id == current_user.id)
    member_projects = (
        db.session.query(ProjectMember.project_id)
        .filter(ProjectMember.user_id == current_user.id)
    )
    return {project_id for (project_id,) in owned_projects.union(member_projects).all()}


def task_is_accessible(current_user, task_id):
    task = Task.query.get(task_id)
    if not task or task.project_id is None:
        return False
    return task.project_id in accessible_project_ids(current_user)


def subtask_is_accessible(current_user, subtask_id):
    subtask = Subtask.query.get(subtask_id)
    return bool(subtask and task_is_accessible(current_user, subtask.task_id))


def comment_is_accessible(current_user, comment_id):
    comment = Comment.query.get(comment_id)
    return bool(comment and task_is_accessible(current_user, comment.task_id))
