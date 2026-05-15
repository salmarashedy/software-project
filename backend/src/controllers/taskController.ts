import type { Request, Response } from 'express';
import pool from '../config/database';
import { getIo } from '../config/socket';

export const getAllTasks = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks ORDER BY created_at DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch task' });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description = '',
      status = 'To Do',
      priority = 'Medium',
      assignee_name = '',
      assignee_avatar = '',
      due_date,
      tags = [],
    } = req.body;

    if (!title) {
      res.status(400).json({ success: false, message: 'Title is required' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, priority, assignee_name, assignee_avatar, due_date, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, description, status, priority, assignee_name, assignee_avatar, due_date || null, tags]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ success: false, message: 'Failed to create task' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      priority,
      assignee_name,
      assignee_avatar,
      due_date,
      tags,
    } = req.body;

    const existing = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const current = existing.rows[0];

    const result = await pool.query(
      `UPDATE tasks
       SET title = $1, description = $2, status = $3, priority = $4,
           assignee_name = $5, assignee_avatar = $6, due_date = $7, tags = $8,
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        title ?? current.title,
        description ?? current.description,
        status ?? current.status,
        priority ?? current.priority,
        assignee_name ?? current.assignee_name,
        assignee_avatar ?? current.assignee_avatar,
        due_date !== undefined ? due_date : current.due_date,
        tags ?? current.tags,
        id,
      ]
    );

    const updated = result.rows[0];
    getIo().emit('task:updated', updated);

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ success: false, message: 'Failed to update task' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);

    getIo().emit('task:deleted', { id: Number(id) });

    res.json({ success: true, message: `Task ${id} deleted successfully` });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ success: false, message: 'Failed to delete task' });
  }
};
