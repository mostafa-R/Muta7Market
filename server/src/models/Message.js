import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    negotiation: { type: mongoose.Schema.Types.ObjectId, ref: 'Negotiation', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
    type: { type: String, enum: ['text', 'system'], default: 'text' },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

messageSchema.index({ negotiation: 1, createdAt: 1 });

export const Message = mongoose.model('Message', messageSchema);
