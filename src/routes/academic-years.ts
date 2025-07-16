import { Router, RequestHandler } from 'express';
import { authenticateJWT, requireRole } from '../middlewares/auth';
import { listAcademicYears, createAcademicYear } from '../controllers/academicYearController';

const router = Router();

// GET /api/academic-years
router.get('/', authenticateJWT, listAcademicYears as RequestHandler);
// POST /api/academic-years (admin only)
router.post('/', authenticateJWT, requireRole('ADMIN'), createAcademicYear as RequestHandler);

export default router;
