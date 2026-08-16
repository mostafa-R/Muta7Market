import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true, lowercase: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'json', 'array'],
      default: 'string',
    },
    group: { type: String, default: 'general', trim: true, lowercase: true, index: true },
    label: {
      en: { type: String, default: '' },
      ar: { type: String, default: '' },
    },
    description: {
      en: { type: String, default: '' },
      ar: { type: String, default: '' },
    },
    isPublic: { type: Boolean, default: false, index: true },
    isSecret: { type: Boolean, default: false },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

settingSchema.index({ group: 1, key: 1 });

export const Setting = mongoose.model('Setting', settingSchema);