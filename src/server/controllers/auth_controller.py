from flask import jsonify, request
import bcrypt
from config import db 
from models.user import User
import jwt 
import datetime
import os
from dotenv import load_dotenv
from functools import wraps

load_dotenv()

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'success': False, 'error': 'Token is missing!'}), 401
        try:
            if token.startswith('Bearer '):
                token = token.split(" ")[1]
            data = jwt.decode(token, os.getenv('SECRET_KEY', 'fallback_secret'), algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'success': False, 'error': 'User not found!'}), 401
        except Exception as e:
            return jsonify({'success': False, 'error': 'Token is invalid or expired!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

def register_user():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"success": False, "error": "Missing fields"}), 400

    import re
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if not re.match(email_regex, email):
        return jsonify({"success": False, "error": "Invalid email format"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "error": "User already exists"}), 400

    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    new_user = User(username=username, email=email, password_hash=hashed_pw)
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"success": True, "message": "Account created successfully!"}), 201

def login_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()
    
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
        return jsonify({"success": False, "error": "Invalid email or password"}), 401

    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, os.getenv('SECRET_KEY', 'fallback_secret'), algorithm="HS256")
    return jsonify({"success": True, "token": token, "username": user.username}), 200

def get_user_profile(current_user):
    return jsonify({
        "success": True, 
        "user": {
            "id": current_user.id, 
            "username": current_user.username, 
            "email": current_user.email
        }
    }), 200
