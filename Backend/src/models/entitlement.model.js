import mongoose from "mongoose";

const EntitlementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "contacts_access",
        "listed_player",
        "listed_coach",
        "promoted_player",
        "promoted_coach",
        "pro_player",
      ],
      required: true,
    },
    playerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      default: null,
    },
    active: { type: Boolean, default: true },
    grantedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
    sourceInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
    },
  },
  { timestamps: true }
);

EntitlementSchema.index(
  { userId: 1, type: 1, playerProfileId: 1 },
  { unique: true }
);

export default mongoose.model("Entitlement", EntitlementSchema);
