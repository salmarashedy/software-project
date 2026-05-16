from flask import Blueprint, jsonify, request

from controllers.auth_controller import token_required
from controllers.task_controller import TaskController

task_bp = Blueprint('tasks', __name__, url_prefix='/api/tasks')


@task_bp.route('', methods=['GET'])
@token_required
def get_tasks(current_user):
    response, status_code = TaskController.get_all_tasks(current_user)
    return jsonify(response), status_code


@task_bp.route('/<int:task_id>', methods=['GET'])
@token_required
def get_task(current_user, task_id):
    response, status_code = TaskController.get_task_by_id(current_user, task_id)
    return jsonify(response), status_code


@task_bp.route('', methods=['POST'])
@token_required
def create_task(current_user):
    response, status_code = TaskController.create_task(current_user, request.get_json(silent=True) or {})
    return jsonify(response), status_code


@task_bp.route('/<int:task_id>', methods=['PUT'])
@token_required
def update_task(current_user, task_id):
    response, status_code = TaskController.update_task(current_user, task_id, request.get_json(silent=True) or {})
    return jsonify(response), status_code


@task_bp.route('/<int:task_id>', methods=['DELETE'])
@token_required
def delete_task(current_user, task_id):
    response, status_code = TaskController.delete_task(current_user, task_id)
    return jsonify(response), status_code
