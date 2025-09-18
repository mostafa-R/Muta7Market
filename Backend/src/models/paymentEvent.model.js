import mongoose from "mongoose";

const PaymentEventSchema = new mongoose.Schema(
  {
    provider: { type: String, required: true },
    providerEventId: { type: String, required: true, unique: true },
    orderNumber: { type: String, index: true },
    type: { type: String, required: true },
    raw: { type: Object, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("PaymentEvent", PaymentEventSchema);
