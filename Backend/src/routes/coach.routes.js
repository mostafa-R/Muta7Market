import express from 'express';
import {
  createCoach,
  deleteCoach,
  getAllCoaches,
  getCoachById,
  getCoachesByCategory,
  getCoachStats,
  getPromotedCoaches,
  promoteCoach,
  transferCoach,
  updateCoach
} from '../controllers/coach.controller.js';
import { authMiddleware, authorize } from '../middleware/auth.middleware.js';
import validate from '../middleware/validation.middleware.js';
import {
  createCoachSchema,
  updateUserSchema
} from '../validators/coach.validator.js';

const router = express.Router();

// Public Routes (No Token)
router.get('/', getAllCoaches);
router.get('/stats', getCoachStats);
router.get('/promoted', getPromotedCoaches);
router.get('/category/:category', getCoachesByCategory);
router.get('/:id', getCoachById);

// Protected Routes (Token Required + Auto Refresh)
router.use(authMiddleware);

router.post('/', validate(createCoachSchema), createCoach);
router.put('/:id', validate(updateUserSchema), updateCoach);
router.delete('/:id', deleteCoach);

// Role-based Authorization (admin, super_admin, coach)
router.use(authorize('admin', 'super_admin', 'coach'));

router.post('/:id/promote', promoteCoach);
router.post('/transfer/:id', transferCoach);

export default router;
