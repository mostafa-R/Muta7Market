import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    name: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
  },
  { _id: false }
);

const sportSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    positions: [positionSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Sport = mongoose.model('Sport', sportSchema);
