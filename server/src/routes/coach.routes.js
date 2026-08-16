import { Router } from 'express';
import { protect, optionalAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { coachProfileSchema } from '../validators/profile.validator.js';
import {
  createProfile,
  updateProfile,
  getMyProfile,
  getPublicProfile,
  listPublic,
} from '../controllers/coach.controller.js';

const router = Router();

router.post('/profile', protect, validate(coachProfileSchema), createProfile);
router.patch('/profile', protect, validate(coachProfileSchema), updateProfile);
router.get('/profile/me', protect, getMyProfile);

router.get('/', optionalAuth, listPublic);
router.get('/:coachId', optionalAuth, getPublicProfile);

export default router;
