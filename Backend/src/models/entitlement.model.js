import mongoose from 'mongoose';

const entitlementSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['unlock_contacts', 'publish_profile'], required: true, index: true },
    active: { type: Boolean, default: true, index: true },
    activatedAt: { type: Date, default: Date.now },
    sourceInvoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true, unique: true },
  },
  { timestamps: true }
);

entitlementSchema.index({ user: 1, type: 1, active: 1 });

export default mongoose.model('Entitlement', entitlementSchema);


