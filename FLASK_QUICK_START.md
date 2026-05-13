# Flask Backend Quick Start Guide

## 🚀 Getting Started

Follow these steps to get your Flask backend running in minutes.

## Step 1: Install Python Dependencies

```bash
# Navigate to the server directory
cd src/server

# Create a Python virtual environment (recommended)
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

# Install all required packages
pip install -r requirements.txt
```

## Step 2: Start the Flask Server

```bash
# Make sure you're in src/server directory with virtual environment activated
python app.py
```

You should see output like:
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
 * Press CTRL+C to quit
```

✅ Your backend is now running at **http://localhost:5000**

## Step 3: Test the API

### Option A: Using a Web Browser
Visit this URL to check if the API is healthy:
```
http://localhost:5000/api/health
```

You should see:
```json
{
  "success": true,
  "status": "healthy",
  "message": "Task Management API is running"
}
```

### Option B: Using cURL (Command Line)
```bash
curl http://localhost:5000/api/health
```

### Option C: Using Postman
1. Download Postman: https://www.postman.com/downloads/
2. Import the Postman collection: `Task_Management_API.postman_collection.json`
3. Run requests directly from Postman

## Step 4: Connect Your Frontend

In your React/TypeScript frontend, use this base URL for API calls:

```typescript
const API_BASE_URL = 'http://localhost:5000/api';

// Example: Create a subtask
fetch(`${API_BASE_URL}/subtasks`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    taskId: 1,
    title: 'My subtask'
  })
})
```

## Available Endpoints

### Subtasks
- `POST /api/subtasks` - Create a subtask
- `GET /api/subtasks/task/<task_id>` - Get all subtasks for a task
- `PUT /api/subtasks/<subtask_id>` - Update subtask status
- `DELETE /api/subtasks/<subtask_id>` - Delete a subtask

### Comments
- `POST /api/comments` - Create a comment
- `GET /api/comments/task/<task_id>` - Get all comments for a task
- `DELETE /api/comments/<comment_id>` - Delete a comment

### Health
- `GET /api/health` - Check API health

## Database

The API automatically creates an SQLite database file:
```
src/server/task_management.db
```

This file stores all your subtasks and comments. It's created automatically when you first run the server.

## Troubleshooting

### "ModuleNotFoundError: No module named 'flask'"
**Solution:** Make sure your virtual environment is activated and dependencies are installed:
```bash
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

### "Address already in use"
**Solution:** Another process is using port 5000. Either:
1. Kill the process using port 5000
2. Or change the port in `app.py` (last line: `app.run(port=5001)`)

### CORS Errors in Frontend
**Solution:** The CORS is already configured in the Flask app to allow all origins. Make sure:
1. Your frontend is calling `http://localhost:5000` (not `http://127.0.0.1:5000`)
2. The Flask server is running

### Database Errors
**Solution:** Delete `task_management.db` and restart the server to recreate the database:
```bash
# Delete the database file
rm src/server/task_management.db  # macOS/Linux
del src\server\task_management.db  # Windows

# Restart the server
python app.py
```

## Next Steps

1. **Read Full API Documentation:**
   Open `FLASK_API_DOCUMENTATION.md` for detailed endpoint documentation

2. **Customize the Backend:**
   - Add more fields to models (in `src/server/models/`)
   - Add validation rules (in `src/server/controllers/`)
   - Add authentication (requires additional setup)

3. **Deploy to Production:**
   - Use a production WSGI server like Gunicorn
   - Configure a production database (PostgreSQL recommended)
   - Set `FLASK_DEBUG=0` for security
   - Configure CORS to allow specific frontend URLs only

## Environment Variables

Create a `.env` file in `src/server/` to customize settings:

```env
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=1

# Database Configuration
DATABASE_URL=sqlite:///task_management.db

# API Configuration
API_PORT=5000
API_HOST=0.0.0.0
```

See `.env.example` for a template.

---

## Need Help?

- **Full API Documentation:** See `FLASK_API_DOCUMENTATION.md`
- **Code Structure:** Check the comments in each file for explanations
- **Common Issues:** See the Troubleshooting section above
