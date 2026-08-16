import mongoose from 'mongoose';
import { OFFER_STATUS, OFFER_TYPE } from '../config/constants.js';

const statusChangeSchema = new mongoose.Schema(
  {
    status: { type: String, enum: Object.values(OFFER_STATUS), required: true },
    at: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const offerSchema = new mongoose.Schema(
  {
    offerNumber: { type: String, required: true, unique: true },
    type: { type: String, enum: Object.values(OFFER_TYPE), required: true, index: true },
    status: { type: String, enum: Object.values(OFFER_STATUS), default: 'sent', index: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fromClub: { type: mongoose.Schema.Types.ObjectId, ref: 'ClubProfile', index: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    toPlayer: { type: mongoose.Schema.Types.ObjectId, ref: 'PlayerProfile', index: true },
    toAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    salaryPerYear: { type: Number, min: 0, default: 0 },
    currency: { type: String, default: 'USD', uppercase: true },
    contractDurationMonths: { type: Number, min: 1, max: 120, default: 12 },
    transferFee: { type: Number, min: 0, default: 0 },
    bonus: { type: Number, min: 0, default: 0 },
    notes: {
      en: { type: String, default: '' },
      ar: { type: String, default: '' },
    },
    expiresAt: { type: Date, index: true },
    respondedAt: { type: Date, default: null },
    viewedAt: { type: Date, default: null },
    statusHistory: { type: [statusChangeSchema], default: [] },
  },
  { timestamps: true }
);

offerSchema.index({ fromUser: 1, status: 1, createdAt: -1 });
offerSchema.index({ toUser: 1, status: 1, createdAt: -1 });
offerSchema.index({ fromClub: 1, toPlayer: 1 });

export const Offer = mongoose.model('Offer', offerSchema);
