import { Router, RequestHandler } from 'express';
import { authenticateJWT, requireRole } from '../middlewares/auth';
import { listSemesters, createSemester } from '../controllers/semesterController';

const router = Router();

// GET /api/semesters
router.get('/', authenticateJWT, listSemesters as RequestHandler);
// POST /api/semesters (admin only)
router.post('/', authenticateJWT, requireRole('ADMIN'), createSemester as RequestHandler);

export default router;
