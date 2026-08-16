import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validate, validateParams } from '../middleware/validate.middleware.js';
import { contactRequestSchema, contactRespondSchema } from '../validators/marketplace.validator.js';
import { idParamSchema } from '../validators/misc.validator.js';
import {
  requestContact,
  listReceived,
  listSent,
  respondContact,
  markRead,
} from '../controllers/contact.controller.js';

const router = Router();

router.post('/', protect, validate(contactRequestSchema), requestContact);
router.get('/received', protect, listReceived);
router.get('/sent', protect, listSent);
router.post('/:id/respond', protect, validateParams(idParamSchema), validate(contactRespondSchema), respondContact);
router.post('/:id/read', protect, validateParams(idParamSchema), markRead);

export default router;
