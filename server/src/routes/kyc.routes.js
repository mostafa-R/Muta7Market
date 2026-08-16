import { Router } from 'express';
import { protect, isAdmin } from '../middleware/auth.middleware.js';
import { validate, validateParams } from '../middleware/validate.middleware.js';
import { kycSubmitSchema, kycReviewSchema } from '../validators/verification.validator.js';
import { idParamSchema } from '../validators/misc.validator.js';
import { uploadDocuments, verifyMagicBytes } from '../middleware/upload.middleware.js';
import { uploadLimiter } from '../middleware/rateLimit.middleware.js';
import { submitKyc, getMyKyc, listAllKyc, reviewKyc } from '../controllers/kyc.controller.js';

const router = Router();

router.post('/submit', protect, uploadLimiter, uploadDocuments('files', 5), verifyMagicBytes('document'), validate(kycSubmitSchema), submitKyc);
router.get('/my', protect, getMyKyc);

router.get('/', protect, isAdmin, listAllKyc);
router.post('/:id/review', protect, isAdmin, validateParams(idParamSchema), validate(kycReviewSchema), reviewKyc);

export default router;
