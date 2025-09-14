import { Router, RequestHandler } from 'express';
import { authenticateJWT, requireRole } from '../middlewares/auth';
import { listSubjects, createSubject } from '../controllers/subjectController';

const router = Router();

// GET /api/subjects
router.get('/', authenticateJWT, listSubjects as RequestHandler);
// POST /api/subjects
router.post('/', authenticateJWT, requireRole('ADMIN'), createSubject as RequestHandler);

export default router;
