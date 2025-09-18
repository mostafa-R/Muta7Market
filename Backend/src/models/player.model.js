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
  { _id: false }
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
  { _id: false }
);

const mediaImageSchema = new mongoose.Schema(
  {
    url: { type: String, default: null },
    publicId: { type: String, default: null },
    title: { type: String, default: null },
    type: { type: String, default: null },
    size: { type: Number, default: 0, min: 0 },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const playerSchema = new mongoose.Schema(
  {
    isListed: {
      type: Boolean,
      default: false,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
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
    customNationality: {
      type: String,
      default: null,
      trim: true,
    },
    birthCountry: {
      type: String,
      default: null,
      trim: true,
    },
    customBirthCountry: {
      type: String,
      default: null,
      trim: true,
    },
    jop: {
      type: String,
      enum: ["player", "coach"],
      required: true,
    },
    roleType: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      validate: {
        validator: function (v) {
          if (v === null) return true;
          return (
            typeof v === "string" ||
            (v && typeof v === "object" && v.ar && v.en)
          );
        },
        message:
          "RoleType must be a string or an object with ar, en, and optional slug properties",
      },
    },
    customRoleType: {
      type: String,
      default: null,
      trim: true,
    },
    position: {
      type: mongoose.Schema.Types.Mixed,
      validate: {
        validator: function (v) {
          if (v === null) return true;
          return (
            typeof v === "string" ||
            (v && typeof v === "object" && v.ar && v.en)
          );
        },
        message:
          "Position must be a string or an object with ar, en, and optional slug properties",
      },
    },
    customPosition: {
      type: String,
      default: null,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(PROFILE_STATUS),
      default: PROFILE_STATUS.AVAILABLE,
    },
    experience: {
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
      default: null,
    },
    transferredTo: {
      club: { type: String, default: null },
      startDate: { type: Date, default: null },
      endDate: { type: Date, default: null },
      amount: { type: Number, default: 0, min: 0 },
    },

    socialLinks: {
      instagram: { type: String, default: null },
      twitter: { type: String, default: null },
      whatsapp: { type: String, default: null },
      youtube: { type: String, default: null },
    },

    contactInfo: {
      email: { type: String, default: null },
      phone: { type: String, default: null },
      agent: {
        name: { type: String, default: null },
        phone: { type: String, default: null },
        email: { type: String, default: null },
      },
    },

    isPromoted: {
      status: { type: Boolean, default: false },
      startDate: { type: Date, default: null },
      endDate: { type: Date, default: null },
      type: { type: String, default: null },
    },

    media: {
      profileImage: {
        url: { type: String, default: null },
        publicId: { type: String, default: null },
      },
      video: {
        type: mediaVideoSchema,
        default: () => ({
          url: null,
          publicId: null,
          title: null,
          duration: 0,
          uploadedAt: null,
        }),
      },
      document: {
        type: mediaDocumentSchema,
        default: () => ({
          url: null,
          publicId: null,
          title: null,
          type: null,
          size: 0,
          uploadedAt: null,
        }),
      },
      images: {
        type: [mediaImageSchema],
        default: () => [
          {
            url: null,
            publicId: null,
            title: null,
            type: null,
            size: 0,
          },
        ],
      },
    },
    game: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      validate: {
        validator: function (v) {
          return (
            typeof v === "string" ||
            (v && typeof v === "object" && v.ar && v.en)
          );
        },
        message:
          "Game must be a string or an object with ar, en, and optional slug properties",
      },
    },
    customSport: {
      type: String,
      default: null,
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
    activeExpireAt: {
      type: Date,
      default: null,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        if (
          (ret.nationality === "other" || ret.nationality === "") &&
          ret.customNationality
        ) {
          ret.nationality = ret.customNationality;
        }

        if (
          (ret.birthCountry === "other" || ret.birthCountry === "") &&
          ret.customBirthCountry
        ) {
          ret.birthCountry = ret.customBirthCountry;
        }

        if (
          (ret.roleType === "other" || ret.roleType === "") &&
          ret.customRoleType
        ) {
          ret.roleType = ret.customRoleType;
        }

        if (
          (ret.position === "other" || ret.position === "") &&
          ret.customPosition
        ) {
          ret.position = ret.customPosition;
        }

        if (
          typeof ret.game === "string" &&
          (ret.game === "other" || ret.game === "") &&
          ret.customSport
        ) {
          ret.game = ret.customSport;
        } else if (
          typeof ret.game === "object" &&
          ret.game.slug === "other" &&
          ret.customSport
        ) {
          ret.game.ar = ret.customSport;
          ret.game.en = ret.customSport;
        }

        return ret;
      },
    },
  }
);

playerSchema.index({ isActive: 1, activeExpireAt: 1 });
playerSchema.index({ name: "text", position: "text" });
playerSchema.index({ nationality: 1, jop: 1, status: 1 });
playerSchema.index({ "isPromoted.status": 1, "isPromoted.endDate": 1 });
playerSchema.index({ game: 1 });

playerSchema.virtual("isCurrentlyPromoted").get(function () {
  return (
    this.isPromoted.status &&
    this.isPromoted.endDate &&
    this.isPromoted.endDate > new Date()
  );
});

playerSchema.methods.promote = async function (days, type = "featured") {
  this.isPromoted = {
    status: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    type,
  };
  return this.save();
};

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
