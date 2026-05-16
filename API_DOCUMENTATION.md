# Task Management System - REST API Documentation

This document describes the complete REST API for the Flask backend, including authentication, projects, tasks, subtasks, comments, analytics, and AI endpoints.

## Base URL
```
http://localhost:5000/api
```

## Authentication

All endpoints (except `/auth/register`, `/auth/login`, and `/health`) require authentication using a JWT token.

**Headers:**
```json
{
  "Authorization": "Bearer <your_token_here>"
}
```

---

## Health API

### 1. Health Check
**Endpoint:** `GET /health`

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "message": "Task Management API is running"
}
```

---

## Auth API

### 1. Register User
**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### 2. Login User
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### 3. Get Current User Profile
**Endpoint:** `GET /auth/me`

---

## Projects API

### 1. Get All Accessible Projects
**Endpoint:** `GET /projects`

### 2. Create Project
**Endpoint:** `POST /projects`

**Request Body:**
```json
{
  "name": "New Project",
  "description": "Project description",
  "color": "#6C3BFF"
}
```

### 3. Delete Project
**Endpoint:** `DELETE /projects/<project_id>`

### 4. Get Project Members
**Endpoint:** `GET /projects/<project_id>/members`

### 5. Get Project Invites
**Endpoint:** `GET /projects/<project_id>/invites`

### 6. Invite Member to Project
**Endpoint:** `POST /projects/<project_id>/invites`

**Request Body:**
```json
{
  "email": "colleague@example.com"
}
```

### 7. Get My Incoming Invites
**Endpoint:** `GET /projects/invites`

### 8. Respond to Invite
**Endpoint:** `POST /projects/invites/<invite_id>/<action>`
- `<action>` must be either `accept` or `decline`

---

## Tasks API

### 1. Get All Tasks
**Endpoint:** `GET /tasks`

### 2. Get Single Task
**Endpoint:** `GET /tasks/<task_id>`

### 3. Create Task
**Endpoint:** `POST /tasks`

**Request Body:**
```json
{
  "title": "Implement feature X",
  "description": "Description of the feature",
  "status": "To Do",
  "priority": "Medium",
  "assignee_user_id": 1,
  "due_date": "2025-01-20",
  "tags": ["feature", "frontend"],
  "project_id": 1
}
```

### 4. Update Task
**Endpoint:** `PUT /tasks/<task_id>`

**Request Body:** (Include any fields to update)
```json
{
  "status": "In Progress"
}
```

### 5. Delete Task
**Endpoint:** `DELETE /tasks/<task_id>`

---

## Subtasks API

### 1. Get All Subtasks for a Task
**Endpoint:** `GET /subtasks/task/<task_id>`

### 2. Create Subtask
**Endpoint:** `POST /subtasks`

**Request Body:**
```json
{
  "taskId": 1,
  "title": "Implement JWT middleware"
}
```

### 3. Update Subtask
**Endpoint:** `PUT /subtasks/<subtask_id>`

**Request Body:**
```json
{
  "title": "New Title",
  "completed": true
}
```

### 4. Delete Subtask
**Endpoint:** `DELETE /subtasks/<subtask_id>`

---

## Comments API

### 1. Get All Comments for a Task
**Endpoint:** `GET /comments/task/<task_id>`

### 2. Create Comment
**Endpoint:** `POST /comments`

**Request Body:**
```json
{
  "taskId": 1,
  "author": "John Doe",
  "text": "Started working on this task"
}
```

### 3. Delete Comment
**Endpoint:** `DELETE /comments/<comment_id>`

---

## Analytics API

### 1. Get User Analytics Overview
**Endpoint:** `GET /analytics/overview`

---

## AI API

### 1. Suggest Subtasks
**Endpoint:** `POST /ai/suggest-subtasks`

**Request Body:**
```json
{
  "title": "Build Authentication",
  "description": "Implement user login and registration."
}
```

---

## Standard Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```
