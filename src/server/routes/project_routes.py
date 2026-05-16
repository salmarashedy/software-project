from flask import Blueprint, jsonify, request

from controllers.auth_controller import token_required
from controllers.project_controller import ProjectController

project_bp = Blueprint('projects', __name__, url_prefix='/api/projects')


@project_bp.route('', methods=['GET'])
@token_required
def get_projects(current_user):
    response, status_code = ProjectController.get_projects(current_user)
    return jsonify(response), status_code


@project_bp.route('', methods=['POST'])
@token_required
def create_project(current_user):
    response, status_code = ProjectController.create_project(current_user, request.get_json(silent=True) or {})
    return jsonify(response), status_code


@project_bp.route('/invites', methods=['GET'])
@token_required
def get_my_invites(current_user):
    response, status_code = ProjectController.get_my_invites(current_user)
    return jsonify(response), status_code


@project_bp.route('/invites/<int:invite_id>/<action>', methods=['POST'])
@token_required
def respond_to_invite(current_user, invite_id, action):
    response, status_code = ProjectController.respond_to_invite(current_user, invite_id, action)
    return jsonify(response), status_code


@project_bp.route('/<int:project_id>/members', methods=['GET'])
@token_required
def get_project_members(current_user, project_id):
    response, status_code = ProjectController.get_project_members(current_user, project_id)
    return jsonify(response), status_code


@project_bp.route('/<int:project_id>/invites', methods=['GET'])
@token_required
def get_project_invites(current_user, project_id):
    response, status_code = ProjectController.get_project_invites(current_user, project_id)
    return jsonify(response), status_code


@project_bp.route('/<int:project_id>/invites', methods=['POST'])
@token_required
def invite_member(current_user, project_id):
    response, status_code = ProjectController.invite_member(current_user, project_id, request.get_json(silent=True) or {})
    return jsonify(response), status_code


@project_bp.route('/<int:project_id>', methods=['DELETE'])
@token_required
def delete_project(current_user, project_id):
    response, status_code = ProjectController.delete_project(current_user, project_id)
    return jsonify(response), status_code
