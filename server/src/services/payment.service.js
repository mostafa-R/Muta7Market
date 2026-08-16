import crypto from 'crypto';
import { config } from '../config/env.js';
import { Invoice } from '../models/Invoice.js';
import { Subscription } from '../models/Subscription.js';
import { SUBSCRIPTION_PERIOD, SUBSCRIPTION_STATUS } from '../config/constants.js';
import { paylinkCreateInvoice, paylinkGetInvoice, isPaylinkConfigured } from './paylink.client.js';
import { createNotification } from './notification.service.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export function generateOrderNumber() {
  return `MM-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export function isPaymentConfigured() {
  return isPaylinkConfigured();
}

export function amountMatchesInvoice(verify, invoice) {
  const verified = Number(verify?.amount);
  if (!Number.isFinite(verified)) return false;
  return Math.abs(verified - invoice.amount) < 0.01;
}

export async function createSubscriptionInvoice({ user, plan, period, autoRenew, clientMobile, frontendUrl }) {
  const active = await Subscription.findOne({
    user: user._id,
    status: SUBSCRIPTION_STATUS.ACTIVE,
    endDate: { $gte: new Date() },
  });
  if (active) throw new ApiError(409, 'subscription.alreadyActive', {}, 'You already have an active subscription');

  const subPeriod = period === SUBSCRIPTION_PERIOD.YEARLY ? SUBSCRIPTION_PERIOD.YEARLY : SUBSCRIPTION_PERIOD.MONTHLY;
  const amount = subPeriod === SUBSCRIPTION_PERIOD.YEARLY ? plan.priceYearly : plan.priceMonthly;
  const currency = plan.currency || 'SAR';
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const invoice = await Invoice.create({
    orderNumber: generateOrderNumber(),
    user: user._id,
    purpose: 'subscription',
    status: 'pending',
    amount,
    currency,
    provider: isPaylinkConfigured() ? 'paylink' : 'mock',
    expiresAt,
    metadata: {
      planId: plan._id,
      planCode: plan.code,
      planName: plan.name,
      period: subPeriod,
      autoRenew: Boolean(autoRenew),
    },
  });

  if (!isPaylinkConfigured()) {
    logger.warn(`[PAYMENTS] Paylink not configured — invoice ${invoice.orderNumber} created in mock mode (dev only)`);
    return { invoice, paymentUrl: null, mock: true };
  }

  const base = (frontendUrl || config.frontendUrl || 'http://localhost:3000').replace(/\/$/, '');
  const payload = {
    orderNumber: invoice.orderNumber,
    amount,
    currency,
    clientName: user.displayName || user.email,
    clientEmail: user.email,
    clientMobile: clientMobile || '',
    products: [{ title: `${plan.name.en} (${subPeriod})`, price: amount, qty: 1, isDigital: true }],
    supportedCardBrands: ['mada', 'visaMastercard', 'stcpay', 'urpay'],
    callBackUrl: `${base}/payments/result?orderNumber=${invoice.orderNumber}`,
    cancelUrl: `${base}/payments/result?orderNumber=${invoice.orderNumber}&status=cancelled`,
    note: `purpose=subscription;plan=${plan.code};period=${subPeriod}`,
    displayPending: false,
  };

  const data = await paylinkCreateInvoice(payload);
  invoice.providerTransactionNo = String(data.transactionNo || '');
  invoice.providerInvoiceId = String(data.transactionNo || '');
  invoice.paymentUrl = data.url || null;
  if (data.paymentErrors?.length) {
    invoice.paymentErrors = data.paymentErrors.map((e) => ({
      code: String(e.errorCode || e.code || ''),
      title: String(e.errorTitle || e.title || ''),
      message: String(e.errorMessage || e.message || ''),
    }));
  }
  await invoice.save();

  return { invoice, paymentUrl: invoice.paymentUrl, mock: false };
}

export async function applyPaidInvoice(invoice) {
  if (invoice.status === 'paid') return invoice;

  const existing = await Subscription.findOne({ invoice: invoice._id });
  if (existing) {
    invoice.status = 'paid';
    invoice.paidAt = invoice.paidAt || new Date();
    await invoice.save();
    return invoice;
  }

  const meta = invoice.metadata || {};
  const now = new Date();
  const endDate = new Date(now);
  if (meta.period === SUBSCRIPTION_PERIOD.YEARLY) endDate.setFullYear(endDate.getFullYear() + 1);
  else endDate.setMonth(endDate.getMonth() + 1);

  const subscription = await Subscription.create({
    user: invoice.user,
    plan: meta.planId,
    planCode: meta.planCode,
    status: SUBSCRIPTION_STATUS.ACTIVE,
    period: meta.period || SUBSCRIPTION_PERIOD.MONTHLY,
    startDate: now,
    endDate,
    amount: invoice.amount,
    currency: invoice.currency,
    paymentRef: invoice.providerTransactionNo || invoice.orderNumber,
    autoRenew: Boolean(meta.autoRenew),
    invoice: invoice._id,
  });

  invoice.status = 'paid';
  invoice.paidAt = now;
  await invoice.save();

  const planName = meta.planName || {};
  createNotification({
    user: invoice.user,
    type: 'subscription',
    title: { en: 'Subscription activated', ar: 'تم تفعيل الاشتراك' },
    body: { en: `Your ${planName.en || meta.planCode} plan is now active`, ar: `خطة ${planName.ar || meta.planCode} نشطة الآن` },
    data: { subscriptionId: subscription._id, planCode: meta.planCode },
  }).catch(() => {});

  logger.info(`[PAYMENTS] Invoice ${invoice.orderNumber} paid — subscription ${subscription._id} activated`);
  return invoice;
}

export async function verifyInvoiceWithPaylink(invoice) {
  const transactionNo = invoice.providerTransactionNo || invoice.providerInvoiceId;
  if (!transactionNo || invoice.provider === 'mock') {
    return { verified: false, paid: false, status: invoice.status, error: 'no_provider_reference' };
  }
  try {
    const verify = await paylinkGetInvoice(String(transactionNo));
    const isPaid = String(verify.orderStatus || '').toLowerCase() === 'paid';
    const amountOk = amountMatchesInvoice(verify, invoice);
    if (isPaid && invoice.status !== 'paid') {
      if (amountOk) {
        await applyPaidInvoice(invoice);
      } else {
        logger.warn(`[PAYMENTS] Amount mismatch invoice=${invoice.orderNumber} expected=${invoice.amount} got=${verify.amount}`);
      }
    }
    if (verify.paymentErrors?.length) {
      invoice.paymentErrors = verify.paymentErrors.map((e) => ({
        code: String(e.errorCode || e.code || ''),
        title: String(e.errorTitle || e.title || ''),
        message: String(e.errorMessage || e.message || ''),
      }));
      await invoice.save();
    }
    return { verified: true, paid: isPaid && amountOk, status: String(verify.orderStatus || '') };
  } catch (err) {
    logger.error(`[PAYMENTS] verify failed for ${invoice.orderNumber}:`, err.message);
    return { verified: false, paid: false, status: invoice.status, error: String(err?.message || err) };
  }
}