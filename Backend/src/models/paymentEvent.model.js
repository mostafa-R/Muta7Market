import mongoose from 'mongoose';

const PaymentEventSchema = new mongoose.Schema({
  provider: { type: String, required: true },
  providerEventId: { type: String, required: true, unique: true }, // Paylink transactionNo
  orderNumber: { type: String, index: true },
  type: { type: String, required: true }, // 'invoice.paid' | 'refund.succeeded' | ...
  raw: { type: Object, default: {} },
}, { timestamps: true });

export default mongoose.model('PaymentEvent', PaymentEventSchema);
