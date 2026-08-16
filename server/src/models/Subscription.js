import mongoose from 'mongoose';
import { SUBSCRIPTION_PERIOD, SUBSCRIPTION_STATUS } from '../config/constants.js';

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    planCode: { type: String, required: true, index: true },
    status: { type: String, enum: Object.values(SUBSCRIPTION_STATUS), default: 'pending', index: true },
    period: { type: String, enum: Object.values(SUBSCRIPTION_PERIOD), default: 'monthly' },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null, index: true },
    amount: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'USD', uppercase: true },
    paymentRef: { type: String, default: '' },
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', default: null, index: true },
    autoRenew: { type: Boolean, default: false },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

subscriptionSchema.index({ user: 1, status: 1, createdAt: -1 });
subscriptionSchema.index({ status: 1, endDate: 1 });

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
