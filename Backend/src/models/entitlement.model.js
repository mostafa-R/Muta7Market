import mongoose from 'mongoose';

const EntitlementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['contacts_access', 'player_listed'], required: true },
  playerProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlayerProfile', default: null },
  active: { type: Boolean, default: true },
  grantedAt: { type: Date, default: Date.now },
  revokedAt: { type: Date, default: null },
  sourceInvoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
}, { timestamps: true });

EntitlementSchema.index({ userId: 1, type: 1, playerProfileId: 1 }, { unique: true });

export default mongoose.model('Entitlement', EntitlementSchema);
