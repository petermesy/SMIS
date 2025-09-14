import { Router } from 'express';
import { registerNextSemester, getRegistrationEligibility } from '../controllers/studentController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

router.post('/register-next', registerNextSemester);
router.get('/registration-eligibility', authenticateJWT, getRegistrationEligibility);

export default router;