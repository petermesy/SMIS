import { Router } from 'express';
import { createClassSection } from '../controllers/classSectionController';

const router = Router();

router.post('/', createClassSection);

export default router;