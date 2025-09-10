import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema(
  {
    // معلومات الموقع الأساسية
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

    // معلومات الاتصال
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

    // الشروط والأحكام وسياسة الخصوصية
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

    // إعدادات SEO
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

    // إعدادات الرسوم والاشتراكات (تستخدم بدلاً من القيم الثابتة في ملف constants.js)
    pricing: {
      contacts_access_year: { type: Number, default: 190 },
      listing_year: {
        player: { type: Number, default: 140 },
        coach: { type: Number, default: 190 },
      },
      promotion_year: {
        player: { type: Number, default: 100 },
        coach: { type: Number, default: 100 },
      },
      promotion_per_day: {
        player: { type: Number, default: 15 },
        coach: { type: Number, default: 15 },
      },
      promotion_default_days: { type: Number, default: 15 },
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
  },
  {
    timestamps: true,
  }
);

// نضمن وجود سجل واحد فقط للإعدادات
siteSettingsSchema.statics.findOneOrCreate = async function () {
  const settings = await this.findOne();
  if (settings) {
    return settings;
  }

  return await this.create({});
};

export default mongoose.model("SiteSettings", siteSettingsSchema);
