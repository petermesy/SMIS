import { Router } from 'express';
import { authenticateJWT, requireRole } from '../middlewares/auth';
import { listSemesters, createSemester, updateRegistrationOpen } from '../controllers/semesterController';

const router = Router();

// PATCH /api/semesters/:id/registration (admin only)
router.patch('/:id/registration', authenticateJWT, requireRole('ADMIN'), updateRegistrationOpen);

// GET /api/semesters
router.get('/', authenticateJWT, listSemesters);
// POST /api/semesters (admin only)
router.post('/', authenticateJWT, requireRole('ADMIN'), createSemester);
// router.patch('/:id/registration', authenticateJWT, requireRole('ADMIN'), updateRegistrationOpen);

export default router;
