import { Router } from 'express';
import { authenticateJWT, requireRole } from '../middlewares/auth';
import {
  submitRegistrationRequest,
  listRegistrationRequests,
  approveRegistrationRequest,
  rejectRegistrationRequest
} from '../controllers/studentRegistrationController';

const router = Router();

router.post('/', authenticateJWT, submitRegistrationRequest); // student
router.get('/', authenticateJWT, requireRole('ADMIN'), listRegistrationRequests); // admin
router.post('/:requestId/approve', authenticateJWT, requireRole('ADMIN'), approveRegistrationRequest); // admin
router.post('/:requestId/reject', authenticateJWT, requireRole('ADMIN'), rejectRegistrationRequest); // admin

export default router;