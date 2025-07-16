import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../middlewares/auth';
import { getTeacherAssignments } from '../controllers/teacherAssignmentsController';

const router = Router();

// GET /api/teacher-assignments
router.get('/', authenticateJWT, getTeacherAssignments);

export default router;
