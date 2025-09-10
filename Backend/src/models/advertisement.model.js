import mongoose from "mongoose";

const advertisementSchema = new mongoose.Schema(
  {
    title: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
    },
    description: {
      ar: { type: String, default: null },
      en: { type: String, default: null },
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
      name: { type: String, required: true },
      email: { type: String, default: null },
      phone: { type: String, default: null },
    },
    pricing: {
      cost: { type: Number, default: 0 },
      currency: { type: String, default: "SAR" },
      isPaid: { type: Boolean, default: false },
      paymentDate: { type: Date, default: null },
      paymentReference: { type: String, default: null },
    },
    targeting: {
      countries: [String],
      sports: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sport" }],
      ageRange: {
        min: { type: Number, default: null },
        max: { type: Number, default: null },
      },
      gender: {
        type: String,
        enum: ["male", "female", "all"],
        default: "all",
      },
    },
  },
  {
    timestamps: true,
  }
);

advertisementSchema.index({
  isActive: 1,
  "displayPeriod.startDate": 1,
  "displayPeriod.endDate": 1,
});
advertisementSchema.index({ type: 1, position: 1 });
advertisementSchema.index({ "targeting.countries": 1, "targeting.sports": 1 });


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

// دالة للحصول على الإعلانات النشطة حالياً
advertisementSchema.statics.getActiveAds = async function (
  position = null,
  limit = 5
) {
  const now = new Date();
  const query = {
    isActive: true,
    "displayPeriod.startDate": { $lte: now },
    "displayPeriod.endDate": { $gte: now },
  };

  if (position) {
    query.position = { $in: [position, "all"] };
  }

  return this.find(query)
    .sort({ priority: -1, "displayPeriod.startDate": 1 })
    .limit(limit);
};

export default mongoose.model("Advertisement", advertisementSchema);
