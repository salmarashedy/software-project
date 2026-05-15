import type { Request, Response } from 'express';
import pool from '../config/database';

type CommentRow = {
  id: number;
  task_id: number;
  author: string;
  text: string;
  created_at: Date;
};

const toCommentDto = (row: CommentRow) => ({
  id: row.id,
  taskId: row.task_id,
  author: row.author,
  text: row.text,
  createdAt: row.created_at,
});

export const getCommentsByTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const result = await pool.query<CommentRow>(
      'SELECT * FROM comments WHERE task_id = $1 ORDER BY created_at ASC',
      [taskId]
    );

    res.json({ success: true, data: result.rows.map(toCommentDto) });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch comments' });
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    const { taskId, author, text } = req.body;

    if (
      !taskId ||
      typeof author !== 'string' ||
      !author.trim() ||
      typeof text !== 'string' ||
      !text.trim()
    ) {
      res.status(400).json({ success: false, message: 'taskId, author, and text are required' });
      return;
    }

    const result = await pool.query<CommentRow>(
      `INSERT INTO comments (task_id, author, text)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [taskId, author.trim(), text.trim()]
    );

    res.status(201).json({ success: true, data: toCommentDto(result.rows[0]) });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ success: false, message: 'Failed to create comment' });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM comments WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Comment not found' });
      return;
    }

    res.json({ success: true, message: `Comment ${id} deleted successfully` });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ success: false, message: 'Failed to delete comment' });
  }
};
