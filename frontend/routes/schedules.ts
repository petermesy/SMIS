import { Router, RequestHandler } from 'express';
import { authenticateJWT } from '../middlewares/auth';
import {
  getClassSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from '../controllers/scheduleController';

const router = Router();

// GET /api/schedules/:classId
router.get('/:classId', authenticateJWT, getClassSchedule as RequestHandler);
// POST /api/schedules
router.post('/', authenticateJWT, createSchedule as RequestHandler);
// PUT /api/schedules/:id
router.put('/:id', authenticateJWT, updateSchedule as RequestHandler);
// DELETE /api/schedules/:id
router.delete('/:id', authenticateJWT, deleteSchedule as RequestHandler);

export default router;
