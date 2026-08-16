import { Router } from 'express';
import Joi from 'joi';
import { protect, optionalAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { playerProfileSchema } from '../validators/profile.validator.js';
import {
  createProfile,
  updateProfile,
  getMyProfile,
  getPublicProfile,
  listPublic,
  toggleVisibility,
  updateContractStatus,
} from '../controllers/player.controller.js';

const router = Router();

const visibilitySchema = Joi.object({ isPublic: Joi.boolean().required() });
const contractStatusSchema = Joi.object({
  contractStatus: Joi.string().valid('freeAgent', 'contracted', 'onLoan').required(),
  currentClub: Joi.string().trim().max(100).allow('', null),
  contractEndDate: Joi.date().min('now').allow(null),
});

router.post('/profile', protect, validate(playerProfileSchema), createProfile);
router.patch('/profile', protect, validate(playerProfileSchema), updateProfile);
router.get('/profile/me', protect, getMyProfile);
router.patch('/profile/visibility', protect, validate(visibilitySchema), toggleVisibility);
router.patch('/profile/contract-status', protect, validate(contractStatusSchema), updateContractStatus);

router.get('/', optionalAuth, listPublic);
router.get('/:playerId', optionalAuth, getPublicProfile);

export default router;
