import pytest

def test_register_user(client, _db):
    """Test user registration."""
    # Register a new user
    response = client.post('/api/auth/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'password123'
    })
    
    assert response.status_code == 201
    data = response.get_json()
    assert data['success'] is True
    assert data['message'] == 'Account created successfully!'

def test_login_user(client, _db):
    """Test user login after registration."""
    # First register the user
    client.post('/api/auth/register', json={
        'username': 'testuser2',
        'email': 'test2@example.com',
        'password': 'password123'
    })
    
    # Then try to login
    response = client.post('/api/auth/login', json={
        'email': 'test2@example.com',
        'password': 'password123'
    })
    
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    assert 'token' in data
    assert data['username'] == 'testuser2'

def test_login_invalid_credentials(client, _db):
    """Test login with wrong password."""
    client.post('/api/auth/register', json={
        'username': 'testuser3',
        'email': 'test3@example.com',
        'password': 'password123'
    })
    
    response = client.post('/api/auth/login', json={
        'email': 'test3@example.com',
        'password': 'wrongpassword'
    })
    
    assert response.status_code == 401
    data = response.get_json()
    assert data['success'] is False
    assert data['error'] == 'Invalid email or password'
