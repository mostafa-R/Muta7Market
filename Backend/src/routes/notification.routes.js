import express from 'express';
import {
  sendNotification,
  getUserNotifications,
  markAsRead,
  getUnreadCount,
  sendBulkNotifications,
  createTemplate,
  getAllTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  getNotificationAnalytics
} from '../controllers/notification.controller.js';
import {
  authMiddleware,
  authorize,
  verifiedOnly
} from '../middleware/auth.middleware.js';

const router = express.Router();

// Notification operations
router.post(
  '/send',
  authMiddleware,
  verifiedOnly,
  authorize('admin', 'moderator'),
  sendNotification
);
router.post('/bulk', authMiddleware, authorize('admin'), sendBulkNotifications);

// User notifications
router.get('/my', authMiddleware, getUserNotifications);
router.patch('/read', authMiddleware, markAsRead);
router.get('/unread-count', authMiddleware, getUnreadCount);

// Template management
router.post(
  '/templates',
  authMiddleware,
  authorize('admin', 'moderator'),
  createTemplate
);
router.get(
  '/templates',
  authMiddleware,
  authorize('admin', 'moderator'),
  getAllTemplates
);
router.get(
  '/templates/:id',
  authMiddleware,
  authorize('admin', 'moderator'),
  getTemplateById
);
router.put(
  '/templates/:id',
  authMiddleware,
  authorize('admin', 'moderator'),
  updateTemplate
);
router.delete(
  '/templates/:id',
  authMiddleware,
  authorize('admin'),
  deleteTemplate
);

// Analytics
router.get(
  '/analytics',
  authMiddleware,
  authorize('admin', 'moderator'),
  getNotificationAnalytics
);

export default router;
