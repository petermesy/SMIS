import { Router } from 'express';
import { authenticateJWT, requireSuperAdmin } from '../middlewares/auth';
import { listAllAdmins, setUserStatus, changeUserRole } from '../controllers/superAdminController';
import { getAuditLogs } from '../controllers/superAdminController';

const router = Router();

// Only SUPERADMIN can access these routes (requireRole allows SUPERADMIN bypass)
router.get('/admins', authenticateJWT, requireSuperAdmin(), listAllAdmins);
router.post('/users/:userId/status', authenticateJWT, requireSuperAdmin(), setUserStatus);
router.post('/users/:userId/role', authenticateJWT, requireSuperAdmin(), changeUserRole);
router.get('/audit', authenticateJWT, requireSuperAdmin(), getAuditLogs);

export default router;
