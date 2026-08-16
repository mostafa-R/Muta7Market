import mongoose from 'mongoose';

const contactRequestSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    senderRole: { type: String, enum: ['club', 'agent', 'coach'], required: true },
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'PlayerProfile', required: true, index: true },
    playerUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, trim: true, maxlength: 1000, default: '' },
    status: { type: String, enum: ['sent', 'read', 'responded'], default: 'sent', index: true },
    readAt: { type: Date, default: null },
    respondedAt: { type: Date, default: null },
    response: { type: String, trim: true, maxlength: 1000, default: '' },
    emailSentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

contactRequestSchema.index({ sender: 1, createdAt: -1 });
contactRequestSchema.index({ playerUser: 1, status: 1, createdAt: -1 });
contactRequestSchema.index({ sender: 1, player: 1 }, { unique: true });

export const ContactRequest = mongoose.model('ContactRequest', contactRequestSchema);
