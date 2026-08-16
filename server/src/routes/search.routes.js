import { Router } from 'express';
import { protect, optionalAuth } from '../middleware/auth.middleware.js';
import { validate, validateQuery } from '../middleware/validate.middleware.js';
import { searchPlayersSchema, searchCoachesSchema } from '../validators/marketplace.validator.js';
import { searchLimiter } from '../middleware/rateLimit.middleware.js';
import { searchPlayersAdvanced, searchCoachesAdvanced } from '../controllers/search.controller.js';

const router = Router();

router.get('/players', optionalAuth, searchLimiter, validateQuery(searchPlayersSchema), searchPlayersAdvanced);
router.get('/coaches', optionalAuth, searchLimiter, validateQuery(searchCoachesSchema), searchCoachesAdvanced);

export default router;
