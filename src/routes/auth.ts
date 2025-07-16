import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateJWT, AuthRequest } from '../middlewares/auth';
import { config } from '../config';
import { body, validationResult } from 'express-validator';

const router = Router();
const prisma = new PrismaClient();

// Validation middleware for login
const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// POST /api/auth/login
router.post('/login', loginValidation, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.status !== 'ACTIVE') {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
    },
    config.jwtSecret,
    { expiresIn: '8h' }
  );
  res.json({ token });
});

// GET /api/auth/me
router.get('/me', authenticateJWT, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      phone: true,
      address: true,
      status: true,
      createdAt: true,
    },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  // Normalize role to lowercase for frontend compatibility
  res.json({ ...user, role: user.role.toLowerCase() });
});

// PUT /api/auth/profile
router.put('/profile', authenticateJWT, async (req: AuthRequest, res) => {
  const { firstName, lastName, phone, address } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { firstName, lastName, phone, address },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      phone: true,
      address: true,
      status: true,
      createdAt: true,
    },
  });
  res.json(user);
});

// POST /api/auth/logout (dummy for JWT)
router.post('/logout', authenticateJWT, (req, res) => {
  // For JWT, logout is handled client-side (token removal)
  res.json({ message: 'Logged out' });
});

export default router;
