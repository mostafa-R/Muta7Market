import mongoose from "mongoose";

const PaymentErrorSchema = new mongoose.Schema(
  {
    code: String,
    title: String,
    message: String,
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const InvoiceSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    invoiceNumber: { type: String, index: true }, 

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    product: {
      type: String,
      enum: ["contacts_access", "listing", "promotion"],
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ["player", "coach", null],
      default: null,
      index: true,
    }, 
    playerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    }, 

    durationDays: { type: Number, default: 365 },
    featureType: { type: String, default: null }, 

    amount: { type: Number, required: true },
    currency: { type: String, default: "SAR" },
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled", "expired", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    provider: { type: String, default: "paylink" },
    providerInvoiceId: { type: String, default: undefined, index: true }, 
    providerTransactionNo: { type: String, unique: true, sparse: true },

    paymentUrl: { type: String, default: null },
    paymentReceiptUrl: { type: String, default: null },

    paidAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },

    lastPaymentErrors: { type: [PaymentErrorSchema], default: [] },
  },
  { timestamps: true }
);

InvoiceSchema.index(
  { userId: 1, product: 1, targetType: 1, playerProfileId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);

export default mongoose.model("Invoice", InvoiceSchema);
