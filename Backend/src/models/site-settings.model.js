import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema(
  {
    siteName: {
      ar: { type: String, required: true, default: "متاح ماركت" },
      en: { type: String, required: true, default: "Muta7Market" },
    },
    logo: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    favicon: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },

    contactInfo: {
      email: { type: String, default: null },
      phone: { type: String, default: null },
      address: {
        ar: { type: String, default: null },
        en: { type: String, default: null },
      },
      socialMedia: {
        facebook: { type: String, default: null },
        twitter: { type: String, default: null },
        instagram: { type: String, default: null },
        youtube: { type: String, default: null },
        linkedin: { type: String, default: null },
      },
    },

    termsAndConditions: {
      ar: { type: String, default: null },
      en: { type: String, default: null },
      lastUpdated: { type: Date, default: Date.now },
    },
    privacyPolicy: {
      ar: { type: String, default: null },
      en: { type: String, default: null },
      lastUpdated: { type: Date, default: Date.now },
    },

    seo: {
      metaTitle: {
        ar: { type: String, default: null },
        en: { type: String, default: null },
      },
      metaDescription: {
        ar: { type: String, default: null },
        en: { type: String, default: null },
      },
      keywords: [String],
      googleAnalyticsId: { type: String, default: null },
    },

    pricing: {
      contacts_access: {
        price: { type: Number, default: 190 },
        days: { type: Number, default: 365 },
      },
      listing_player: {
        price: { type: Number, default: 140 },
        days: { type: Number, default: 365 },
      },
      listing_coach: {
        price: { type: Number, default: 190 },
        days: { type: Number, default: 365 },
      },
      promotion_player: {
        price: { type: Number, default: 100 },
        days: { type: Number, default: 15 },
      },
      promotion_coach: {
        price: { type: Number, default: 100 },
        days: { type: Number, default: 15 },
      },
    },

    maintenance: {
      isEnabled: { type: Boolean, default: false },
      message: {
        ar: {
          type: String,
          default: "الموقع قيد الصيانة حالياً، يرجى المحاولة لاحقاً",
        },
        en: {
          type: String,
          default: "Site is under maintenance, please try again later",
        },
      },
    },

    translations: {
      custom: { type: mongoose.Schema.Types.Mixed, default: {} },
    },

    ads: {
      googleAds: {
        enabled: {
          type: Boolean,
          default: false,
        },
      },
      internalAdsRatio: {
        type: Number,
        default: 100,
        min: 0,
        max: 100,
      },
    },
  },
  {
    timestamps: true,
  }
);

siteSettingsSchema.statics.findOneOrCreate = async function () {
  const settings = await this.findOne();
  if (settings) {
    return settings;
  }

  return await this.create({});
};

export default mongoose.model("SiteSettings", siteSettingsSchema);
