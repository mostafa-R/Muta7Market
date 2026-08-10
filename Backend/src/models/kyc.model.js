import mongoose from "mongoose";
import { KYC_STATUS } from "../config/constants.js";

const KycDocumentSchema = new mongoose.Schema(
  {
    documentType: { type: String, default: "other" },
    url: { type: String, required: true },
    publicId: { type: String, default: null },
  },
  { _id: false }
);

const KycSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    entityName: { type: String, default: null },
    entityType: { type: String, default: null },
    documents: { type: [KycDocumentSchema], default: [] },
    status: {
      type: String,
      enum: Object.values(KYC_STATUS),
      default: KYC_STATUS.NOT_SUBMITTED,
      index: true,
    },
    rejectionReason: { type: String, default: null },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: { type: Date, default: null },
    submittedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Kyc", KycSchema);
