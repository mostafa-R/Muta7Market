import { deleteLocalFile } from "../middleware/localUpload.middleware.js";
import SiteSettings from "../models/site-settings.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { handleMediaUpload } from "../utils/localMediaUtils.js";

export const getSiteSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOneOrCreate();
  return res
    .status(200)
    .json(new ApiResponse(200, settings, "تم الحصول على إعدادات الموقع بنجاح"));
});

export const updateSiteSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOneOrCreate();

  if (req.body.siteName) {
    settings.siteName = req.body.siteName;
  }

  if (req.body.contactInfo) {
    settings.contactInfo = {
      ...settings.contactInfo,
      ...req.body.contactInfo,
    };
  }

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

  if (req.body.seo) {
    settings.seo = {
      ...settings.seo,
      ...req.body.seo,
    };
  }

  if (req.body.pricing) {
    settings.pricing = {
      ...settings.pricing,
      ...req.body.pricing,
    };
  }

  if (req.body.maintenance !== undefined) {
    settings.maintenance = {
      ...settings.maintenance,
      ...req.body.maintenance,
    };
  }

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

export const updateSiteLogo = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOneOrCreate();

  if (!req.file) {
    throw new ApiError(400, "يرجى تحميل شعار الموقع");
  }

  if (settings.logo && settings.logo.publicId) {
    await deleteLocalFile(settings.logo.publicId);
  }

  const logoUploadResult = await handleMediaUpload(req.file, req, "image");

  if (!logoUploadResult.url) {
    throw new ApiError(500, "فشل في تحميل شعار الموقع");
  }

  settings.logo = {
    url: logoUploadResult.url,
    publicId: logoUploadResult.publicId,
  };

  await settings.save();

  return res
    .status(200)
    .json(new ApiResponse(200, settings, "تم تحديث شعار الموقع بنجاح"));
});

export const updateSiteFavicon = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOneOrCreate();

  if (!req.file) {
    throw new ApiError(400, "يرجى تحميل أيقونة الموقع");
  }

  if (settings.favicon && settings.favicon.publicId) {
    await deleteLocalFile(settings.favicon.publicId);
  }

  const faviconUploadResult = await handleMediaUpload(req.file, req, "image");

  if (!faviconUploadResult.url) {
    throw new ApiError(500, "فشل في تحميل أيقونة الموقع");
  }

  settings.favicon = {
    url: faviconUploadResult.url,
    publicId: faviconUploadResult.publicId,
  };

  await settings.save();

  return res
    .status(200)
    .json(new ApiResponse(200, settings, "تم تحديث أيقونة الموقع بنجاح"));
});

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

export const restorePricingDefaults = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOneOrCreate();

  settings.pricing = {
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
    promotion_player_premium: {
      price: 150,
      days: 15,
    },
    promotion_coach_premium: {
      price: 150,
      days: 15,
    },

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
    promotion_premium_year: {
      player: 150,
      coach: 150,
    },
    promotion_premium_per_day: {
      player: 10,
      coach: 10,
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

export const restoreSeoDefaults = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOneOrCreate();

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

export const getTranslations = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOneOrCreate();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        settings.translations.custom || {},
        "تم الحصول على الترجمات المخصصة بنجاح"
      )
    );
});

export const updateCustomTranslations = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOneOrCreate();

  if (!req.body.translations || typeof req.body.translations !== "object") {
    throw new ApiError(400, "يرجى توفير بيانات الترجمات بالتنسيق الصحيح");
  }

  const validationErrors = [];
  Object.entries(req.body.translations).forEach(([key, value]) => {
    if (!value || typeof value !== "object") {
      validationErrors.push(`الترجمة للمفتاح "${key}" غير صالحة`);
    } else if (!value.ar || !value.en) {
      validationErrors.push(
        `الترجمة للمفتاح "${key}" يجب أن تحتوي على قيم للعربية والإنجليزية`
      );
    }
  });

  if (validationErrors.length > 0) {
    throw new ApiError(
      400,
      `أخطاء في بيانات الترجمات: ${validationErrors.join(", ")}`
    );
  }

  const cleanedTranslations = {};
  Object.entries(req.body.translations).forEach(([key, value]) => {
    cleanedTranslations[key] = {
      ar: (value.ar || "").trim(),
      en: (value.en || "").trim(),
    };
  });

  settings.translations.custom = {
    ...settings.translations.custom,
    ...cleanedTranslations,
  };

  await settings.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        settings.translations.custom,
        "تم تحديث الترجمات المخصصة بنجاح"
      )
    );
});

export const addTranslation = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOneOrCreate();

  const { key, ar, en } = req.body;

  const trimmedKey = (key || "").trim();
  const trimmedAr = (ar || "").trim();
  const trimmedEn = (en || "").trim();

  if (!trimmedKey) {
    throw new ApiError(400, "يرجى توفير مفتاح للترجمة");
  }

  if (!trimmedAr) {
    throw new ApiError(400, "يرجى توفير القيمة بالعربية");
  }

  if (!trimmedEn) {
    throw new ApiError(400, "يرجى توفير القيمة بالإنجليزية");
  }

  const formattedKey = trimmedKey.toLowerCase().replace(/\s+/g, "_");

  if (!/^[a-z0-9_]+$/.test(formattedKey)) {
    throw new ApiError(
      400,
      "يجب أن يحتوي المفتاح على أحرف إنجليزية صغيرة وأرقام وشرطات سفلية فقط"
    );
  }

  if (
    settings.translations.custom &&
    settings.translations.custom[formattedKey]
  ) {
    throw new ApiError(400, "هذا المفتاح موجود بالفعل");
  }

  if (!settings.translations.custom) {
    settings.translations.custom = {};
  }

  settings.translations.custom[formattedKey] = { ar: trimmedAr, en: trimmedEn };
  await settings.save();

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        key: formattedKey,
        translation: settings.translations.custom[formattedKey],
        originalKey: trimmedKey,
      },
      "تمت إضافة الترجمة بنجاح"
    )
  );
});

export const deleteTranslation = asyncHandler(async (req, res) => {
  const { key } = req.params;

  if (!key || !key.trim()) {
    throw new ApiError(400, "يرجى تحديد مفتاح الترجمة المراد حذفه");
  }

  const trimmedKey = key.trim();

  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = new SiteSettings({});
    await settings.save();
  }

  if (
    !settings.translations?.custom ||
    !settings.translations.custom[trimmedKey]
  ) {
    throw new ApiError(404, "الترجمة غير موجودة");
  }

  const deletedTranslation = { ...settings.translations.custom[trimmedKey] };

  delete settings.translations.custom[trimmedKey];

  if (Object.keys(settings.translations.custom).length === 0) {
    delete settings.translations.custom;
  }

  await settings.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        key: trimmedKey,
        deletedTranslation,
      },
      "تم حذف الترجمة بنجاح"
    )
  );
});

export const restoreTranslationsDefaults = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findOneOrCreate();

  const backup = { ...settings.translations.custom };

  const defaultTranslations = {
    welcome_message: {
      ar: "مرحباً بك في متاح ماركت",
      en: "Welcome to Muta7Market",
    },
    about_us_title: {
      ar: "من نحن",
      en: "About Us",
    },
    contact_us_button: {
      ar: "تواصل معنا",
      en: "Contact Us",
    },

    sports_title: {
      ar: "الرياضات",
      en: "Sports",
    },
    players_title: {
      ar: "اللاعبين",
      en: "Players",
    },
    coaches_title: {
      ar: "المدربين",
      en: "Coaches",
    },
    featured_players: {
      ar: "لاعبين مميزين",
      en: "Featured Players",
    },
    featured_coaches: {
      ar: "مدربين مميزين",
      en: "Featured Coaches",
    },

    view_all_players: {
      ar: "عرض جميع اللاعبين",
      en: "View All Players",
    },
    view_all_coaches: {
      ar: "عرض جميع المدربين",
      en: "View All Coaches",
    },
    view_profile: {
      ar: "عرض الملف الشخصي",
      en: "View Profile",
    },

    football: {
      ar: "كرة القدم",
      en: "Football",
    },
    basketball: {
      ar: "كرة السلة",
      en: "Basketball",
    },
    tennis: {
      ar: "التنس",
      en: "Tennis",
    },
    swimming: {
      ar: "السباحة",
      en: "Swimming",
    },
    volleyball: {
      ar: "الكرة الطائرة",
      en: "Volleyball",
    },

    loading: {
      ar: "جاري التحميل...",
      en: "Loading...",
    },
    error_message: {
      ar: "حدث خطأ، يرجى المحاولة مرة أخرى",
      en: "An error occurred, please try again",
    },
    no_results_found: {
      ar: "لم يتم العثور على نتائج",
      en: "No results found",
    },

    all_rights_reserved: {
      ar: "جميع الحقوق محفوظة",
      en: "All rights reserved",
    },
    privacy_policy: {
      ar: "سياسة الخصوصية",
      en: "Privacy Policy",
    },
    terms_of_service: {
      ar: "شروط الخدمة",
      en: "Terms of Service",
    },
  };

  settings.translations.custom = defaultTranslations;
  await settings.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        restored: settings.translations.custom,
        backup,
      },
      "تم استعادة الترجمات المخصصة إلى الوضع الافتراضي بنجاح"
    )
  );
});
