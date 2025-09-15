import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { authenticateJWT, AuthRequest } from '../middlewares/auth';
import {
  getGradeCategories,
  createGradeCategory,
  getStudentGrades,
  updateGrade,
  getGradeStatistics,
  listAllGrades,
  getClassGrades,
  deleteGrade,
  addGradeEntry,
  getGradeLevelsWithSections,
  listGrades
} from '../controllers/gradeController';
const { body, param, validationResult } = require('express-validator');

const router = Router();

// --- Move this to the top, before any use ---
const requireTeacher: RequestHandler = (req, res, next) => {
  if ((req as any).user?.role !== 'teacher') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};
// --------------------------------------------

// GET /api/grades/statistics
router.get('/statistics', authenticateJWT as RequestHandler, getGradeStatistics as RequestHandler);
router.get('/levels', authenticateJWT as RequestHandler, listGrades as RequestHandler);
router.get('/', authenticateJWT as RequestHandler, listAllGrades as RequestHandler);
// GET /api/grades/categories/:subjectId
router.get('/categories/:subjectId', authenticateJWT as RequestHandler, getGradeCategories as RequestHandler);
// Only allow authenticated teachers to access class grades
router.get('/class', authenticateJWT as RequestHandler, requireTeacher, getClassGrades as RequestHandler);

// POST /api/grades/categories
router.post(
  '/categories',
  [
    authenticateJWT as RequestHandler,
    body('name').isString().notEmpty(),
    body('weight').isNumeric(),
    body('classId').isString().notEmpty(),
    body('subjectId').isString().notEmpty(),
    validationErrorHandler,
    createGradeCategory as RequestHandler
  ]
);

// GET /api/grades/:studentId/:subjectId
router.get('/:studentId/:subjectId', authenticateJWT as RequestHandler, getStudentGrades as RequestHandler);
// POST /api/grades
router.post(
  '/',
  [
    authenticateJWT as RequestHandler,
    body('studentId').isString().notEmpty(),
    body('subjectId').isString().notEmpty(),
    body('categoryId').isString().notEmpty(),
    body('pointsEarned').isNumeric(),
    body('totalPoints').isNumeric(),
    body('date').isISO8601(),
    body('semesterId').isString().notEmpty(),
    body('academicYearId').isString().notEmpty(),
    body('createdBy').isString().notEmpty(),
    validationErrorHandler,
    addGradeEntry as RequestHandler
  ]
);

// PUT /api/grades/:id
router.put(
  '/:id',
  [
    authenticateJWT as RequestHandler,
    param('id').isString().notEmpty(),
    body('pointsEarned').optional().isNumeric(),
    body('totalPoints').optional().isNumeric(),
    validationErrorHandler,
    updateGrade as RequestHandler
  ]
);

// DELETE /api/grades/:id
router.delete(
  '/:id',
  [
    authenticateJWT as RequestHandler,
    param('id').isString().notEmpty(),
    validationErrorHandler,
    deleteGrade as RequestHandler
  ]
);

// GET /api/grades (list all grades)
router.get('/', authenticateJWT as RequestHandler, listAllGrades as RequestHandler);

// Validation error handler middleware
function validationErrorHandler(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
}

// GET /api/grades/reports/:studentId/:semesterId
// TODO: Implement getGradeReport in gradeController and add here if needed.

export default router;