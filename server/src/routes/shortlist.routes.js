import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validate, validateParams } from '../middleware/validate.middleware.js';
import { shortlistSchema, shortlistMemberSchema } from '../validators/marketplace.validator.js';
import { idParamSchema } from '../validators/misc.validator.js';
import {
  listMyShortlists,
  createShortlist,
  getShortlist,
  updateShortlist,
  deleteShortlist,
  addMember,
  removeMember,
} from '../controllers/shortlist.controller.js';

const router = Router();

router.get('/', protect, listMyShortlists);
router.post('/', protect, validate(shortlistSchema), createShortlist);
router.get('/:id', protect, validateParams(idParamSchema), getShortlist);
router.patch('/:id', protect, validateParams(idParamSchema), validate(shortlistSchema), updateShortlist);
router.delete('/:id', protect, validateParams(idParamSchema), deleteShortlist);
router.post('/:id/members', protect, validateParams(idParamSchema), validate(shortlistMemberSchema), addMember);
router.delete('/:id/members/:playerId', protect, validateParams(idParamSchema), removeMember);

export default router;
