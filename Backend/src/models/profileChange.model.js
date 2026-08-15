import mongoose from "mongoose";

const profileChangeSchema = new mongoose.Schema(
  {
    profileType: {
      type: String,
      enum: ["player", "coach"],
      required: true,
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    field: {
      type: String,
      required: true,
      trim: true,
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    changedByRole: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

profileChangeSchema.index({ profileType: 1, profileId: 1, createdAt: -1 });

export default mongoose.model("ProfileChange", profileChangeSchema);
