import Joi from "joi";

// مخطط التحقق من صحة إنشاء مستند قانوني جديد
export const createLegalDocumentSchema = Joi.object({
  type: Joi.string()
    .valid("terms", "privacy", "refund", "cookies", "disclaimer", "custom")
    .required()
    .messages({
      "string.empty": "يجب توفير نوع المستند",
      "any.required": "يجب توفير نوع المستند",
      "any.only": "نوع المستند غير صالح",
    }),

  title: Joi.object({
    ar: Joi.string().required().messages({
      "string.empty": "يجب توفير عنوان المستند باللغة العربية",
      "any.required": "يجب توفير عنوان المستند باللغة العربية",
    }),
    en: Joi.string().required().messages({
      "string.empty": "يجب توفير عنوان المستند باللغة الإنجليزية",
      "any.required": "يجب توفير عنوان المستند باللغة الإنجليزية",
    }),
  }).required(),

  content: Joi.object({
    ar: Joi.string().required().messages({
      "string.empty": "يجب توفير محتوى المستند باللغة العربية",
      "any.required": "يجب توفير محتوى المستند باللغة العربية",
    }),
    en: Joi.string().required().messages({
      "string.empty": "يجب توفير محتوى المستند باللغة الإنجليزية",
      "any.required": "يجب توفير محتوى المستند باللغة الإنجليزية",
    }),
  }).required(),

  version: Joi.string().required().messages({
    "string.empty": "يجب توفير رقم إصدار المستند",
    "any.required": "يجب توفير رقم إصدار المستند",
  }),

  isActive: Joi.boolean(),

  isDefault: Joi.boolean(),

  effectiveDate: Joi.date(),

  seo: Joi.object({
    metaTitle: Joi.object({
      ar: Joi.string().allow("", null),
      en: Joi.string().allow("", null),
    }),
    metaDescription: Joi.object({
      ar: Joi.string().allow("", null),
      en: Joi.string().allow("", null),
    }),
    keywords: Joi.array().items(Joi.string()),
  }),
});

// مخطط التحقق من صحة تحديث مستند قانوني
export const updateLegalDocumentSchema = Joi.object({
  title: Joi.object({
    ar: Joi.string(),
    en: Joi.string(),
  }),

  content: Joi.object({
    ar: Joi.string(),
    en: Joi.string(),
  }),

  version: Joi.string(),

  isActive: Joi.boolean(),

  isDefault: Joi.boolean(),

  effectiveDate: Joi.date(),

  changeDescription: Joi.object({
    ar: Joi.string().allow("", null),
    en: Joi.string().allow("", null),
  }),

  seo: Joi.object({
    metaTitle: Joi.object({
      ar: Joi.string().allow("", null),
      en: Joi.string().allow("", null),
    }),
    metaDescription: Joi.object({
      ar: Joi.string().allow("", null),
      en: Joi.string().allow("", null),
    }),
    keywords: Joi.array().items(Joi.string()),
  }),
});
