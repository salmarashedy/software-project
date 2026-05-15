import type { Request, Response } from 'express';
import pool from '../config/database';

type CountRow = {
  label: string | null;
  value: string;
};

type SummaryRow = {
  total_tasks: string;
  completed_tasks: string;
  total_subtasks: string;
  completed_subtasks: string;
};

const toNumber = (value: string | number | null | undefined) => Number(value ?? 0);

export const getAnalyticsOverview = async (_req: Request, res: Response) => {
  try {
    const [summaryResult, userResult, statusResult] = await Promise.all([
      pool.query<SummaryRow>(`
        SELECT
          COUNT(DISTINCT t.id) AS total_tasks,
          COUNT(DISTINCT t.id) FILTER (WHERE LOWER(t.status) IN ('done', 'completed')) AS completed_tasks,
          COUNT(s.id) AS total_subtasks,
          COUNT(s.id) FILTER (WHERE s.completed = TRUE) AS completed_subtasks
        FROM tasks t
        LEFT JOIN subtasks s ON s.task_id = t.id;
      `),
      pool.query<CountRow>(`
        SELECT
          COALESCE(NULLIF(TRIM(assignee_name), ''), 'Unassigned') AS label,
          COUNT(*) AS value
        FROM tasks
        GROUP BY label
        ORDER BY value DESC, label ASC;
      `),
      pool.query<CountRow>(`
        SELECT
          COALESCE(NULLIF(TRIM(status), ''), 'To Do') AS label,
          COUNT(*) AS value
        FROM tasks
        GROUP BY label
        ORDER BY value DESC, label ASC;
      `),
    ]);

    const summary = summaryResult.rows[0];
    const totalTasks = toNumber(summary.total_tasks);
    const completedTasks = toNumber(summary.completed_tasks);
    const pendingTasks = Math.max(totalTasks - completedTasks, 0);
    const totalSubtasks = toNumber(summary.total_subtasks);
    const completedSubtasks = toNumber(summary.completed_subtasks);
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const subtaskCompletionRate = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
    const productivityRate =
      totalSubtasks > 0
        ? Math.round((taskCompletionRate + subtaskCompletionRate) / 2)
        : taskCompletionRate;

    res.json({
      success: true,
      data: {
        summary: {
          totalTasks,
          completedTasks,
          pendingTasks,
          totalSubtasks,
          completedSubtasks,
          taskCompletionRate,
          subtaskCompletionRate,
          productivityRate,
        },
        tasksPerUser: userResult.rows.map((row) => ({
          label: row.label || 'Unassigned',
          value: toNumber(row.value),
        })),
        tasksPerStatus: statusResult.rows.map((row) => ({
          label: row.label || 'To Do',
          value: toNumber(row.value),
        })),
        completedVsPending: [
          { label: 'Completed', value: completedTasks },
          { label: 'Pending', value: pendingTasks },
        ],
      },
    });
  } catch (error) {
    console.error('Error loading analytics overview:', error);
    res.status(500).json({ success: false, message: 'Failed to load analytics overview' });
  }
};
