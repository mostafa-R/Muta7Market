import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validate, validateParams } from '../middleware/validate.middleware.js';
import { trialSchema, trialStatusSchema, ratingSchema } from '../validators/verification.validator.js';
import { idParamSchema } from '../validators/misc.validator.js';
import {
  scheduleTrial,
  listTrials,
  updateTrial,
  submitRating,
  listRatings,
  getMyGivenRatings,
} from '../controllers/evaluation.controller.js';

const router = Router();

router.post('/trials', protect, validate(trialSchema), scheduleTrial);
router.get('/trials', protect, listTrials);
router.patch('/trials/:id', protect, validateParams(idParamSchema), validate(trialStatusSchema), updateTrial);

router.post('/ratings', protect, validate(ratingSchema), submitRating);
router.get('/ratings/given', protect, getMyGivenRatings);
router.get('/ratings/user/:userId', protect, listRatings);

export default router;
