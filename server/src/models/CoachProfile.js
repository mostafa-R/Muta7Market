import mongoose from 'mongoose';
import { KYC_STATUS } from '../config/constants.js';

const licenseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    issuingBody: { type: String, trim: true, default: '' },
    year: { type: Number, min: 1950, max: 2100 },
    grade: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const serviceSchema = new mongoose.Schema(
  {
    title: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    description: {
      en: { type: String, default: '' },
      ar: { type: String, default: '' },
    },
    price: { type: Number, min: 0, default: 0 },
    currency: { type: String, default: 'USD', uppercase: true },
  },
  { _id: false }
);

const coachProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    sportCode: { type: String, required: true, index: true },
    experienceYears: { type: Number, default: 0, min: 0, index: true },
    licenseGrade: { type: String, trim: true, default: '' },
    licenses: { type: [licenseSchema], default: [] },
    achievements: [{ type: String, trim: true }],
    specializations: [{ type: String, index: true }],
    coachingStyle: { type: String, trim: true, default: '' },
    currentClub: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, index: true },
    city: { type: String, trim: true, index: true },
    about: {
      en: { type: String, trim: true, maxlength: 2000, default: '' },
      ar: { type: String, trim: true, maxlength: 2000, default: '' },
    },
    services: { type: [serviceSchema], default: [] },
    availability: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false, index: true },
    kycStatus: { type: String, enum: Object.values(KYC_STATUS), default: 'none' },
    isPublic: { type: Boolean, default: true, index: true },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    views: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

coachProfileSchema.index({ sportCode: 1, experienceYears: -1, isPublic: 1 });
coachProfileSchema.index({ country: 1, city: 1 });

export const CoachProfile = mongoose.model('CoachProfile', coachProfileSchema);
