import mongoose from 'mongoose';
import { KYC_STATUS } from '../config/constants.js';

const vacancySchema = new mongoose.Schema(
  {
    position: { type: String, required: true },
    count: { type: Number, default: 1, min: 1, max: 50 },
    contractType: { type: String, enum: ['permanent', 'loan', 'trial', 'seasonal'], default: 'permanent' },
    salaryRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'USD', uppercase: true },
    },
    expiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const socialSchema = new mongoose.Schema(
  {
    website: { type: String, trim: true, default: '' },
    instagram: { type: String, trim: true, default: '' },
    twitter: { type: String, trim: true, default: '' },
    facebook: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const clubProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    clubName: { type: String, required: true, trim: true, index: true },
    foundedYear: { type: Number, min: 1800, max: 2100 },
    sportCode: { type: String, index: true },
    league: { type: String, trim: true },
    country: { type: String, trim: true, index: true },
    city: { type: String, trim: true, index: true },
    stadium: { type: String, trim: true, default: '' },
    capacity: { type: Number, min: 0, default: 0 },
    logo: { type: String, default: null },
    about: {
      en: { type: String, trim: true, maxlength: 3000, default: '' },
      ar: { type: String, trim: true, maxlength: 3000, default: '' },
    },
    isVerified: { type: Boolean, default: false, index: true },
    kycStatus: { type: String, enum: Object.values(KYC_STATUS), default: 'none' },
    social: { type: socialSchema, default: () => ({}) },
    vacancies: { type: [vacancySchema], default: [] },
    views: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

clubProfileSchema.index({ country: 1, sportCode: 1 });
clubProfileSchema.index({ isVerified: 1, createdAt: -1 });

export const ClubProfile = mongoose.model('ClubProfile', clubProfileSchema);
