import { catchAsync } from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Subscription } from '../models/Subscription.js';
import { SubscriptionPlan } from '../models/SubscriptionPlan.js';
import { SUBSCRIPTION_STATUS } from '../config/constants.js';
import { getPlanByCode } from '../services/subscription.service.js';
import { createSubscriptionInvoice } from '../services/payment.service.js';
import { config } from '../config/env.js';
import { getPagination, paginateMeta } from '../utils/pagination.js';

export const listPlans = catchAsync(async (req, res) => {
  const plans = await SubscriptionPlan.find({ isActive: true }).sort({ priceMonthly: 1 }).lean();
  res.status(200).json(new ApiResponse(200, req.t('subscription.plansFetched'), plans));
});

export const subscribe = catchAsync(async (req, res) => {
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

export const getMySubscription = catchAsync(async (req, res) => {
  const subscription = await Subscription.findOne({
    user: req.userId,
    status: SUBSCRIPTION_STATUS.ACTIVE,
    endDate: { $gte: new Date() },
  })
    .populate('plan')
    .sort({ endDate: -1 })
    .lean();

  if (!subscription) {
    return res.status(200).json(new ApiResponse(200, req.t('subscription.myFetched'), null));
  }
  res.status(200).json(new ApiResponse(200, req.t('subscription.myFetched'), subscription));
});

export const listMySubscriptions = catchAsync(async (req, res) => {
  const { page, limit, skip } = await getPagination(req.query);
  const filter = { user: req.userId };
  const total = await Subscription.countDocuments(filter);
  const data = await Subscription.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('plan')
    .lean();
  res.status(200).json(new ApiResponse(200, req.t('subscription.myFetched'), data, paginateMeta(total, page, limit)));
});

export const cancelSubscription = catchAsync(async (req, res) => {
  const subscription = await Subscription.findOne({
    _id: req.params.id,
    user: req.userId,
    status: SUBSCRIPTION_STATUS.ACTIVE,
  });
  if (!subscription) throw new ApiError(404, 'subscription.notFound');

  subscription.status = SUBSCRIPTION_STATUS.CANCELLED;
  subscription.cancelledAt = new Date();
  await subscription.save();

  res.status(200).json(new ApiResponse(200, req.t('subscription.cancelled'), subscription));
});
