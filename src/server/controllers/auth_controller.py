import datetime
import os
import re
from functools import wraps

import jwt
from flask import jsonify, request
from dotenv import load_dotenv
from werkzeug.security import check_password_hash, generate_password_hash

from config import db
from models.project import Project
from models.project_member import ProjectMember
from models.user import User

load_dotenv()

DEFAULT_SECRET = 'dev_fallback_secret_key_change_me_32chars'


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'success': False, 'error': 'Token is missing!'}), 401

        try:
            if token.startswith('Bearer '):
                token = token.split(' ')[1]

            data = jwt.decode(token, os.getenv('SECRET_KEY', DEFAULT_SECRET), algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'success': False, 'error': 'User not found!'}), 401
        except Exception:
            return jsonify({'success': False, 'error': 'Token is invalid or expired!'}), 401

        return f(current_user, *args, **kwargs)

    return decorated


def register_user():
    data = request.get_json(silent=True) or {}
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'success': False, 'error': 'Missing fields'}), 400

    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if not re.match(email_regex, email):
        return jsonify({'success': False, 'error': 'Invalid email format'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'error': 'User already exists'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'success': False, 'error': 'Username already exists'}), 400

    hashed_password = generate_password_hash(password)
    new_user = User(username=username, email=email, password_hash=hashed_password)

    db.session.add(new_user)
    db.session.flush()

    unowned_projects = Project.query.filter(Project.owner_id.is_(None)).all()
    for project in unowned_projects:
        project.owner_id = new_user.id
        db.session.add(ProjectMember(project_id=project.id, user_id=new_user.id, role='owner'))

    db.session.commit()

    return jsonify({'success': True, 'message': 'Account created successfully!'}), 201


def login_user():
    data = request.get_json(silent=True) or {}
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'success': False, 'error': 'Invalid email or password'}), 401

    token = jwt.encode(
        {
            'user_id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24),
        },
        os.getenv('SECRET_KEY', DEFAULT_SECRET),
        algorithm='HS256',
    )
    return jsonify({'success': True, 'token': token, 'username': user.username}), 200

def get_user_profile(current_user):
    return jsonify(
        {
            'success': True,
            'user': {
                'id': current_user.id,
                'username': current_user.username,
                'email': current_user.email,
            },
        }
    ), 200
