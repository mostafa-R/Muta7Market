import { Router } from 'express';
import {
  changePassword,
  forgotPassword,
  getProfile,
  login,
  logout,
  register,
  resetPassword,
  verifyEmail,
  verifyPhone
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';
import validate from '../middleware/validation.middleware.js';
import * as authValidation from '../validators/auth.validator.js';

const router = Router();

// Public routes
router.post(
  '/register',
  authLimiter,
  validate(authValidation.registerSchema),
  register
);
router.post('/login', authLimiter, validate(authValidation.loginSchema), login);


router.post(
  '/forgot-password',
  authLimiter,
  validate(authValidation.forgotPasswordSchema),
  forgotPassword
);
router.post(
  '/reset-password',
  authLimiter,
  validate(authValidation.resetPasswordSchema),
  resetPassword
);
router.post(
  '/verify-email',
  validate(authValidation.verifyEmailSchema),
  verifyEmail
);

// Protected routes using tokenGuard (Auto Refresh)
router.use(authMiddleware);

router.post('/logout', logout);

router.post(
  '/verify-phone',
  validate(authValidation.verifyPhoneSchema),
  verifyPhone
);

router.post(
  '/change-password',
  validate(authValidation.changePasswordSchema),
  changePassword
);
router.get('/profile', getProfile);

export default router;
