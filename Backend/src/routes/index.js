import { Router } from 'express';
import {initializeEmailService} from '../services/email.service.js';
import adminRoutes from './admin.routes.js';
import authRoutes from './auth.routes.js';
import coachRoutes from './coach.routes.js';
import notificationRoutes from './notification.routes.js';
import offerRoutes from './offer.routes.js';
import playerRoutes from './player.routes.js';
import userRoutes from './user.routes.js';
import entitlementRoutes from './entitlement.routes.js';
import paymentRoutes from './payment.routes.js';
import { PRICING } from '../config/constants.js';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/admin', adminRoutes);
router.use('/players', playerRoutes);
router.use('/coaches', coachRoutes);
router.use('/offers', offerRoutes);
router.use('/notifications', notificationRoutes);
router.use('/payments', paymentRoutes);
router.use('/entitlements', entitlementRoutes);
// Public pricing endpoint for frontend to fetch static prices
router.get('/config/pricing', (req, res) => {
  res.status(200).json({
    success: true,
    data: PRICING,
  });
});

// Test Email Route
router.get('/test-email', async (req, res) => {
  const result = await initializeEmailService.testEmailConnection();
  res.status(result.success ? 200 : 500).json(result);
});

// Test API Route
router.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

export default router;
