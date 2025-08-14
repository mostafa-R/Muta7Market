import mongoose from "mongoose";
import { GENDER, PROFILE_STATUS } from "../config/constants.js";

const mediaVideoSchema = new mongoose.Schema(
  {
    url: { type: String, default: null },
    publicId: { type: String, default: null },
    title: { type: String, default: null },
    duration: { type: Number, default: 0, min: 0 },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const mediaDocumentSchema = new mongoose.Schema(
  {
    url: { type: String, default: null },
    publicId: { type: String, default: null },
    title: { type: String, default: null },
    type: { type: String, default: null },
    size: { type: Number, default: 0, min: 0 },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const playerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true, // Remove leading/trailing whitespace
    },
    age: {
      type: Number,
      required: true,
      min: 15,
      max: 50,
    },
    gender: {
      type: String,
      enum: Object.values(GENDER),
      required: true,
    },
    nationality: {
      type: String,
      required: true,
      trim: true,
    },
    jop: {
      type: String,
      enum: ["player", "coach"], // Restrict to specific values
      required: true,
    },
    position: {
      type: String,

      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(PROFILE_STATUS),
      default: PROFILE_STATUS.AVAILABLE,
    },
    expreiance: {
      type: Number,
      default: 0,
      min: 0,
    },
    monthlySalary: {
      amount: { type: Number, default: 0, min: 0 },
      currency: { type: String, default: "SAR" },
    },
    yearSalary: {
      amount: { type: Number, default: 0, min: 0 },
      currency: { type: String, default: "SAR" },
    },
    contractEndDate: {
      type: Date,
      default: null, // Explicit default for clarity
    },
    transferredTo: {
      club: { type: String, default: null },
      date: { type: Date, default: null },
      amount: { type: Number, default: 0, min: 0 },
    },
    media: {
      profileImage: {
        url: { type: String, default: null },
        publicId: { type: String, default: null },
      },
      videos: {
        type: [mediaVideoSchema],
        default: [],
      },
      documents: {
        type: [mediaDocumentSchema],
        default: [],
      },
    },
    socialLinks: {
      instagram: { type: String, default: null },
      twitter: { type: String, default: null },
      whatsapp: { type: String, default: null },
      youtube: { type: String, default: null },
    },
    isPromoted: {
      status: { type: Boolean, default: false },
      startDate: { type: Date, default: null },
      endDate: { type: Date, default: null },
      type: { type: String, default: null },
    },
    contactInfo: {
      isHidden: { type: Boolean, default: true },
      email: { type: String, default: null },
      phone: { type: String, default: null },
      agent: {
        name: { type: String, default: null },
        phone: { type: String, default: null },
        email: { type: String, default: null },
      },
    },
    game: {
      type: String,
      required: true,
      trim: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for optimized queries
playerSchema.index({ name: "text", position: "text" }); // Text search for name and position
playerSchema.index({ nationality: 1, jop: 1, status: 1 }); // Compound index for filtering
playerSchema.index({ "isPromoted.status": 1, "isPromoted.endDate": 1 }); // Index for promoted players
playerSchema.index({ game: 1 }); // Index for game-based queries

// Virtual for checking if promoted
playerSchema.virtual("isCurrentlyPromoted").get(function () {
  return (
    this.isPromoted.status &&
    this.isPromoted.endDate &&
    this.isPromoted.endDate > new Date()
  );
});

// Method to promote player
playerSchema.methods.promote = async function (days, type = "featured") {
  this.isPromoted = {
    status: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    type,
  };
  return this.save();
};

// Method to transfer player
playerSchema.methods.transfer = async function (clubName, amount) {
  this.status = PROFILE_STATUS.TRANSFERRED;
  this.transferredTo = {
    club: clubName,
    date: new Date(),
    amount,
  };
  return this.save();
};

playerSchema.pre("validate", function (next) {
  if (this.status) {
    this.status = this.status.toLowerCase();
  }
  next();
});

export default mongoose.model("Player", playerSchema);
