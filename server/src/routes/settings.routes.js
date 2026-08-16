import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getPublicConfig, getAppConfig } from '../controllers/settings.controller.js';

const router = Router();

router.get('/public', getPublicConfig);
router.get('/app', protect, getAppConfig);

export default router;