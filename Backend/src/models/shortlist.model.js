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
  },
  { timestamps: true }
);

ShortlistSchema.index({ user: 1, name: 1 });

export default mongoose.model("Shortlist", ShortlistSchema);
