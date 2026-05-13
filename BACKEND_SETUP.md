# Backend Setup Guide

## Quick Start

Follow these steps to set up and run the Express backend for your Task Management App.

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn package manager

### Step 1: Install Dependencies

```bash
npm install
```

This will install all the required packages including Express, Mongoose, and other dependencies.

### Step 2: Set Up Environment Variables

1. Create a `.env` file in the project root:

```bash
cp .env.example .env
```

2. Edit the `.env` file and add your configuration:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/taskapp
```

**For MongoDB Atlas (Cloud):**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskapp?retryWrites=true&w=majority
```

### Step 3: Start MongoDB

**Local MongoDB:**
```bash
# On Windows
mongod

# On macOS/Linux
brew services start mongodb-community
```

**MongoDB Atlas:**
- No setup needed, just use your connection string in `.env`

### Step 4: Run the Backend Server

**Development Mode (with auto-reload):**
```bash
npm run server:dev
```

**Production Mode:**
```bash
npm run server
```

The server will start on `http://localhost:5000`

### Step 5: Verify Server is Running

Visit: `http://localhost:5000/api/health`

You should see:
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2025-01-05T10:30:00.000Z"
}
```

## Running Both Frontend and Backend

### Option 1: Two Terminal Windows

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
npm run server:dev
```

### Option 2: Concurrent Process (Install concurrently)

```bash
npm install --save-dev concurrently
```

Update `package.json` scripts:
```json
"scripts": {
  "start": "concurrently \"npm run dev\" \"npm run server:dev\""
}
```

Then run:
```bash
npm start
```

## Testing the API

### Method 1: Postman

1. Import `Task_Management_API.postman_collection.json` into Postman
2. Set the variables (taskId, subtaskId, commentId)
3. Test each endpoint

### Method 2: cURL

```bash
# Get all tasks
curl http://localhost:5000/api/tasks

# Create a task
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Task",
    "description": "Task description",
    "priority": "high"
  }'
```

### Method 3: VS Code REST Client Extension

Create a `requests.http` file:
```http
### Get all tasks
GET http://localhost:5000/api/tasks

### Create a task
POST http://localhost:5000/api/tasks
Content-Type: application/json

{
  "title": "My First Task",
  "description": "Task description",
  "priority": "high"
}
```

## Folder Structure

```
src/server/
├── config/
│   ├── database.js       # MongoDB connection
│   ├── constants.js      # App constants
│   └── middleware.js     # Custom middleware
├── models/
│   ├── Task.js          # Task schema
│   ├── Subtask.js       # Subtask schema
│   └── Comment.js       # Comment schema
├── controllers/
│   ├── taskController.js      # Task business logic
│   ├── subtaskController.js   # Subtask business logic
│   └── commentController.js   # Comment business logic
├── routes/
│   ├── taskRoutes.js         # Task endpoints
│   ├── subtaskRoutes.js      # Subtask endpoints
│   └── commentRoutes.js      # Comment endpoints
└── server.js             # Express app setup
```

## Key Features Implemented

✅ **Tasks Management**
- Create, read, update, delete tasks
- Filter by status (todo, in-progress, completed)
- Search functionality
- Priority levels and due dates

✅ **Subtasks Management**
- Create subtasks linked to tasks
- Track completion status
- View progress statistics
- Priority and assignment tracking

✅ **Comments System**
- Add comments to tasks
- Reply to comments
- Edit and delete comments
- Author tracking

✅ **Database**
- MongoDB with Mongoose ODM
- Proper schema validation
- Relationships between models
- Timestamps on all records

✅ **API Features**
- RESTful API design
- Error handling and validation
- CORS support
- Environment-based configuration

## Common Issues & Solutions

### MongoDB Connection Failed

**Error:** `MongoDB connection failed`

**Solutions:**
1. Ensure MongoDB is running: `mongod` on Windows or `brew services start mongodb-community` on macOS
2. Check MongoDB URI in `.env` file
3. If using MongoDB Atlas, verify:
   - Connection string is correct
   - IP whitelist includes your machine
   - Username and password are correct

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change PORT in .env
PORT=3001
```

### nodemon Not Found

**Error:** `nodemon: command not found`

**Solution:**
```bash
npm install --save-dev nodemon
```

## Next Steps

1. **Connect Frontend to Backend**
   - Update API endpoints in frontend components
   - Set API base URL: `http://localhost:5000/api`

2. **Add Authentication**
   - Implement user authentication
   - Add JWT tokens
   - Secure API endpoints

3. **Database Backups**
   - Set up MongoDB backups
   - Configure database replication

4. **Deployment**
   - Deploy to Heroku, AWS, or DigitalOcean
   - Set up environment variables on server
   - Configure MongoDB Atlas for production

## Useful Commands

```bash
# Install new package
npm install package-name

# Install dev dependency
npm install --save-dev package-name

# Run linter
npm run lint

# View server logs
npm run server:dev

# Reset database (be careful!)
# Connect to MongoDB and run: db.dropDatabase()
```

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [REST API Best Practices](https://restfulapi.net/)

## Support

For issues or questions:
1. Check the error message in the console
2. Review the API_DOCUMENTATION.md
3. Check the src/server/README.md
4. Review Mongoose error documentation

---

Happy coding! 🚀
