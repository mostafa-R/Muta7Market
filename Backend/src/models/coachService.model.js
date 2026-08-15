import mongoose from "mongoose";

const serviceImageSchema = new mongoose.Schema(
  {
    url: { type: String, default: null },
    publicId: { type: String, default: null },
    title: { type: String, default: null },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const coachServiceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coach",
      default: null,
    },
    title: {
      en: { type: String, required: true, trim: true, maxlength: 120 },
      ar: { type: String, required: true, trim: true, maxlength: 120 },
    },
    description: {
      en: { type: String, default: null, maxlength: 2000 },
      ar: { type: String, default: null, maxlength: 2000 },
    },
    category: {
      type: String,
      enum: [
        "private_training",
        "group_session",
        "trial_session",
        "fitness_program",
        "tactical_analysis",
        "other",
      ],
      default: "other",
    },
    price: {
      amount: { type: Number, default: 0, min: 0 },
      currency: { type: String, default: "SAR" },
    },
    durationMinutes: {
      type: Number,
      default: 60,
      min: 15,
      max: 600,
    },
    mode: {
      type: String,
      enum: ["online", "in_person"],
      default: "in_person",
    },
    location: {
      city: { type: String, default: null, trim: true },
      area: { type: String, default: null, trim: true },
    },
    media: {
      images: {
        type: [serviceImageSchema],
        default: [],
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    bookingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

coachServiceSchema.index({ category: 1, isActive: 1 });
coachServiceSchema.index({ "price.amount": 1 });
coachServiceSchema.index({ mode: 1 });
coachServiceSchema.index({
  "title.en": "text",
  "title.ar": "text",
});

export default mongoose.model("CoachService", coachServiceSchema);