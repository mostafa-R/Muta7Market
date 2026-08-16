import mongoose from 'mongoose';
import {
  CONTRACT_STATUS,
  KYC_STATUS,
  PREFERRED_FOOT,
  PREFERRED_HAND,
  PHYSICAL_STATUS,
} from '../config/constants.js';

const careerEntrySchema = new mongoose.Schema(
  {
    club: { type: String, required: true, trim: true },
    country: { type: String, trim: true, default: '' },
    from: { type: Date, required: true },
    to: { type: Date, default: null },
    isCurrent: { type: Boolean, default: false },
    competition: { type: String, trim: true, default: '' },
    appearances: { type: Number, default: 0, min: 0 },
    goals: { type: Number, default: 0, min: 0 },
    trophies: [{ type: String }],
  },
  { _id: false }
);

const statsSchema = new mongoose.Schema(
  {
    appearances: { type: Number, default: 0, min: 0 },
    goals: { type: Number, default: 0, min: 0 },
    assists: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const playerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    sportCode: { type: String, required: true, index: true },
    primaryPosition: { type: String, required: true, index: true },
    secondaryPositions: [{ type: String, index: true }],
    heightCm: { type: Number, min: 100, max: 250 },
    weightKg: { type: Number, min: 30, max: 250 },
    preferredFoot: { type: String, enum: Object.values(PREFERRED_FOOT), default: 'right', index: true },
    preferredHand: { type: String, enum: Object.values(PREFERRED_HAND), default: 'right' },
    physicalStatus: {
      type: String,
      enum: Object.values(PHYSICAL_STATUS),
      default: 'available',
      index: true,
    },
    injuryNote: { type: String, trim: true, default: '' },
    contractStatus: {
      type: String,
      enum: Object.values(CONTRACT_STATUS),
      default: 'freeAgent',
      index: true,
    },
    currentClub: { type: String, trim: true, default: '' },
    contractEndDate: { type: Date, default: null },
    nationality: { type: String, trim: true, index: true },
    country: { type: String, trim: true, index: true },
    city: { type: String, trim: true, index: true },
    birthDate: { type: Date, required: true, index: true },
    about: {
      en: { type: String, trim: true, maxlength: 2000, default: '' },
      ar: { type: String, trim: true, maxlength: 2000, default: '' },
    },
    careerHistory: { type: [careerEntrySchema], default: [] },
    stats: { type: statsSchema, default: () => ({}) },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    isVerified: { type: Boolean, default: false, index: true },
    kycStatus: { type: String, enum: Object.values(KYC_STATUS), default: 'none' },
    isPublic: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    featuredUntil: { type: Date, default: null },
    views: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

playerProfileSchema.index({ sportCode: 1, primaryPosition: 1, isPublic: 1 });
playerProfileSchema.index({ heightCm: 1, contractStatus: 1, physicalStatus: 1 });
playerProfileSchema.index({ isFeatured: 1, ratingAvg: -1 });
playerProfileSchema.index({ country: 1, city: 1 });
playerProfileSchema.index({ views: -1 });

export const PlayerProfile = mongoose.model('PlayerProfile', playerProfileSchema);
