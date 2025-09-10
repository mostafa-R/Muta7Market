import Joi from "joi";
import { OFFER_STATUS } from "../config/constants.js";

// مخطط التحقق من صحة إنشاء عرض ترويجي جديد
export const createPromotionalOfferSchema = Joi.object({
  name: Joi.object({
    ar: Joi.string().required().messages({
      "string.empty": "يجب توفير اسم العرض باللغة العربية",
      "any.required": "يجب توفير اسم العرض باللغة العربية",
    }),
    en: Joi.string().required().messages({
      "string.empty": "يجب توفير اسم العرض باللغة الإنجليزية",
      "any.required": "يجب توفير اسم العرض باللغة الإنجليزية",
    }),
  }).required(),

  description: Joi.object({
    ar: Joi.string().allow("", null),
    en: Joi.string().allow("", null),
  }),

  code: Joi.string().required().messages({
    "string.empty": "يجب توفير رمز العرض",
    "any.required": "يجب توفير رمز العرض",
  }),

  type: Joi.string()
    .valid("percentage", "fixed_amount", "free")
    .required()
    .messages({
      "string.empty": "يجب توفير نوع العرض",
      "any.required": "يجب توفير نوع العرض",
      "any.only": "نوع العرض غير صالح",
    }),

  value: Joi.number()
    .min(0)
    .when("type", {
      is: Joi.valid("percentage", "fixed_amount"),
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "number.base": "قيمة العرض يجب أن تكون رقماً",
      "number.min": "قيمة العرض يجب أن تكون أكبر من أو تساوي صفر",
      "any.required": "يجب توفير قيمة العرض",
    }),

  maxDiscount: Joi.number().min(0).allow(null),

  applicableTo: Joi.array()
    .items(
      Joi.string().valid(
        "contacts_access_year",
        "listing_year_player",
        "listing_year_coach",
        "promotion_year_player",
        "promotion_year_coach",
        "promotion_per_day_player",
        "promotion_per_day_coach"
      )
    )
    .required()
    .messages({
      "array.base": "يجب توفير قائمة بالخدمات التي ينطبق عليها العرض",
      "any.required": "يجب توفير قائمة بالخدمات التي ينطبق عليها العرض",
    }),

  validityPeriod: Joi.object({
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

  usageLimit: Joi.object({
    perUser: Joi.number().integer().min(1),
    total: Joi.number().integer().min(1).allow(null),
  }),

  minimumPurchase: Joi.number().min(0),

  status: Joi.string().valid(...Object.values(OFFER_STATUS)),

  isActive: Joi.boolean(),
});

// مخطط التحقق من صحة تحديث عرض ترويجي
export const updatePromotionalOfferSchema = Joi.object({
  name: Joi.object({
    ar: Joi.string(),
    en: Joi.string(),
  }),

  description: Joi.object({
    ar: Joi.string().allow("", null),
    en: Joi.string().allow("", null),
  }),

  type: Joi.string().valid("percentage", "fixed_amount", "free"),

  value: Joi.number().min(0),

  maxDiscount: Joi.number().min(0).allow(null),

  applicableTo: Joi.array().items(
    Joi.string().valid(
      "contacts_access_year",
      "listing_year_player",
      "listing_year_coach",
      "promotion_year_player",
      "promotion_year_coach",
      "promotion_per_day_player",
      "promotion_per_day_coach"
    )
  ),

  validityPeriod: Joi.object({
    startDate: Joi.date(),
    endDate: Joi.date().greater(Joi.ref("startDate")),
  }),

  usageLimit: Joi.object({
    perUser: Joi.number().integer().min(1),
    total: Joi.number().integer().min(1).allow(null),
  }),

  minimumPurchase: Joi.number().min(0),

  status: Joi.string().valid(...Object.values(OFFER_STATUS)),

  isActive: Joi.boolean(),
});

// مخطط التحقق من صحة التحقق من رمز العرض الترويجي
export const validatePromotionalOfferCodeSchema = Joi.object({
  code: Joi.string().required().messages({
    "string.empty": "يجب توفير رمز العرض",
    "any.required": "يجب توفير رمز العرض",
  }),

  serviceType: Joi.string()
    .valid(
      "contacts_access_year",
      "listing_year_player",
      "listing_year_coach",
      "promotion_year_player",
      "promotion_year_coach",
      "promotion_per_day_player",
      "promotion_per_day_coach"
    )
    .required()
    .messages({
      "string.empty": "يجب توفير نوع الخدمة",
      "any.required": "يجب توفير نوع الخدمة",
      "any.only": "نوع الخدمة غير صالح",
    }),

  price: Joi.number().min(0).required().messages({
    "number.base": "السعر يجب أن يكون رقماً",
    "number.min": "السعر يجب أن يكون أكبر من أو يساوي صفر",
    "any.required": "يجب توفير السعر",
  }),
});
