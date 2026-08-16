import mongoose from "mongoose";
import { GENDER, PROFILE_STATUS } from "../config/constants.js";
import { indexProfile, removeProfile } from "../services/search.service.js";

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

const validateLocalized = (v) => {
  if (v === null || v === undefined) return true;
  return typeof v === "string" || (v && typeof v === "object" && v.ar && v.en);
};

const localizedField = (label) => ({
  type: mongoose.Schema.Types.Mixed,
  default: null,
  validate: {
    validator: validateLocalized,
    message: `${label} must be a string or an object with ar, en, and optional slug properties`,
  },
});

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
    agentUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    agentCode: {
      type: String,
      trim: true,
      default: null,
    },
    agentCodeExpiresAt: {
      type: Date,
      default: null,
    },
    agentLinkedAt: {
      type: Date,
      default: null,
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
    job: {
      type: String,
      enum: ["player", "coach"],
      required: true,
    },
    roleType: localizedField("RoleType"),
    customRoleType: {
      type: String,
      default: null,
      trim: true,
    },
    position: localizedField("Position"),
    customPosition: {
      type: String,
      default: null,
      trim: true,
    },
    secondaryPosition: localizedField("Secondary position"),
    customSecondaryPosition: {
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
    contractStatus: {
      type: String,
      enum: ["free_agent", "contracted", "loaned"],
      default: "free_agent",
    },
    height: {
      type: Number,
      default: null,
    },
    weight: {
      type: Number,
      default: null,
    },
    preferredFoot: {
      type: String,
      enum: ["right", "left", "both", ""],
      default: "",
    },
    preferredHand: {
      type: String,
      enum: ["right", "left", "both", ""],
      default: "",
    },
    physicalCondition: {
      type: String,
      enum: ["available", "injured"],
      default: "available",
    },
    careerHistory: [
      {
        club: { type: String, default: null },
        league: { type: String, default: null },
        from: { type: Date, default: null },
        to: { type: Date, default: null },
        appearances: { type: Number, default: 0 },
        goals: { type: Number, default: 0 },
        assists: { type: Number, default: 0 },
        titles: [String],
      },
    ],
    skills: {
      type: [String],
      default: [],
      trim: true,
    },
    previousClubs: {
      type: [String],
      default: [],
      trim: true,
    },
    achievements: {
      type: [String],
      default: [],
      trim: true,
    },
    languages: {
      type: [String],
      default: [],
      trim: true,
    },
    bio: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    statistics: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
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
      isHidden: { type: Boolean, default: false },
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
      videos: {
        type: [mediaVideoSchema],
        default: [],
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
        validator: validateLocalized,
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
    isPro: {
      type: Boolean,
      default: false,
    },
    proSince: {
      type: Date,
      default: null,
    },
    proExpiresAt: {
      type: Date,
      default: null,
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
          (ret.secondaryPosition === "other" ||
            ret.secondaryPosition === "") &&
          ret.customSecondaryPosition
        ) {
          ret.secondaryPosition = ret.customSecondaryPosition;
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

playerSchema.index({ user: 1 }, { unique: true, sparse: true });
playerSchema.index({ isActive: 1, activeExpireAt: 1 });
playerSchema.index({ name: "text", position: "text" });
playerSchema.index({ nationality: 1, job: 1, status: 1 });
playerSchema.index({ "isPromoted.status": 1, "isPromoted.endDate": 1 });
playerSchema.index({ game: 1 });
playerSchema.index({ agentCode: 1 }, { unique: true, sparse: true });

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

playerSchema.methods.transfer = async function (
  clubName,
  amount,
  options = {}
) {
  this.status = PROFILE_STATUS.TRANSFERRED;
  this.transferredTo = {
    club: clubName,
    startDate: options.transferDate || new Date(),
    endDate: options.endDate || null,
    amount: Number(amount) || 0,
  };
  return this.save();
};

playerSchema.pre("validate", function (next) {
  if (this.status) {
    this.status = this.status.toLowerCase();
  }
  next();
});

playerSchema.post("save", async function (doc) {
  try {
    await indexProfile("player", doc);
  } catch {}
});
playerSchema.post("findOneAndUpdate", async function (doc) {
  if (!doc) return;
  try {
    await indexProfile("player", doc);
  } catch {}
});
playerSchema.post("deleteOne", async function (doc) {
  if (!doc) return;
  try {
    await removeProfile("player", doc._id);
  } catch {}
});
playerSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;
  try {
    await removeProfile("player", doc._id);
  } catch {}
});

export default mongoose.model("Player", playerSchema);
