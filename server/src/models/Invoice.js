import mongoose from 'mongoose';
import { INVOICE_STATUS } from '../config/constants.js';

const paymentErrorSchema = new mongoose.Schema(
  {
    code: { type: String, default: '' },
    title: { type: String, default: '' },
    message: { type: String, default: '' },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    purpose: { type: String, enum: ['subscription'], default: 'subscription', index: true },
    status: { type: String, enum: Object.values(INVOICE_STATUS), default: 'pending', index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'SAR', uppercase: true },
    provider: { type: String, enum: ['paylink', 'mock'], default: 'paylink' },
    providerTransactionNo: { type: String, default: null, sparse: true, index: true },
    providerInvoiceId: { type: String, default: null },
    paymentUrl: { type: String, default: null },
    paidAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null, index: true },
    paymentErrors: { type: [paymentErrorSchema], default: [] },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

invoiceSchema.index({ user: 1, status: 1, createdAt: -1 });
invoiceSchema.index({ status: 1, expiresAt: 1 });

export const Invoice = mongoose.model('Invoice', invoiceSchema);