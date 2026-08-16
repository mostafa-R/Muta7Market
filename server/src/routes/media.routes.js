import { Router } from 'express';
import { protect, optionalAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { mediaUpdateSchema } from '../validators/misc.validator.js';
import { uploadVideo, verifyMagicBytes } from '../middleware/upload.middleware.js';
import { uploadLimiter } from '../middleware/rateLimit.middleware.js';
import {
  uploadHighlight,
  updateMedia,
  deleteMedia,
  getMyMedia,
  getMediaByOwner,
  getMediaMeta,
  streamMedia,
} from '../controllers/media.controller.js';

const router = Router();

router.post('/upload', protect, uploadLimiter, uploadVideo('file'), verifyMagicBytes('video'), uploadHighlight);
router.get('/my', protect, getMyMedia);
router.get('/owner/:ownerType/:ownerId', optionalAuth, getMediaByOwner);
router.get('/stream/:id', optionalAuth, streamMedia);
router.get('/:id', optionalAuth, getMediaMeta);
router.patch('/:id', protect, validate(mediaUpdateSchema), updateMedia);
router.delete('/:id', protect, deleteMedia);

export default router;
