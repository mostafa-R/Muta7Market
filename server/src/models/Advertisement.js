import mongoose from 'mongoose';
import { AD_STATUS, AD_TYPE } from '../config/constants.js';

const googleSlotSchema = new mongoose.Schema(
  {
    clientId: { type: String, trim: true, default: '' },
    slotId: { type: String, trim: true, default: '' },
    format: { type: String, enum: ['auto', 'horizontal', 'vertical', 'rectangle', 'fluid'], default: 'auto' },
  },
  { _id: false }
);

const advertisementSchema = new mongoose.Schema(
  {
    advertiser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: Object.values(AD_TYPE), default: 'banner', index: true },
    adType: { type: String, enum: ['banner', 'customHtml', 'googleAdsense'], default: 'banner' },
    placement: {
      type: String,
      enum: ['homeBanner', 'homeSidebar', 'searchResults', 'videoPreroll', 'playerProfile', 'coachProfile', 'clubProfile', 'mobileBanner'],
      default: 'homeBanner',
      index: true,
    },
    title: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    description: {
      en: { type: String, default: '' },
      ar: { type: String, default: '' },
    },
    image: { type: String, default: null },
    link: { type: String, trim: true, default: '' },
    customHtml: { type: String, trim: true, default: '' },
    googleSlot: { type: googleSlotSchema, default: () => ({}) },
    geo: {
      country: { type: String, default: '', index: true },
      city: { type: String, default: '', index: true },
    },
    targetRoles: [{ type: String, enum: ['player', 'coach', 'club', 'agent'], index: true }],
    targetCountries: [{ type: String, trim: true, uppercase: true, index: true }],
    priority: { type: Number, default: 0, min: 0, index: true },
    trial: { type: mongoose.Schema.Types.ObjectId, ref: 'Trial', default: null },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true, index: true },
    status: { type: String, enum: Object.values(AD_STATUS), default: 'draft', index: true },
    maxImpressions: { type: Number, default: 0, min: 0 },
    maxClicks: { type: Number, default: 0, min: 0 },
    impressions: { type: Number, default: 0, min: 0 },
    clicks: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

advertisementSchema.index({ status: 1, endsAt: 1, geo: 1, placement: 1 });

export const Advertisement = mongoose.model('Advertisement', advertisementSchema);