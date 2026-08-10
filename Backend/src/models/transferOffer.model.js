import mongoose from "mongoose";
import { OFFER_TYPE } from "../config/constants.js";

const TransferOfferSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(OFFER_TYPE),
      default: OFFER_TYPE.OFFICIAL,
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      default: null,
    },
    targetType: {
      type: String,
      enum: ["player", "coach"],
      default: "player",
    },
    message: { type: String, maxlength: 2000, default: "" },
    salary: {
      amount: { type: Number, default: 0 },
      currency: { type: String, default: "SAR" },
    },
    contractDuration: { type: Number, default: 1 },
    transferFee: {
      amount: { type: Number, default: 0 },
      currency: { type: String, default: "SAR" },
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "countered", "withdrawn"],
      default: "pending",
      index: true,
    },
    negotiationRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NegotiationRoom",
      default: null,
    },
    payment: {
      isPaid: { type: Boolean, default: false },
      paidAt: { type: Date, default: null },
      paidAmount: { type: Number, default: 0 },
      invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Invoice",
        default: null,
      },
    },
  },
  { timestamps: true }
);

TransferOfferSchema.index({ fromUser: 1, status: 1 });
TransferOfferSchema.index({ toUser: 1, status: 1 });

export default mongoose.model("TransferOffer", TransferOfferSchema);
