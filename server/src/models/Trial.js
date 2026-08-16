import mongoose from 'mongoose';
import { RATING_TYPES, TRIAL_STATUS } from '../config/constants.js';

const trialSchema = new mongoose.Schema(
  {
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    playerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'PlayerProfile', index: true },
    offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', default: null },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 90, min: 15, max: 600 },
    location: {
      venue: { type: String, default: '' },
      country: { type: String, default: '' },
      city: { type: String, default: '' },
    },
    status: { type: String, enum: Object.values(TRIAL_STATUS), default: 'scheduled', index: true },
    notes: { type: String, trim: true, maxlength: 2000, default: '' },
    outcome: { type: String, enum: ['positive', 'negative', 'neutral', ''], default: '' },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

trialSchema.index({ club: 1, status: 1, scheduledAt: 1 });
trialSchema.index({ player: 1, status: 1 });

export const Trial = mongoose.model('Trial', trialSchema);
