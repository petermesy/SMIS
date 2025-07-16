import { Router, RequestHandler } from 'express';
import { authenticateJWT, requireRole } from '../middlewares/auth';
import { listClasses, getClass, assignTeacherToClass, assignStudentToClass, getStudentsByClass } from '../controllers/classController';

const router = Router();

// GET /api/classes
router.get('/', authenticateJWT, listClasses);
// GET /api/classes/:id
router.get('/:id', authenticateJWT, getClass);

// Assign a teacher to a class (admin only)
router.post('/:classId/assign-teacher', authenticateJWT, requireRole('ADMIN'), assignTeacherToClass);
// Assign a student to a class (admin only)
router.post('/:classId/assign-student', authenticateJWT, requireRole('ADMIN'), assignStudentToClass);
// Get all students in a class (optionally filter by academic year)
router.get('/:classId/students', authenticateJWT, getStudentsByClass);

export default router;
