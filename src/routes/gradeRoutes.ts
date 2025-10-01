import { Router } from 'express';
import { getClassGrades, getGrades } from '../controllers/gradeController'; // Adjust path

const router = Router();

// Fetch all grades (used by AcademicManagement) => mounted at /api/grades
router.get('/', getGrades);

// Fetch grades for a specific class (for TeacherClassManagement) => /api/grades/class/all
router.get('/class/all', getClassGrades);

export default router;