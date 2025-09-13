import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
const { body, param, validationResult } = require('express-validator');
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
} from '../controllers/gradeController';
import { listGrades } from '../controllers/gradeController';

const router = Router();

// GET /api/grades/statistics
router.get('/statistics', authenticateJWT as RequestHandler, getGradeStatistics as RequestHandler);


// GET /api/grades/categories/:subjectId
router.get('/categories/:subjectId', authenticateJWT as RequestHandler, getGradeCategories as RequestHandler);

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


// Middleware to require teacher role
import type { RequestHandler } from 'express';
const requireTeacher: RequestHandler = (req, res, next) => {
  if ((req as any).user?.role !== 'teacher') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

// GET /api/grades/class (for teacher: all grades for class/subject/category/semester)
router.get('/class/all', authenticateJWT as RequestHandler, requireTeacher, getClassGrades as RequestHandler);
// GET /api/grades/levels-with-sections
import { getGradeLevelsWithSections } from '../controllers/gradeController';
router.get('/levels-with-sections', authenticateJWT as RequestHandler, getGradeLevelsWithSections as RequestHandler);

// POST /api/grades
import { addGradeEntry } from '../controllers/gradeController';
router.get('/', listGrades);

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



// Middleware to require teacher role
// GET /api/grades
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
