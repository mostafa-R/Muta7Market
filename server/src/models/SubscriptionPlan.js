import mongoose from 'mongoose';
import { LANGUAGES } from '../config/constants.js';

const subscriptionPlanSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    description: {
      en: { type: String, default: '' },
      ar: { type: String, default: '' },
    },
    targetRole: { type: String, enum: ['player', 'coach', 'club', 'agent'], required: true },
    priceMonthly: { type: Number, default: 0, min: 0 },
    priceYearly: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'USD', uppercase: true },
    features: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
