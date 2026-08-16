import { Router } from 'express';
import { cacheMiddleware } from '../middleware/cache.middleware.js';
import { health, listSports, getSport } from '../controllers/misc.controller.js';

const router = Router();

router.get('/health', health);
router.get('/sports', cacheMiddleware(600), listSports);
router.get('/sports/:code', cacheMiddleware(600), getSport);

export default router;
