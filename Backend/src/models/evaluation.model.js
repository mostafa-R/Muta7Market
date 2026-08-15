import mongoose from "mongoose";

const evaluationSchema = new mongoose.Schema(
  {
    evaluator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    evaluatorRole: {
      type: String,
      default: null,
    },
    subjectType: {
      type: String,
      enum: ["player", "coach", "scout", "agent", "academy"],
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    context: {
      type: new mongoose.Schema(
        {
          type: {
            type: String,
            enum: ["trial", "interview", "training", "general", "transfer"],
            default: "general",
          },
          ref: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
          },
          title: { type: String, trim: true, default: null },
        },
        { _id: false }
      ),
      default: () => ({ type: "general", ref: null, title: null }),
    },
    ratings: [
      {
        category: { type: String, trim: true, required: true },
        score: { type: Number, min: 1, max: 10, required: true },
      },
    ],
    overallRating: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      default: null,
    },
    recommendation: {
      type: String,
      enum: [
        "strongly_recommend",
        "recommend",
        "neutral",
        "not_recommend",
      ],
      default: "neutral",
    },
    status: {
      type: String,
      enum: ["draft", "submitted"],
      default: "submitted",
    },
  },
  { timestamps: true }
);

evaluationSchema.index({ subjectType: 1, subject: 1 });
evaluationSchema.index({ evaluator: 1, subjectType: 1, subject: 1 });
evaluationSchema.index({ status: 1 });

export default mongoose.model("Evaluation", evaluationSchema);
