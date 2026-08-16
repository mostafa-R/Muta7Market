import { Router } from 'express';
import Joi from 'joi';
import { protect, optionalAuth } from '../middleware/auth.middleware.js';
import { validate, validateParams } from '../middleware/validate.middleware.js';
import { advertisementSchema } from '../validators/monetization.validator.js';
import { idParamSchema } from '../validators/misc.validator.js';
import {
  createAdvertisement,
  updateAdvertisement,
  listMyAdvertisements,
  changeStatus,
  listActive,
  getPlacements,
  recordClick,
} from '../controllers/advertisement.controller.js';

const router = Router();

const adStatusSchema = Joi.object({ status: Joi.string().valid('draft', 'active', 'paused').required() });

router.post('/', protect, validate(advertisementSchema), createAdvertisement);
router.get('/my', protect, listMyAdvertisements);
router.get('/placements', optionalAuth, getPlacements);
router.get('/active', optionalAuth, listActive);
router.patch('/:id', protect, validateParams(idParamSchema), validate(advertisementSchema), updateAdvertisement);
router.patch('/:id/status', protect, validateParams(idParamSchema), validate(adStatusSchema), changeStatus);
router.post('/:id/click', validateParams(idParamSchema), recordClick);

export default router;
