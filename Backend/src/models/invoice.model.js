// src/models/invoice.model.js
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
    orderNumber: { type: String, unique: true, index: true }, // canonical unique
    invoiceNumber: { type: String, index: true }, // display/legacy; not unique
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    product: {
      type: String,
      enum: ["contacts_access", "player_listing"],
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "SAR" },
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled", "expired", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    playerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      default: null,
      index: true,
    },

    provider: { type: String, default: "paylink" },
    providerInvoiceId: { type: String, default: undefined, index: true }, // NOT unique
    providerTransactionNo: { type: String, unique: true, sparse: true },

    paymentUrl: { type: String, default: null },
    paymentReceiptUrl: { type: String, default: null },

    paidAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },

    lastPaymentErrors: { type: [PaymentErrorSchema], default: [] },
  },
  { timestamps: true }
);

// one pending invoice per purpose
InvoiceSchema.index(
  { userId: 1, product: 1, playerProfileId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);

export default mongoose.model("Invoice", InvoiceSchema);
