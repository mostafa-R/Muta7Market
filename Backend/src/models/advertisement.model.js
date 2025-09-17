import mongoose from "mongoose";

const advertisementSchema = new mongoose.Schema(
  {
    title: {
      ar: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    description: {
      ar: { type: String, trim: true, default: null },
      en: { type: String, trim: true, default: null },
    },
    source: {
      type: String,
      enum: ["internal", "google"],
      default: "internal",
      required: true,
    },
    googleAd: {
      adSlotId: { type: String, trim: true },
      adFormat: { type: String, trim: true, default: "auto" },
    },
    type: {
      type: String,
      enum: ["banner", "popup", "sidebar", "featured", "inline"],
      required: true,
    },
    position: {
      type: String,
      enum: ["home", "players", "coaches", "profile", "all"],
      required: true,
    },
    media: {
      desktop: {
        url: { type: String, required: true },
        publicId: { type: String, default: null },
        width: { type: Number, default: 0 },
        height: { type: Number, default: 0 },
      },
      mobile: {
        url: { type: String, default: null },
        publicId: { type: String, default: null },
        width: { type: Number, default: 0 },
        height: { type: Number, default: 0 },
      },
    },
    link: {
      url: { type: String, default: null },
      target: {
        type: String,
        enum: ["_blank", "_self"],
        default: "_blank",
      },
    },
    displayPeriod: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    advertiser: {
      name: { type: String, trim: true },
      email: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    pricing: {
      cost: { type: Number, default: 0 },
      currency: { type: String, default: "SAR" },
      isPaid: { type: Boolean, default: false },
      paymentDate: { type: Date, default: null },
      paymentReference: { type: String, default: null },
    },
  },
  {
    timestamps: true,
  }
);

// Performance-optimized indexes
advertisementSchema.index({
  isActive: 1,
  "displayPeriod.startDate": 1,
  "displayPeriod.endDate": 1,
});
advertisementSchema.index({ type: 1, position: 1 });
advertisementSchema.index({ source: 1, position: 1 });
advertisementSchema.index({ priority: -1, createdAt: -1 });
advertisementSchema.index({
  "advertiser.name": "text",
  "title.ar": "text",
  "title.en": "text",
});
// advertisementSchema.index({ "targeting.countries": 1, "targeting.sports": 1 }); // This causes an error on parallel arrays
advertisementSchema.index({ "targeting.countries": 1 });
advertisementSchema.index({ "targeting.sports": 1 });
advertisementSchema.index({ clicks: -1 });
advertisementSchema.index({ views: -1 });

advertisementSchema.virtual("isCurrentlyActive").get(function () {
  const now = new Date();
  return (
    this.isActive &&
    this.displayPeriod.startDate <= now &&
    this.displayPeriod.endDate >= now
  );
});

advertisementSchema.methods.registerClick = async function () {
  this.clicks += 1;
  return this.save();
};

// دالة لتسجيل مشاهدة
advertisementSchema.methods.registerView = async function () {
  this.views += 1;
  return this.save();
};

// Method to get active ads for frontend
advertisementSchema.statics.getActiveAds = async function (
  position,
  limit = 5,
  source = "internal"
) {
  const now = new Date();
  const query = {
    position: { $in: [position, "all"] },
    isActive: true,
    "displayPeriod.startDate": { $lte: now },
    "displayPeriod.endDate": { $gte: now },
    source: source,
  };

  try {
    const ads = await this.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit);
    return ads;
  } catch (error) {
    console.error("Error fetching active ads:", error);
    return [];
  }
};

export default mongoose.model("Advertisement", advertisementSchema);
