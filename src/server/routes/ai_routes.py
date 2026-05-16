from flask import Blueprint
from controllers.ai_controller import refine_description

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/refine', methods=['POST'])
def refine():
    return refine_description()
