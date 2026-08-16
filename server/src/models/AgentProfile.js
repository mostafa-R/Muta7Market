import mongoose from 'mongoose';
import { KYC_STATUS } from '../config/constants.js';

const agentProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    agencyName: { type: String, trim: true, default: '' },
    licenseNumber: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, index: true },
    city: { type: String, trim: true, default: '' },
    about: {
      en: { type: String, trim: true, maxlength: 2000, default: '' },
      ar: { type: String, trim: true, maxlength: 2000, default: '' },
    },
    clients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PlayerProfile', index: true }],
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    isVerified: { type: Boolean, default: false, index: true },
    kycStatus: { type: String, enum: Object.values(KYC_STATUS), default: 'none' },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const AgentProfile = mongoose.model('AgentProfile', agentProfileSchema);
