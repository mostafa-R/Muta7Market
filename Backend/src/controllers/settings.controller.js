import { deleteFromCloudinary } from "../middleware/localUpload.middleware.js";
import SiteSettings from "../models/site-settings.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { handleMediaUpload } from "../utils/localMediaUtils.js";

// الحصول على الإعدادات العامة
export const getSiteSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOneOrCreate();
  return res
    .status(200)
    .json(new ApiResponse(200, settings, "تم الحصول على إعدادات الموقع بنجاح"));
});

// تحديث الإعدادات العامة
export const updateSiteSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOneOrCreate();

  // تحديث معلومات الموقع الأساسية
  if (req.body.siteName) {
    settings.siteName = req.body.siteName;
  }

  // تحديث معلومات الاتصال
  if (req.body.contactInfo) {
    settings.contactInfo = {
      ...settings.contactInfo,
      ...req.body.contactInfo,
    };
  }

  // تحديث الشروط والأحكام وسياسة الخصوصية
  if (req.body.termsAndConditions) {
    settings.termsAndConditions = {
      ...settings.termsAndConditions,
      ...req.body.termsAndConditions,
      lastUpdated: Date.now(),
    };
  }

  if (req.body.privacyPolicy) {
    settings.privacyPolicy = {
      ...settings.privacyPolicy,
      ...req.body.privacyPolicy,
      lastUpdated: Date.now(),
    };
  }

  // تحديث إعدادات SEO
  if (req.body.seo) {
    settings.seo = {
      ...settings.seo,
      ...req.body.seo,
    };
  }

  // تحديث إعدادات الرسوم والاشتراكات
  if (req.body.pricing) {
    settings.pricing = {
      ...settings.pricing,
      ...req.body.pricing,
    };
  }

  // تحديث إعدادات الصيانة
  if (req.body.maintenance !== undefined) {
    settings.maintenance = {
      ...settings.maintenance,
      ...req.body.maintenance,
    };
  }

  // تحديث الترجمات المخصصة
  if (req.body.translations) {
    settings.translations = {
      ...settings.translations,
      ...req.body.translations,
    };
  }

  await settings.save();

  return res
    .status(200)
    .json(new ApiResponse(200, settings, "تم تحديث إعدادات الموقع بنجاح"));
});

// تحديث شعار الموقع
export const updateSiteLogo = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOneOrCreate();

  if (!req.file) {
    throw new ApiError(400, "يرجى تحميل شعار الموقع");
  }

  // حذف الشعار القديم إذا كان موجوداً
  if (settings.logo && settings.logo.publicId) {
    await deleteFromCloudinary(settings.logo.publicId);
  }

  // رفع الشعار الجديد
  const logoUploadResult = await handleMediaUpload(req.file, req, "image");

  if (!logoUploadResult.url) {
    throw new ApiError(500, "فشل في تحميل شعار الموقع");
  }

  // تحديث معلومات الشعار في الإعدادات
  settings.logo = {
    url: logoUploadResult.url,
    publicId: logoUploadResult.publicId,
  };

  await settings.save();

  return res
    .status(200)
    .json(new ApiResponse(200, settings, "تم تحديث شعار الموقع بنجاح"));
});

// تحديث أيقونة الموقع
export const updateSiteFavicon = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOneOrCreate();

  if (!req.file) {
    throw new ApiError(400, "يرجى تحميل أيقونة الموقع");
  }

  // حذف الأيقونة القديمة إذا كانت موجودة
  if (settings.favicon && settings.favicon.publicId) {
    await deleteFromCloudinary(settings.favicon.publicId);
  }

  // رفع الأيقونة الجديدة
  const faviconUploadResult = await handleMediaUpload(req.file, req, "image");

  if (!faviconUploadResult.url) {
    throw new ApiError(500, "فشل في تحميل أيقونة الموقع");
  }

  // تحديث معلومات الأيقونة في الإعدادات
  settings.favicon = {
    url: faviconUploadResult.url,
    publicId: faviconUploadResult.publicId,
  };

  await settings.save();

  return res
    .status(200)
    .json(new ApiResponse(200, settings, "تم تحديث أيقونة الموقع بنجاح"));
});

// الحصول على إعدادات الرسوم والاشتراكات
export const getPricingSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOneOrCreate();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        settings.pricing,
        "تم الحصول على إعدادات الرسوم والاشتراكات بنجاح"
      )
    );
});

// تحديث إعدادات الرسوم والاشتراكات
export const updatePricingSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOneOrCreate();

  if (!req.body.pricing) {
    throw new ApiError(400, "يرجى توفير بيانات الرسوم والاشتراكات");
  }

  settings.pricing = {
    ...settings.pricing,
    ...req.body.pricing,
  };

  await settings.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        settings.pricing,
        "تم تحديث إعدادات الرسوم والاشتراكات بنجاح"
      )
    );
});

// استعادة إعدادات الرسوم إلى الوضع الافتراضي
export const restorePricingDefaults = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOneOrCreate();

  // القيم الافتراضية للرسوم والاشتراكات
  settings.pricing = {
    // الهيكل الجديد للأسعار والمدد
    contacts_access: {
      price: 190,
      days: 365,
    },
    listing_player: {
      price: 140,
      days: 365,
    },
    listing_coach: {
      price: 190,
      days: 365,
    },
    promotion_player: {
      price: 100,
      days: 15,
    },
    promotion_coach: {
      price: 100,
      days: 15,
    },

    // القيم القديمة للتوافق مع الكود القديم
    contacts_access_year: 190,
    listing_year: {
      player: 140,
      coach: 190,
    },
    promotion_year: {
      player: 100,
      coach: 100,
    },
    promotion_per_day: {
      player: 15,
      coach: 15,
    },
    promotion_default_days: 15,
  };

  await settings.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        settings.pricing,
        "تم استعادة إعدادات الرسوم إلى الوضع الافتراضي بنجاح"
      )
    );
});

// الحصول على الشروط والأحكام وسياسة الخصوصية
export const getLegalSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOneOrCreate();

  const legalSettings = {
    termsAndConditions: settings.termsAndConditions,
    privacyPolicy: settings.privacyPolicy,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        legalSettings,
        "تم الحصول على الشروط والأحكام وسياسة الخصوصية بنجاح"
      )
    );
});

// تحديث الشروط والأحكام
export const updateTermsAndConditions = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOneOrCreate();

  if (!req.body.termsAndConditions) {
    throw new ApiError(400, "يرجى توفير بيانات الشروط والأحكام");
  }

  settings.termsAndConditions = {
    ...settings.termsAndConditions,
    ...req.body.termsAndConditions,
    lastUpdated: Date.now(),
  };

  await settings.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        settings.termsAndConditions,
        "تم تحديث الشروط والأحكام بنجاح"
      )
    );
});

// تحديث سياسة الخصوصية
export const updatePrivacyPolicy = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOneOrCreate();

  if (!req.body.privacyPolicy) {
    throw new ApiError(400, "يرجى توفير بيانات سياسة الخصوصية");
  }

  settings.privacyPolicy = {
    ...settings.privacyPolicy,
    ...req.body.privacyPolicy,
    lastUpdated: Date.now(),
  };

  await settings.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        settings.privacyPolicy,
        "تم تحديث سياسة الخصوصية بنجاح"
      )
    );
});

// تحديث إعدادات SEO
export const updateSeoSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOneOrCreate();

  if (!req.body.seo) {
    throw new ApiError(400, "يرجى توفير بيانات SEO");
  }

  settings.seo = {
    ...settings.seo,
    ...req.body.seo,
  };

  await settings.save();

  return res
    .status(200)
    .json(new ApiResponse(200, settings.seo, "تم تحديث إعدادات SEO بنجاح"));
});

// استعادة إعدادات SEO إلى الوضع الافتراضي (قيم فارغة)
export const restoreSeoDefaults = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOneOrCreate();

  // إعادة تعيين إعدادات SEO إلى قيم فارغة
  settings.seo = {
    metaTitle: {
      ar: "",
      en: "",
    },
    metaDescription: {
      ar: "",
      en: "",
    },
    keywords: [],
    googleAnalyticsId: "",
  };

  await settings.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        settings.seo,
        "تم استعادة إعدادات SEO إلى الوضع الافتراضي بنجاح"
      )
    );
});

// تحديث حالة الصيانة
export const updateMaintenanceMode = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOneOrCreate();

  if (req.body.maintenance === undefined) {
    throw new ApiError(400, "يرجى توفير بيانات وضع الصيانة");
  }

  settings.maintenance = {
    ...settings.maintenance,
    ...req.body.maintenance,
  };

  await settings.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, settings.maintenance, "تم تحديث وضع الصيانة بنجاح")
    );
});

// تحديث الترجمات المخصصة
export const updateCustomTranslations = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOneOrCreate();

  if (!req.body.translations) {
    throw new ApiError(400, "يرجى توفير بيانات الترجمات");
  }

  settings.translations.custom = {
    ...settings.translations.custom,
    ...req.body.translations,
  };

  await settings.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        settings.translations,
        "تم تحديث الترجمات المخصصة بنجاح"
      )
    );
});
