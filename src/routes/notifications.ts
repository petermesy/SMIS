import { Router } from 'express';
import { getNotifications, markNotificationRead, deleteNotification } from '../controllers/notificationController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

// Get all notifications for the current user
router.get('/', authenticateJWT, (req, res, next) => {
  void getNotifications(req as any, res, next);
});

// Mark a notification as read
router.patch('/:id/read', authenticateJWT, (req, res, next) => {
  void markNotificationRead(req as any, res, next);
});

// Delete a notification
router.delete('/:id', authenticateJWT, (req, res, next) => {
  void deleteNotification(req as any, res, next);
});

export default router;
