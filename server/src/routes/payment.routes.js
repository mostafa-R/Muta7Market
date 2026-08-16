import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validate, validateParams } from '../middleware/validate.middleware.js';
import { subscriptionInvoiceSchema } from '../validators/monetization.validator.js';
import { orderNumberParamSchema } from '../validators/misc.validator.js';
import {
  createInvoice,
  getInvoiceStatus,
  listMyInvoices,
  paymentWebhook,
  simulatePaySuccess,
  isPaymentsEnabled,
} from '../controllers/payment.controller.js';

const router = Router();

router.get('/enabled', isPaymentsEnabled);
router.post('/subscriptions', protect, validate(subscriptionInvoiceSchema), createInvoice);
router.get('/invoices', protect, listMyInvoices);
router.get('/status/:orderNumber', protect, validateParams(orderNumberParamSchema), getInvoiceStatus);
router.post('/webhook', paymentWebhook);
router.post('/simulate/:orderNumber', protect, validateParams(orderNumberParamSchema), simulatePaySuccess);

export default router;