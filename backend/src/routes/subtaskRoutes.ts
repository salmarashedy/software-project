import { Router } from 'express';
import {
  createSubtask,
  deleteSubtask,
  getSubtasksByTask,
  updateSubtask,
} from '../controllers/subtaskController';

const router = Router();

router.get('/task/:taskId', getSubtasksByTask);
router.post('/', createSubtask);
router.put('/:id', updateSubtask);
router.delete('/:id', deleteSubtask);

export default router;
