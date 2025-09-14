import { Router } from 'express';
import { getClassGrades, getGrades } from '../controllers/gradeController'; // Adjust path

const router = Router();

// Fetch all grades (used by AcademicManagement)
router.get('/grades', getGrades);

// Fetch grades for a specific class (for TeacherClassManagement)
router.get('/grades/class/all', getClassGrades);

export default router;