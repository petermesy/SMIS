import { Router, RequestHandler } from 'express';
import { authenticateJWT, requireRole } from '../middlewares/auth';
import { listExams, createExam } from '../controllers/examController';

const router = Router();

// GET /api/exams
router.get('/', authenticateJWT, listExams as RequestHandler);
// POST /api/exams
router.post('/', authenticateJWT, requireRole('ADMIN'), createExam as RequestHandler);

export default router;
