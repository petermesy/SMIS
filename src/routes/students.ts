import { Router } from 'express';
import { registerNextSemester } from '../controllers/studentController';

const router = Router();

router.post('/register-next', registerNextSemester);

export default router;