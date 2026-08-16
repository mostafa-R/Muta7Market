import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validate, validateParams } from '../middleware/validate.middleware.js';
import { offerSchema, offerRespondSchema } from '../validators/marketplace.validator.js';
import { idParamSchema } from '../validators/misc.validator.js';
import {
  createOffer,
  listMyOffers,
  getOffer,
  respondOffer,
  withdrawOffer,
} from '../controllers/offer.controller.js';

const router = Router();

router.post('/', protect, validate(offerSchema), createOffer);
router.get('/', protect, listMyOffers);
router.get('/:id', protect, validateParams(idParamSchema), getOffer);
router.post('/:id/respond', protect, validateParams(idParamSchema), validate(offerRespondSchema), respondOffer);
router.post('/:id/withdraw', protect, validateParams(idParamSchema), withdrawOffer);

export default router;
