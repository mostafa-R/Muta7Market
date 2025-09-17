import Joi from "joi";

// مخطط التحقق من صحة إنشاء إعلان جديد
export const createAdvertisementSchema = Joi.object({
  title: Joi.object({
    ar: Joi.string().required().messages({
      "string.empty": "يجب توفير عنوان الإعلان باللغة العربية",
      "any.required": "يجب توفير عنوان الإعلان باللغة العربية",
    }),
    en: Joi.string().required().messages({
      "string.empty": "يجب توفير عنوان الإعلان باللغة الإنجليزية",
      "any.required": "يجب توفير عنوان الإعلان باللغة الإنجليزية",
    }),
  }).required(),

  description: Joi.object({
    ar: Joi.string().allow("", null),
    en: Joi.string().allow("", null),
  }),

  source: Joi.string().valid("internal", "google").default("internal"),

  googleAd: Joi.when("source", {
    is: "google",
    then: Joi.object({
      adSlotId: Joi.string().required().messages({
        "string.empty": "يجب توفير معرف الوحدة الإعلانية لإعلانات Google",
        "any.required": "يجب توفير معرف الوحدة الإعلانية لإعلانات Google",
      }),
      adFormat: Joi.string().default("auto"),
    }).required(),
    otherwise: Joi.forbidden(),
  }),

  type: Joi.string()
    .valid("banner", "popup", "sidebar", "featured", "inline")
    .required()
    .messages({
      "string.empty": "يجب توفير نوع الإعلان",
      "any.required": "يجب توفير نوع الإعلان",
      "any.only": "نوع الإعلان غير صالح",
    }),

  position: Joi.string()
    .valid("home", "players", "coaches", "profile", "all")
    .required()
    .messages({
      "string.empty": "يجب توفير موقع الإعلان",
      "any.required": "يجب توفير موقع الإعلان",
      "any.only": "موقع الإعلان غير صالح",
    }),

  link: Joi.when("source", {
    is: "internal",
    then: Joi.object({
      url: Joi.string().uri().allow("", null),
      target: Joi.string().valid("_blank", "_self").default("_blank"),
    }),
    otherwise: Joi.forbidden(),
  }),

  displayPeriod: Joi.object({
    startDate: Joi.date().required().messages({
      "date.base": "تاريخ بداية العرض يجب أن يكون تاريخاً صالحاً",
      "any.required": "يجب توفير تاريخ بداية العرض",
    }),
    endDate: Joi.date().greater(Joi.ref("startDate")).required().messages({
      "date.base": "تاريخ نهاية العرض يجب أن يكون تاريخاً صالحاً",
      "date.greater": "تاريخ نهاية العرض يجب أن يكون بعد تاريخ البداية",
      "any.required": "يجب توفير تاريخ نهاية العرض",
    }),
  }).required(),

  isActive: Joi.boolean(),

  priority: Joi.number().integer().min(0),

  advertiser: Joi.object({
    name: Joi.string().required().messages({
      "string.empty": "يجب توفير اسم المعلن",
      "any.required": "يجب توفير اسم المعلن",
    }),
    email: Joi.string().email().allow("", null),
    phone: Joi.string().allow("", null),
  }).required(),

  pricing: Joi.object({
    cost: Joi.number().min(0),
    currency: Joi.string().default("SAR"),
    isPaid: Joi.boolean().default(false),
    paymentDate: Joi.date().allow(null),
    paymentReference: Joi.string().allow("", null),
  }),
});

// مخطط التحقق من صحة تحديث إعلان
export const updateAdvertisementSchema = Joi.object({
  title: Joi.object({
    ar: Joi.string(),
    en: Joi.string(),
  }),

  description: Joi.object({
    ar: Joi.string().allow("", null),
    en: Joi.string().allow("", null),
  }),

  type: Joi.string().valid("banner", "popup", "sidebar", "featured", "inline"),

  position: Joi.string().valid("home", "players", "coaches", "profile", "all"),

  link: Joi.object({
    url: Joi.string().uri().allow("", null),
    target: Joi.string().valid("_blank", "_self"),
  }),

  displayPeriod: Joi.object({
    startDate: Joi.date(),
    endDate: Joi.date().greater(Joi.ref("startDate")),
  }),

  isActive: Joi.boolean(),

  priority: Joi.number().integer().min(0),

  advertiser: Joi.object({
    name: Joi.string(),
    email: Joi.string().email().allow("", null),
    phone: Joi.string().allow("", null),
  }),

  pricing: Joi.object({
    cost: Joi.number().min(0),
    currency: Joi.string(),
    isPaid: Joi.boolean(),
    paymentDate: Joi.date().allow(null),
    paymentReference: Joi.string().allow("", null),
  }),
});
