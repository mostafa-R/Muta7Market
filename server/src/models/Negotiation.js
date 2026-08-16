import mongoose from 'mongoose';
import { NEGOTIATION_STATUS } from '../config/constants.js';

const negotiationSchema = new mongoose.Schema(
  {
    offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', default: null, index: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
    clubSide: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    playerSide: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    status: { type: String, enum: Object.values(NEGOTIATION_STATUS), default: 'open', index: true },
    closedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    closedAt: { type: Date, default: null },
    lastMessageAt: { type: Date, default: null },
    lastReadAt: {
      type: Map,
      of: Date,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

negotiationSchema.index({ participants: 1, status: 1 });
negotiationSchema.index({ lastMessageAt: -1 });

export const Negotiation = mongoose.model('Negotiation', negotiationSchema);
