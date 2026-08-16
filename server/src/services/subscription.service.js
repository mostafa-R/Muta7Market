import { Subscription } from '../models/Subscription.js';
import { SubscriptionPlan } from '../models/SubscriptionPlan.js';
import { SUBSCRIPTION_STATUS } from '../config/constants.js';
import { ApiError } from '../utils/ApiError.js';

export async function getActiveSubscription(userId) {
  const now = new Date();
  const subscription = await Subscription.findOne({
    user: userId,
    status: SUBSCRIPTION_STATUS.ACTIVE,
    endDate: { $gte: now },
  })
    .populate('plan')
    .sort({ endDate: -1 })
    .lean();

  if (subscription && subscription.endDate < now) {
    await Subscription.updateOne({ _id: subscription._id }, { status: 'expired' });
    return null;
  }
  return subscription;
}

export async function hasActiveSubscription(userId, planCodes = []) {
  const sub = await getActiveSubscription(userId);
  if (!sub) return false;
  if (!planCodes.length) return true;
  return planCodes.includes(sub.planCode);
}

export async function requireSubscription(userId, planCodes = [], t) {
  const allowed = await hasActiveSubscription(userId, planCodes);
  if (!allowed) {
    throw new ApiError(403, 'subscription.required', {}, t('subscription.required'));
  }
  return true;
}

export async function getPlanByCode(code) {
  return SubscriptionPlan.findOne({ code, isActive: true }).lean();
}
