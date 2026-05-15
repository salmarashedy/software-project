import type { Request, Response } from 'express';
import pool from '../config/database';

type SubtaskRow = {
  id: number;
  task_id: number;
  title: string;
  completed: boolean;
  created_at: Date;
};

const toSubtaskDto = (row: SubtaskRow) => ({
  id: row.id,
  taskId: row.task_id,
  title: row.title,
  completed: row.completed,
  createdAt: row.created_at,
});

export const getSubtasksByTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const result = await pool.query<SubtaskRow>(
      'SELECT * FROM subtasks WHERE task_id = $1 ORDER BY created_at ASC',
      [taskId]
    );

    res.json({ success: true, data: result.rows.map(toSubtaskDto) });
  } catch (error) {
    console.error('Error fetching subtasks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subtasks' });
  }
};

export const createSubtask = async (req: Request, res: Response) => {
  try {
    const { taskId, title } = req.body;

    if (!taskId || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ success: false, message: 'taskId and title are required' });
      return;
    }

    const result = await pool.query<SubtaskRow>(
      `INSERT INTO subtasks (task_id, title)
       VALUES ($1, $2)
       RETURNING *`,
      [taskId, title.trim()]
    );

    res.status(201).json({ success: true, data: toSubtaskDto(result.rows[0]) });
  } catch (error) {
    console.error('Error creating subtask:', error);
    res.status(500).json({ success: false, message: 'Failed to create subtask' });
  }
};

export const updateSubtask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    if (typeof completed !== 'boolean') {
      res.status(400).json({ success: false, message: 'completed must be a boolean' });
      return;
    }

    const result = await pool.query<SubtaskRow>(
      `UPDATE subtasks
       SET completed = $1
       WHERE id = $2
       RETURNING *`,
      [completed, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Subtask not found' });
      return;
    }

    res.json({ success: true, data: toSubtaskDto(result.rows[0]) });
  } catch (error) {
    console.error('Error updating subtask:', error);
    res.status(500).json({ success: false, message: 'Failed to update subtask' });
  }
};

export const deleteSubtask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM subtasks WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Subtask not found' });
      return;
    }

    res.json({ success: true, message: `Subtask ${id} deleted successfully` });
  } catch (error) {
    console.error('Error deleting subtask:', error);
    res.status(500).json({ success: false, message: 'Failed to delete subtask' });
  }
};
