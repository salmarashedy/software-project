import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import pool from './config/database';
import createTables from './config/initDb';
import { setIo } from './config/socket';
import taskRoutes from './routes/taskRoutes';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
});

setIo(io);

app.use(cors());
app.use(express.json());

app.use('/api/tasks', taskRoutes);

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({
      status: 'OK',
      message: 'Backend is Online and Database is Connected! 🚀',
    });
  } catch (error) {
    console.error('Database Connection Error:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Server is running, but the Database is not responding.',
    });
  }
});

io.on('connection', (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

const start = async () => {
  try {
    await createTables();
    server.listen(PORT, () => {
      console.log(`
  --------------------------------------------------
  🚀 DevCollab Backend is running!
  🌐 URL: http://localhost:${PORT}
  🩺 Health Check: http://localhost:${PORT}/api/health
  --------------------------------------------------
  `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
