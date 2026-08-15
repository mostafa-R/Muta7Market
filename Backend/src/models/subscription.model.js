import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },
    status: {
      type: String,
      enum: ["active", "canceled", "expired", "paused"],
      default: "active",
    },
    playerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      default: null,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
    sourceInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },
    billingInterval: {
      type: String,
      enum: ["month", "year"],
      default: "month",
    },
  },
  { timestamps: true }
);

subscriptionSchema.index({ user: 1, plan: 1, status: 1 });
subscriptionSchema.index({ user: 1, status: 1, endDate: 1 });

subscriptionSchema.methods.isActive = function () {
  const now = new Date();
  return (
    this.status === "active" &&
    this.plan === "pro" &&
    (!this.endDate || new Date(this.endDate) > now)
  );
};

subscriptionSchema.statics.findActiveForUser = async function (userId) {
  const now = new Date();
  return this.findOne({
    user: userId,
    plan: "pro",
    status: "active",
    $or: [{ endDate: null }, { endDate: { $gt: now } }],
  }).sort({ startDate: -1 });
};

export default mongoose.model("Subscription", subscriptionSchema);
