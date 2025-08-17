import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, index: true },
  invoiceNumber: { type: String, index: true },  // display/legacy; not unique
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  product: { type: String, enum: ['contacts_access', 'player_listing'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'SAR' },
  status: { type: String, enum: ['pending','paid','cancelled','expired','failed','refunded'], default: 'pending', index: true },
  playerProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', default: null, index: true },

  provider: { type: String, default: 'paylink' },

  // IMPORTANT: no unique here; let DB index be non-unique+sparse
  providerInvoiceId: { type: String, default: undefined, index: true },

  // Keep this one unique but SPARSE so multiple "null" are allowed
  providerTransactionNo: { type: String, unique: true, sparse: true },

  paymentUrl: { type: String, default: null },
  paymentReceiptUrl: { type: String, default: null },

  paidAt: { type: Date, default: null },
  expiresAt: { type: Date, default: null },
}, { timestamps: true });

// Guarantee only ONE PENDING invoice per purpose
InvoiceSchema.index(
  { userId: 1, product: 1, playerProfileId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

export default mongoose.model('Invoice', InvoiceSchema);
