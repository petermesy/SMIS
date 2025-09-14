import { Router } from 'express';
import { registerNextSemester } from '../controllers/studentController';
import { getRegistrationEligibility } from '../controllers/studentController';

const router = Router();

router.post('/register-next', registerNextSemester);
router.get('/registration-eligibility', getRegistrationEligibility);

export default router;