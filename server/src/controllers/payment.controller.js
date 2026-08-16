import crypto from 'crypto';
import { catchAsync } from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Invoice } from '../models/Invoice.js';
import { config } from '../config/env.js';
import { getPlanByCode } from '../services/subscription.service.js';
import { createSubscriptionInvoice, verifyInvoiceWithPaylink, applyPaidInvoice, isPaymentConfigured } from '../services/payment.service.js';
import { getPagination, paginateMeta } from '../utils/pagination.js';
import { logger } from '../utils/logger.js';

export const createInvoice = catchAsync(async (req, res) => {
  const plan = await getPlanByCode(req.body.planCode);
  if (!plan) throw new ApiError(404, 'subscription.planNotFound');

  const { invoice, paymentUrl, mock } = await createSubscriptionInvoice({
    user: req.user,
    plan,
    period: req.body.period,
    autoRenew: req.body.autoRenew,
    clientMobile: req.body.clientMobile,
    frontendUrl: config.frontendUrl,
  });

  res.status(201).json(
    new ApiResponse(201, req.t('payment.invoiceCreated'), {
      invoiceId: invoice._id,
      orderNumber: invoice.orderNumber,
      amount: invoice.amount,
      currency: invoice.currency,
      status: invoice.status,
      paymentUrl,
      provider: invoice.provider,
      mock,
    })
  );
});

export const getInvoiceStatus = catchAsync(async (req, res) => {
  const invoice = await Invoice.findOne({ orderNumber: req.params.orderNumber, user: req.userId });
  if (!invoice) throw new ApiError(404, 'payment.notFound');

  let verified = null;
  if (invoice.status === 'pending' && invoice.provider === 'paylink') {
    verified = await verifyInvoiceWithPaylink(invoice);
  }

  res.status(200).json(
    new ApiResponse(200, req.t('payment.statusFetched'), {
      id: invoice._id,
      orderNumber: invoice.orderNumber,
      status: invoice.status,
      amount: invoice.amount,
      currency: invoice.currency,
      paidAt: invoice.paidAt,
      paymentUrl: invoice.status === 'pending' ? invoice.paymentUrl : null,
      verified,
    })
  );
});

export const listMyInvoices = catchAsync(async (req, res) => {
  const { page, limit, skip } = await getPagination(req.query);
  const filter = { user: req.userId };
  const total = await Invoice.countDocuments(filter);
  const data = await Invoice.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-paymentErrors')
    .lean();
  res.status(200).json(new ApiResponse(200, req.t('payment.invoicesFetched'), data, paginateMeta(total, page, limit)));
});

export const paymentWebhook = catchAsync(async (req, res) => {
  const expectedAuth = config.paylink.webhookAuth;
  const suppliedAuth = String(req.headers.authorization || '');
  if (!expectedAuth || !safeEqual(suppliedAuth, expectedAuth)) {
    logger.warn('[PAYMENTS] Webhook rejected: bad or missing authorization');
    return res.status(401).json({ success: false, message: 'unauthorized' });
  }

  const payload = req.body || {};
  const transactionNo = String(payload.transactionNo || '');
  const orderNumber = String(payload.merchantOrderNumber || payload.orderNumber || '');
  const orderStatus = String(payload.orderStatus || '').toLowerCase();

  if (!orderNumber && !transactionNo) {
    return res.status(400).json({ success: false, message: 'missing_order_reference' });
  }

  const invoice = await Invoice.findOne({ $or: [{ orderNumber }, { providerTransactionNo: transactionNo }] });
  if (!invoice) {
    logger.warn(`[PAYMENTS] Webhook for unknown invoice order=${orderNumber} txn=${transactionNo}`);
    return res.status(200).json({ success: true, processed: false, reason: 'invoice_not_found' });
  }

  if (invoice.status === 'paid') {
    return res.status(200).json({ success: true, processed: true, alreadyProcessed: true });
  }

  if (orderStatus === 'cancelled' || orderStatus === 'canceled') {
    invoice.status = 'cancelled';
    invoice.cancelledAt = new Date();
    await invoice.save();
    return res.status(200).json({ success: true, processed: true, status: 'cancelled' });
  }

  const verify = await verifyInvoiceWithPaylink(invoice);
  if (verify.error) {
    logger.error(`[PAYMENTS] Webhook verify failed: ${verify.error}`);
    return res.status(502).json({ success: false, message: 'verification_failed' });
  }

  res.status(200).json({ success: true, processed: verify.paid, status: invoice.status });
});

export const simulatePaySuccess = catchAsync(async (req, res) => {
  if (!config.paylink.simulationEnabled) {
    throw new ApiError(404, 'common.notFound', {}, 'Simulation is disabled');
  }
  const invoice = await Invoice.findOne({ orderNumber: req.params.orderNumber, user: req.userId });
  if (!invoice) throw new ApiError(404, 'payment.notFound');
  if (invoice.status === 'paid') {
    return res.status(200).json(new ApiResponse(200, req.t('payment.alreadyPaid'), { status: invoice.status }));
  }
  invoice.provider = 'mock';
  await applyPaidInvoice(invoice);
  res.status(200).json(new ApiResponse(200, req.t('payment.paid'), { orderNumber: invoice.orderNumber, status: invoice.status }));
});

export const listAllInvoices = catchAsync(async (req, res) => {
  const { page, limit, skip } = await getPagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.purpose) filter.purpose = req.query.purpose;
  const total = await Invoice.countDocuments(filter);
  const data = await Invoice.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'email displayName role')
    .lean();
  res.status(200).json(new ApiResponse(200, req.t('payment.invoicesFetched'), data, paginateMeta(total, page, limit)));
});

export const isPaymentsEnabled = catchAsync(async (req, res) => {
  res.status(200).json(new ApiResponse(200, req.t('payment.statusFetched'), {
    configured: isPaymentConfigured(),
    simulationEnabled: config.paylink.simulationEnabled,
    currency: 'SAR',
  }));
});

function safeEqual(a, b) {
  const hash = (v) => crypto.createHash('sha256').update(String(v)).digest();
  return crypto.timingSafeEqual(hash(a), hash(b));
}