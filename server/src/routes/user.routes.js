import { Router } from 'express';
import Joi from 'joi';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateMeSchema } from '../validators/profile.validator.js';
import { uploadImage, verifyMagicBytes } from '../middleware/upload.middleware.js';
import { getMe, updateMe, setLanguage, uploadAvatar } from '../controllers/user.controller.js';

const router = Router();

const langSchema = Joi.object({ lang: Joi.string().valid('en', 'ar').required() });

router.get('/', protect, getMe);
router.patch('/', protect, validate(updateMeSchema), updateMe);
router.patch('/lang', protect, validate(langSchema), setLanguage);
router.post('/avatar', protect, uploadImage('image'), verifyMagicBytes('image'), uploadAvatar);

export default router;
