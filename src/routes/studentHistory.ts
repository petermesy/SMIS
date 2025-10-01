import { Router } from 'express';
import { addStudentHistory, getStudentHistory } from '../controllers/studentHistoryController';
const router = Router();

router.post('/', addStudentHistory);
router.get('/:studentId', getStudentHistory);

export default router;
