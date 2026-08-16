import mongoose from 'mongoose';
import { KYC_DOC_TYPES, KYC_STATUS } from '../config/constants.js';

const kycDocumentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: Object.values(KYC_DOC_TYPES), required: true },
    filePath: { type: String, required: true },
    originalName: { type: String, default: '' },
    mimeType: { type: String, default: '' },
  },
  { _id: false }
);

const kycRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['player', 'coach', 'club', 'agent'], required: true, index: true },
    orgName: { type: String, trim: true, default: '' },
    documents: { type: [kycDocumentSchema], default: [] },
    status: { type: String, enum: Object.values(KYC_STATUS), default: 'pending', index: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    reviewNote: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

kycRequestSchema.index({ status: 1, createdAt: -1 });
kycRequestSchema.index({ user: 1, status: 1 });

export const KycRequest = mongoose.model('KycRequest', kycRequestSchema);
