import mongoose from 'mongoose';
import { VIDEO_CATEGORIES } from '../config/constants.js';

const mediaSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ownerModel: { type: String, enum: ['PlayerProfile', 'CoachProfile', 'ClubProfile', 'User'], default: 'PlayerProfile' },
    owner: { type: mongoose.Schema.Types.ObjectId, refPath: 'ownerModel', required: true, index: true },
    kind: { type: String, enum: ['highlight', 'avatar', 'logo', 'document', 'banner'], default: 'highlight' },
    title: {
      en: { type: String, trim: true, default: '' },
      ar: { type: String, trim: true, default: '' },
    },
    description: {
      en: { type: String, trim: true, default: '' },
      ar: { type: String, trim: true, default: '' },
    },
    category: { type: String, enum: VIDEO_CATEGORIES, default: 'other' },
    file: {
      path: { type: String, required: true },
      mimeType: { type: String, required: true },
      size: { type: Number, required: true },
      originalName: { type: String, default: '' },
    },
    thumbnail: { type: String, default: null },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

mediaSchema.index({ user: 1, kind: 1, createdAt: -1 });
mediaSchema.index({ owner: 1, isPublic: 1 });

export const Media = mongoose.model('Media', mediaSchema);
