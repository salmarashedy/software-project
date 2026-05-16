from flask import Blueprint, jsonify

from controllers.auth_controller import token_required
from controllers.analytics_controller import AnalyticsController

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')


@analytics_bp.route('/overview', methods=['GET'])
@token_required
def get_overview(current_user):
    response, status_code = AnalyticsController.get_overview(current_user)
    return jsonify(response), status_code
