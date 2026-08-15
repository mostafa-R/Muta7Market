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
    targeting: {
      type: new mongoose.Schema(
        {
          countries: { type: [String], default: [] },
          cities: { type: [String], default: [] },
          sports: { type: [String], default: [] },
        },
        { _id: false }
      ),
      default: () => ({ countries: [], cities: [], sports: [] }),
    },
    trial: {
      type: new mongoose.Schema(
        {
          isTrial: { type: Boolean, default: false },
          academyName: { type: String, trim: true, default: null },
          registrationLink: { type: String, trim: true, default: null },
          ageGroups: { type: [String], default: [] },
          startDate: { type: Date, default: null },
          endDate: { type: Date, default: null },
        },
        { _id: false }
      ),
      default: () => ({
        isTrial: false,
        academyName: null,
        registrationLink: null,
        ageGroups: [],
        startDate: null,
        endDate: null,
      }),
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

advertisementSchema.methods.registerView = async function () {
  this.views += 1;
  return this.save();
};

advertisementSchema.statics.getActiveAds = async function (
  position,
  limit = 5,
  source = "internal",
  geo = {}
) {
  const now = new Date();
  const query = {
    position: { $in: [position, "all"] },
    isActive: true,
    "displayPeriod.startDate": { $lte: now },
    "displayPeriod.endDate": { $gte: now },
  };
  if (source) query.source = source;
  if (geo.trialOnly === true || geo.trialOnly === "true") {
    query["trial.isTrial"] = true;
  }
  if (geo.sport) {
    query.$or = [{ "targeting.sports": { $in: [geo.sport] } }, { "targeting.sports": { $size: 0 } }];
  }

  try {
    const ads = await this.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 4);

    const country = geo.country;
    const city = geo.city;

    const filtered = ads.filter((ad) => {
      const targeting = ad.targeting || {};
      const countries = targeting.countries || [];
      const cities = targeting.cities || [];
      if (country && countries.length && !countries.includes(country)) {
        return false;
      }
      if (city && cities.length && !cities.includes(city)) {
        return false;
      }
      return true;
    });

    return filtered.slice(0, parseInt(limit, 10) || 5);
  } catch (error) {
    console.error("Error fetching active ads:", error);
    return [];
  }
};

export default mongoose.model("Advertisement", advertisementSchema);
