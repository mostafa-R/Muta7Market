import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { checkEntitlement, getMyEntitlements } from '../controllers/entitlement.controller.js';

const router = Router();

router.use(authMiddleware);
router.get('/me', getMyEntitlements);
router.get('/check', checkEntitlement);

export default router;


