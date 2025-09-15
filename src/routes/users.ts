
import { Router, RequestHandler } from 'express';
import multer from 'multer';
import { authenticateJWT, requireRole, AuthRequest } from '../middlewares/auth';
import { body, validationResult } from 'express-validator';
import {
  listUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  changePassword,
} from '../controllers/userController';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// POST /api/users/import-students - Bulk import students via CSV
router.post(
  '/import-students',
  authenticateJWT,
  requireRole('ADMIN'),
  upload.single('file'),
  require('../controllers/userController').importStudents as RequestHandler
);

// POST /api/users/change-password - Change password for logged-in user
router.post(
  '/change-password',
  authenticateJWT,
  body('oldPassword').isString().notEmpty(),
  body('newPassword').isLength({ min: 6 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  changePassword as RequestHandler
);


// Validation middleware
const userValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).optional(),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('role').isIn(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']).withMessage('Valid role is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// GET /api/users - List all users (admin only)
router.get(
  '/',
  authenticateJWT,
  requireRole('ADMIN'),
  listUsers as RequestHandler
);

// POST /api/users - Create new user (admin only)
router.post(
  '/',
  authenticateJWT,
  requireRole('ADMIN'),
  userValidation,
  createUser as RequestHandler
);

// GET /api/users/:id - Get user details (admin only)
router.get(
  '/:id',
  authenticateJWT,
  requireRole('ADMIN'),
  getUser as RequestHandler
);

// PUT /api/users/:id - Update user (admin only)
router.put(
  '/:id',
  authenticateJWT,
  requireRole('ADMIN'),
  updateUser as RequestHandler
);

// DELETE /api/users/:id - Delete user (admin only)
router.delete(
  '/:id',
  authenticateJWT,
  requireRole('ADMIN'),
  deleteUser as RequestHandler
);

export default router;
