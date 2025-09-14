import { Router, RequestHandler } from 'express';
import { authenticateJWT } from '../middlewares/auth';
import {
  getAttendanceForClassDate,
  markAttendance,
  updateAttendance,
  getAttendanceStats,
  getAttendanceReports,
} from '../controllers/attendanceController';

const router = Router();

// GET /api/attendance/:classId/:date
router.get('/:classId/:date', authenticateJWT, getAttendanceForClassDate as RequestHandler);
// POST /api/attendance
router.post('/', authenticateJWT, markAttendance as RequestHandler);
// PUT /api/attendance/:id
router.put('/:id', authenticateJWT, updateAttendance as RequestHandler);
// GET /api/attendance/stats/:classId/:period
router.get('/stats/:classId/:period', authenticateJWT, getAttendanceStats as RequestHandler);
// GET /api/attendance/reports
router.get('/reports', authenticateJWT, getAttendanceReports as RequestHandler);

export default router;
