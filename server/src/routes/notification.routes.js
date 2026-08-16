import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validateParams } from '../middleware/validate.middleware.js';
import { idParamSchema } from '../validators/misc.validator.js';
import {
  listMyNotifications,
  unreadCount,
  markRead,
  markAllRead,
  clearAll,
} from '../controllers/notification.controller.js';

const router = Router();

router.get('/', protect, listMyNotifications);
router.get('/unread-count', protect, unreadCount);
router.post('/read-all', protect, markAllRead);
router.delete('/clear', protect, clearAll);
router.post('/:id/read', protect, validateParams(idParamSchema), markRead);

export default router;
