import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validate, validateParams } from '../middleware/validate.middleware.js';
import { messageSchema, createNegotiationSchema } from '../validators/marketplace.validator.js';
import { idParamSchema } from '../validators/misc.validator.js';
import {
  createNegotiation,
  listMyNegotiations,
  getNegotiation,
  listMessages,
  sendMessage,
  closeNegotiation,
} from '../controllers/negotiation.controller.js';

const router = Router();

router.post('/', protect, validate(createNegotiationSchema), createNegotiation);
router.get('/', protect, listMyNegotiations);
router.get('/:id', protect, validateParams(idParamSchema), getNegotiation);
router.get('/:id/messages', protect, validateParams(idParamSchema), listMessages);
router.post('/:id/messages', protect, validateParams(idParamSchema), validate(messageSchema), sendMessage);
router.post('/:id/close', protect, validateParams(idParamSchema), closeNegotiation);

export default router;
