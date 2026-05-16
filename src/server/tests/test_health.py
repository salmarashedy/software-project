def test_health_check(client):
    """Test the health check endpoint returns 200 and healthy status."""
    response = client.get('/api/health')
    
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    assert data['status'] == 'healthy'
    assert 'Task Management API is running' in data['message']
