# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Task API

### 1. Get All Tasks
**Endpoint:** `GET /tasks`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Implement authentication",
      "description": "Add JWT-based authentication",
      "status": "in-progress",
      "priority": "high",
      "dueDate": "2025-01-15T00:00:00.000Z",
      "assignedTo": "John Doe",
      "tags": ["backend", "security"],
      "subtasks": [],
      "comments": [],
      "createdAt": "2025-01-05T10:30:00.000Z",
      "updatedAt": "2025-01-05T10:30:00.000Z"
    }
  ]
}
```

### 2. Get Single Task
**Endpoint:** `GET /tasks/:id`

**Parameters:**
- `id` (string, required) - Task ID

**Response:** Single task object

### 3. Get Tasks by Status
**Endpoint:** `GET /tasks/status/:status`

**Parameters:**
- `status` (string, required) - One of: `todo`, `in-progress`, `completed`

**Response:** Array of tasks with specified status

### 4. Search Tasks
**Endpoint:** `GET /tasks/search?query=keyword`

**Query Parameters:**
- `query` (string, required) - Search keyword

**Response:** Array of matching tasks

### 5. Create Task
**Endpoint:** `POST /tasks`

**Request Body:**
```json
{
  "title": "Implement feature X",
  "description": "Description of the feature",
  "status": "todo",
  "priority": "medium",
  "dueDate": "2025-01-20",
  "assignedTo": "John Doe",
  "tags": ["feature", "frontend"]
}
```

**Required Fields:** `title`

**Response:** Created task object

### 6. Update Task
**Endpoint:** `PUT /tasks/:id`

**Parameters:**
- `id` (string, required) - Task ID

**Request Body:** Any fields to update

**Response:** Updated task object

### 7. Delete Task
**Endpoint:** `DELETE /tasks/:id`

**Parameters:**
- `id` (string, required) - Task ID

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## Subtask API

### 1. Get All Subtasks for a Task
**Endpoint:** `GET /subtasks/task/:taskId`

**Parameters:**
- `taskId` (string, required) - Task ID

**Response:** Array of subtasks

### 2. Get Subtask Statistics
**Endpoint:** `GET /subtasks/stats/:taskId`

**Parameters:**
- `taskId` (string, required) - Task ID

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "completed": 3,
    "pending": 2,
    "progress": 60
  }
}
```

### 3. Get Single Subtask
**Endpoint:** `GET /subtasks/:id`

**Parameters:**
- `id` (string, required) - Subtask ID

**Response:** Single subtask object

### 4. Create Subtask
**Endpoint:** `POST /subtasks`

**Request Body:**
```json
{
  "taskId": "507f1f77bcf86cd799439011",
  "title": "Implement JWT middleware",
  "assignedTo": "Jane Smith",
  "dueDate": "2025-01-10",
  "priority": "high"
}
```

**Required Fields:** `taskId`, `title`

**Response:** Created subtask object

### 5. Update Subtask
**Endpoint:** `PUT /subtasks/:id`

**Parameters:**
- `id` (string, required) - Subtask ID

**Request Body:** Any fields to update

**Response:** Updated subtask object

### 6. Toggle Subtask Completion
**Endpoint:** `PATCH /subtasks/:id/toggle`

**Parameters:**
- `id` (string, required) - Subtask ID

**Response:** Updated subtask object with toggled `completed` status

### 7. Delete Subtask
**Endpoint:** `DELETE /subtasks/:id`

**Parameters:**
- `id` (string, required) - Subtask ID

**Response:**
```json
{
  "success": true,
  "message": "Subtask deleted successfully"
}
```

---

## Comment API

### 1. Get All Comments for a Task
**Endpoint:** `GET /comments/task/:taskId`

**Parameters:**
- `taskId` (string, required) - Task ID

**Response:** Array of comments

### 2. Get Single Comment
**Endpoint:** `GET /comments/:id`

**Parameters:**
- `id` (string, required) - Comment ID

**Response:** Single comment object with replies

### 3. Create Comment
**Endpoint:** `POST /comments`

**Request Body:**
```json
{
  "taskId": "507f1f77bcf86cd799439011",
  "content": "Started working on this task",
  "author": "John Doe",
  "authorId": "user123"
}
```

**Required Fields:** `taskId`, `content`, `author`

**Response:** Created comment object

### 4. Update Comment
**Endpoint:** `PUT /comments/:id`

**Parameters:**
- `id` (string, required) - Comment ID

**Request Body:**
```json
{
  "content": "Updated comment text"
}
```

**Required Fields:** `content`

**Response:** Updated comment object

### 5. Delete Comment
**Endpoint:** `DELETE /comments/:id`

**Parameters:**
- `id` (string, required) - Comment ID

**Response:**
```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

### 6. Add Reply to Comment
**Endpoint:** `POST /comments/:id/replies`

**Parameters:**
- `id` (string, required) - Comment ID

**Request Body:**
```json
{
  "content": "I agree with this comment",
  "author": "Jane Smith",
  "authorId": "user456"
}
```

**Required Fields:** `content`, `author`

**Response:** Updated comment object with new reply

### 7. Delete Reply from Comment
**Endpoint:** `DELETE /comments/:commentId/replies/:replyId`

**Parameters:**
- `commentId` (string, required) - Comment ID
- `replyId` (string, required) - Reply ID

**Response:** Updated comment object with reply removed

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200  | OK - Request successful |
| 201  | Created - Resource created successfully |
| 400  | Bad Request - Invalid input |
| 404  | Not Found - Resource not found |
| 500  | Internal Server Error |

---

## Enums

### Task Status
- `todo` - Task is in the to-do list
- `in-progress` - Task is currently being worked on
- `completed` - Task is completed

### Priority Levels
- `low` - Low priority
- `medium` - Medium priority
- `high` - High priority
