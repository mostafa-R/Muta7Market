import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validate, validateParams } from '../middleware/validate.middleware.js';
import { subscribeSchema, cancelSubscriptionSchema } from '../validators/monetization.validator.js';
import { idParamSchema } from '../validators/misc.validator.js';
import {
  listPlans,
  subscribe,
  getMySubscription,
  listMySubscriptions,
  cancelSubscription,
} from '../controllers/subscription.controller.js';

const router = Router();

router.get('/plans', listPlans);
router.post('/', protect, validate(subscribeSchema), subscribe);
router.get('/me', protect, getMySubscription);
router.get('/history', protect, listMySubscriptions);
router.post('/:id/cancel', protect, validateParams(idParamSchema), validate(cancelSubscriptionSchema), cancelSubscription);

export default router;
