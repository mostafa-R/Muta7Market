import mongoose from "mongoose";

const ShortlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      default: "My shortlist",
      trim: true,
      maxlength: 80,
    },
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },
    ],
    coaches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coach",
      },
    ],
  },
  { timestamps: true }
);

ShortlistSchema.index({ user: 1, name: 1 });
ShortlistSchema.index({ coaches: 1 });
ShortlistSchema.index({ players: 1 });

export default mongoose.model("Shortlist", ShortlistSchema);
