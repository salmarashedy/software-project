from flask import jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from config import db  # Use existing DB
from models.user import User
import jwt 
import datetime
import os
from dotenv import load_dotenv
from functools import wraps

load_dotenv()

def register_user():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"success": False, "error": "Missing required fields"}), 400

    if User.query.filter_by(email=email).first() or User.query.filter_by(username=username).first():
        return jsonify({"success": False, "error": "User already exists"}), 400

    hashed_pw = generate_password_hash(password, method='pbkdf2:sha256')
    new_user = User(username=username, email=email, password_hash=hashed_pw)
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"success": True, "message": "User registered successfully!"}), 201

def login_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password_hash, password):
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, os.getenv('SECRET_KEY', 'fallback_secret'), algorithm="HS256")

        return jsonify({"success": True, "token": token, "username": user.username}), 200

    return jsonify({"success": False, "error": "Invalid email or password"}), 401
from functools import wraps # Add this to the very top of your imports

# --- THE SECURITY GUARD (Middleware) ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization') # Get token from header

        if not token:
            return jsonify({'success': False, 'error': 'Token is missing!'}), 401
        
        try:
            # Remove 'Bearer ' from the token if it exists
            if token.startswith('Bearer '):
                token = token.split(" ")[1]
            
            # Decode the token
            data = jwt.decode(token, os.getenv('SECRET_KEY', 'fallback_secret'), algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            
            if not current_user:
                return jsonify({'success': False, 'error': 'User not found!'}), 401
        except Exception as e:
            return jsonify({'success': False, 'error': 'Token is invalid or expired!'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

# --- THE "ME" ENDPOINT ---
def get_me():
    pass

def get_user_profile(current_user):
    return jsonify({
        "success": True,
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email
        }
    }), 200
