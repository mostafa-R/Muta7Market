import { Router } from 'express';
import { protect, optionalAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { agentProfileSchema, agentClientSchema } from '../validators/profile.validator.js';
import {
  createProfile,
  updateProfile,
  getMyProfile,
  getPublicProfile,
  listPublic,
  addClient,
  removeClient,
} from '../controllers/agent.controller.js';

const router = Router();

router.post('/profile', protect, validate(agentProfileSchema), createProfile);
router.patch('/profile', protect, validate(agentProfileSchema), updateProfile);
router.get('/profile/me', protect, getMyProfile);

router.post('/clients', protect, validate(agentClientSchema), addClient);
router.delete('/clients/:playerId', protect, removeClient);

router.get('/', optionalAuth, listPublic);
router.get('/:agentId', optionalAuth, getPublicProfile);

export default router;
