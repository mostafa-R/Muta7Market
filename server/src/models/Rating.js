import mongoose from 'mongoose';
import { RATING_TYPES } from '../config/constants.js';

const ratingSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetModel: { type: String, enum: ['PlayerProfile', 'CoachProfile', 'ClubProfile', 'AgentProfile'], default: 'PlayerProfile' },
    target: { type: mongoose.Schema.Types.ObjectId, refPath: 'targetModel', required: true },
    type: { type: String, enum: Object.values(RATING_TYPES), required: true },
    offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', default: null },
    score: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  { timestamps: true }
);

ratingSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });
ratingSchema.index({ target: 1, createdAt: -1 });

export const Rating = mongoose.model('Rating', ratingSchema);
