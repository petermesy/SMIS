import { Router } from 'express';
import { listChildren, linkChild, unlinkChild } from '../controllers/parentController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

// List all children for the current parent
router.get('/children', authenticateJWT, (req, res, next) => { listChildren(req as any, res, next); });

// Link a child to the current parent
router.post('/children/link', authenticateJWT, (req, res, next) => { linkChild(req as any, res, next); });

// Unlink a child from the current parent
router.post('/children/unlink', authenticateJWT, (req, res, next) => { unlinkChild(req as any, res, next); });

export default router;
