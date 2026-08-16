import mongoose from 'mongoose';

const shortlistSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PlayerProfile' }],
    isPrivate: { type: Boolean, default: true },
  },
  { timestamps: true }
);

shortlistSchema.index({ owner: 1, createdAt: -1 });
shortlistSchema.index({ owner: 1, name: 1 }, { unique: true });

export const Shortlist = mongoose.model('Shortlist', shortlistSchema);
