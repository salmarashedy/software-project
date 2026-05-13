# Flask Backend API Documentation

## Overview

This is the Flask backend for the Task Management System with Subtasks and Comments functionality. The API provides RESTful endpoints for managing subtasks and comments associated with tasks.

## Setup Instructions

### 1. Prerequisites
- Python 3.8+
- pip (Python package manager)

### 2. Installation

```bash
# Navigate to the server directory
cd src/server

# Create a virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Running the Server

```bash
# From src/server directory with virtual environment activated
python app.py

# Server will start at http://localhost:5000
```

## Project Structure

```
src/server/
├── app.py                 # Main Flask application file
├── requirements.txt       # Python dependencies
├── .env.example          # Environment configuration example
├── config/
│   ├── __init__.py
│   └── database.py       # SQLAlchemy database configuration
├── models/
│   ├── __init__.py
│   ├── subtask.py        # Subtask database model
│   └── comment.py        # Comment database model
├── controllers/
│   ├── __init__.py
│   ├── subtask_controller.py    # Subtask business logic
│   └── comment_controller.py    # Comment business logic
└── routes/
    ├── __init__.py
    ├── subtask_routes.py   # Subtask API endpoints
    ├── comment_routes.py   # Comment API endpoints
    └── health_routes.py    # Health check endpoint
```

## API Endpoints

### Health Check

#### GET `/api/health`

Check if the API is running and healthy.

**Response (200 OK):**
```json
{
  "success": true,
  "status": "healthy",
  "message": "Task Management API is running"
}
```

---

## Subtask Endpoints

### Create Subtask

#### POST `/api/subtasks`

Create a new subtask for a task.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "taskId": 1,
  "title": "Complete design mockups"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "taskId": 1,
    "title": "Complete design mockups",
    "completed": false,
    "createdAt": "2024-01-15T10:30:00"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Subtask title is required"
}
```

**Error Response (500 Server Error):**
```json
{
  "success": false,
  "error": "Failed to create subtask: [error details]"
}
```

---

### Get All Subtasks for a Task

#### GET `/api/subtasks/task/<task_id>`

Retrieve all subtasks for a specific task.

**Parameters:**
- `task_id` (path parameter, integer): The ID of the parent task

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "taskId": 1,
      "title": "Complete design mockups",
      "completed": false,
      "createdAt": "2024-01-15T10:30:00"
    },
    {
      "id": 2,
      "taskId": 1,
      "title": "Get client approval",
      "completed": true,
      "createdAt": "2024-01-15T11:00:00"
    }
  ]
}
```

**Error Response (500 Server Error):**
```json
{
  "success": false,
  "error": "Failed to retrieve subtasks: [error details]"
}
```

---

### Update Subtask Completion Status

#### PUT `/api/subtasks/<subtask_id>`

Update the completion status of a subtask.

**Parameters:**
- `subtask_id` (path parameter, integer): The ID of the subtask

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "completed": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "taskId": 1,
    "title": "Complete design mockups",
    "completed": true,
    "createdAt": "2024-01-15T10:30:00"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "completed must be a boolean"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Subtask 1 not found"
}
```

**Error Response (500 Server Error):**
```json
{
  "success": false,
  "error": "Failed to update subtask: [error details]"
}
```

---

### Delete Subtask

#### DELETE `/api/subtasks/<subtask_id>`

Delete a subtask.

**Parameters:**
- `subtask_id` (path parameter, integer): The ID of the subtask

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Subtask 1 deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Subtask 1 not found"
}
```

**Error Response (500 Server Error):**
```json
{
  "success": false,
  "error": "Failed to delete subtask: [error details]"
}
```

---

## Comment Endpoints

### Create Comment

#### POST `/api/comments`

Create a new comment on a task.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "taskId": 1,
  "author": "John Doe",
  "text": "This looks great! Just need to make one small adjustment."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "taskId": 1,
    "author": "John Doe",
    "text": "This looks great! Just need to make one small adjustment.",
    "createdAt": "2024-01-15T14:30:00"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Author name is required"
}
```

**Error Response (500 Server Error):**
```json
{
  "success": false,
  "error": "Failed to create comment: [error details]"
}
```

---

### Get All Comments for a Task

#### GET `/api/comments/task/<task_id>`

Retrieve all comments for a specific task.

**Parameters:**
- `task_id` (path parameter, integer): The ID of the parent task

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "taskId": 1,
      "author": "John Doe",
      "text": "This looks great! Just need to make one small adjustment.",
      "createdAt": "2024-01-15T14:30:00"
    },
    {
      "id": 2,
      "taskId": 1,
      "author": "Jane Smith",
      "text": "I agree with John. Let's implement those changes.",
      "createdAt": "2024-01-15T15:00:00"
    }
  ]
}
```

**Error Response (500 Server Error):**
```json
{
  "success": false,
  "error": "Failed to retrieve comments: [error details]"
}
```

---

### Delete Comment

#### DELETE `/api/comments/<comment_id>`

Delete a comment.

**Parameters:**
- `comment_id` (path parameter, integer): The ID of the comment

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Comment 1 deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Comment 1 not found"
}
```

**Error Response (500 Server Error):**
```json
{
  "success": false,
  "error": "Failed to delete comment: [error details]"
}
```

---

## Database Models

### Subtask Model

**Table:** `subtasks`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | Integer | Yes | Primary key, auto-incremented |
| task_id | Integer | Yes | Foreign key to parent task |
| title | String(255) | Yes | Subtask title/description |
| completed | Boolean | Yes | Completion status (default: false) |
| created_at | DateTime | Yes | Timestamp of creation |

### Comment Model

**Table:** `comments`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | Integer | Yes | Primary key, auto-incremented |
| task_id | Integer | Yes | Foreign key to parent task |
| author | String(100) | Yes | Comment author name |
| text | Text | Yes | Comment content |
| created_at | DateTime | Yes | Timestamp of creation |

---

## Error Handling

The API uses standard HTTP status codes:

- `200 OK` - Request successful
- `201 Created` - Resource successfully created
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `405 Method Not Allowed` - Invalid HTTP method
- `500 Internal Server Error` - Server error

All error responses follow this format:
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

---

## CORS Configuration

The API is configured to allow cross-origin requests from any origin. This is suitable for development. For production, update the CORS configuration in `app.py` to specify allowed origins.

---

## Example Frontend Usage (with Fetch API)

### Create a Subtask
```javascript
const createSubtask = async (taskId, title) => {
  const response = await fetch('http://localhost:5000/api/subtasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      taskId: taskId,
      title: title
    })
  });
  const data = await response.json();
  return data;
};
```

### Get Subtasks for a Task
```javascript
const getSubtasks = async (taskId) => {
  const response = await fetch(`http://localhost:5000/api/subtasks/task/${taskId}`);
  const data = await response.json();
  return data.data;
};
```

### Update Subtask Completion Status
```javascript
const updateSubtaskStatus = async (subtaskId, completed) => {
  const response = await fetch(`http://localhost:5000/api/subtasks/${subtaskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      completed: completed
    })
  });
  const data = await response.json();
  return data;
};
```

### Delete a Subtask
```javascript
const deleteSubtask = async (subtaskId) => {
  const response = await fetch(`http://localhost:5000/api/subtasks/${subtaskId}`, {
    method: 'DELETE'
  });
  const data = await response.json();
  return data;
};
```

### Create a Comment
```javascript
const createComment = async (taskId, author, text) => {
  const response = await fetch('http://localhost:5000/api/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      taskId: taskId,
      author: author,
      text: text
    })
  });
  const data = await response.json();
  return data;
};
```

### Get Comments for a Task
```javascript
const getComments = async (taskId) => {
  const response = await fetch(`http://localhost:5000/api/comments/task/${taskId}`);
  const data = await response.json();
  return data.data;
};
```

### Delete a Comment
```javascript
const deleteComment = async (commentId) => {
  const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
    method: 'DELETE'
  });
  const data = await response.json();
  return data;
};
```

---

## Notes

- Database defaults to SQLite (`task_management.db`)
- All timestamps are in UTC ISO 8601 format
- The API runs on `http://localhost:5000` by default
- CORS is enabled for development (allow all origins)
- Debug mode is enabled by default (set `FLASK_DEBUG=0` to disable)
