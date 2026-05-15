import { Router } from 'express';
import {
  createComment,
  deleteComment,
  getCommentsByTask,
} from '../controllers/commentController';

const router = Router();

router.get('/task/:taskId', getCommentsByTask);
router.post('/', createComment);
router.delete('/:id', deleteComment);

export default router;
