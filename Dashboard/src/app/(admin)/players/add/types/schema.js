import Joi from "joi";

export const playerFormSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "الاسم مطلوب",
    "string.min": "الاسم يجب أن يكون على الأقل حرفين",
    "string.max": "الاسم طويل جدًا",
  }),

  age: Joi.number().integer().min(15).max(50).required().messages({
    "number.base": "العمر يجب أن يكون رقم",
    "number.empty": "العمر مطلوب",
    "number.min": "العمر يجب أن لا يقل عن 15",
    "number.max": "العمر يجب أن لا يزيد عن 50",
  }),
  gender: Joi.string().valid("male", "female").required().messages({
    "any.only": "الرجاء اختيار الجنس",
    "string.empty": "الرجاء اختيار الجنس",
  }),
  nationality: Joi.string().min(2).required().messages({
    "string.empty": "الجنسية مطلوبة",
    "string.min": "الجنسية يجب أن تكون على الأقل حرفين",
  }),
  jop: Joi.string().valid("player", "coach").required().messages({
    "any.only": "الفئة مطلوبة",
    "string.empty": "الفئة مطلوبة",
  }),
  position: Joi.string().allow("").max(100).optional(),
  status: Joi.string()
    .valid("available", "contracted", "transferred")
    .required()
    .messages({
      "any.only": "الحالة مطلوبة",
      "string.empty": "الحالة مطلوبة",
    }),
  experience: Joi.number().min(0).max(30).allow(null).optional().messages({
    "number.base": "يجب أن تكون سنوات الخبرة رقمًا",
    "number.min": "يجب أن تكون الخبرة 0 أو أكثر",
    "number.max": "يجب ألا تتجاوز الخبرة 30 عامًا",
  }),
  monthlySalary: Joi.object({
    amount: Joi.number().min(0).allow(0).optional().messages({
      "number.base": "يجب أن يكون المبلغ رقمًا",
      "number.min": "يجب أن لا يكون المبلغ سالبًا",
    }),
    currency: Joi.string().default("SAR").optional(),
  }).optional(),
  yearSalary: Joi.object({
    amount: Joi.number().min(0).allow(0).optional().messages({
      "number.base": "يجب أن يكون المبلغ رقمًا",
      "number.min": "يجب أن لا يكون المبلغ سالبًا",
    }),
    currency: Joi.string().default("SAR").optional(),
  }).optional(),
  contractEndDate: Joi.string().allow("", null).optional().isoDate().messages({
    "date.base": "يجب أن يكون تاريخ انتهاء العقد صالحًا",
  }),
  transferredTo: Joi.object({
    club: Joi.string().allow("", null).max(100).optional(),
    date: Joi.string().allow("", null).optional().isoDate().messages({
      "date.base": "يجب أن يكون تاريخ الانتقال صالحًا",
    }),
    amount: Joi.number().min(0).allow(0, "").optional().messages({
      "number.base": "يجب أن يكون المبلغ رقمًا",
      "number.min": "يجب أن لا يكون المبلغ سالبًا",
    }),
  }).optional(),

  socialLinks: Joi.object({
    instagram: Joi.string()
      .allow("", null)
      .uri()
      .pattern(/^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/)
      .optional()
      .messages({
        "string.uri": "يجب أن يكون رابط Instagram صحيحًا",
        "string.pattern.base": "يجب أن يكون رابط Instagram صحيحًا",
      }),
    twitter: Joi.string()
      .allow("", null)
      .uri()
      .pattern(/^(https?:\/\/)?(www\.)?(twitter|x)\.com\/[a-zA-Z0-9._]+\/?$/)
      .optional()
      .messages({
        "string.uri": "يجب أن يكون رابط Twitter صحيحًا",
        "string.pattern.base": "يجب أن يكون رابط Twitter صحيحًا",
      }),
    whatsapp: Joi.string().allow("", null).optional().messages({
      "string.pattern.base": "رقم WhatsApp غير صحيح",
    }),
    youtube: Joi.string()
      .allow("", null)
      .uri()
      .pattern(/^(https?:\/\/)?(www\.)?youtube\.com\/[a-zA-Z0-9_-]+\/?$/)
      .optional()
      .messages({
        "string.uri": "يجب أن يكون رابط YouTube صحيحًا",
        "string.pattern.base": "يجب أن يكون رابط YouTube صحيحًا",
      }),
  }).optional(),
  isPromoted: Joi.object({
    status: Joi.boolean().optional(),
    startDate: Joi.string().allow("", null).optional().isoDate().messages({
      "date.base": "يجب أن يكون تاريخ بدء الترويج صالحًا",
    }),
    endDate: Joi.string().allow("", null).optional().isoDate().messages({
      "date.base": "يجب أن يكون تاريخ انتهاء الترويج صالحًا",
    }),
    type: Joi.string().allow("", null).optional(),
  }).optional(),
  contactInfo: Joi.object({
    isHidden: Joi.boolean().optional(),
    email: Joi.string()
      .allow("", null)
      .email({ tlds: false })
      .required()
      .messages({
        "string.email": "البريد الإلكتروني غير صحيح",
        "string.empty": "البريد الإلكتروني مطلوب",
      }),
    phone: Joi.string().allow("", null).optional().messages({
      "string.pattern.base": "رقم الهاتف غير صحيح",
    }),
    agent: Joi.object({
      name: Joi.string().allow("", null).optional(),
      phone: Joi.string().allow("", null).optional().messages({
        "string.pattern.base": "رقم هاتف الوكيل غير صحيح",
      }),
      email: Joi.string()
        .allow("", null)
        .email({ tlds: false })
        .optional()
        .messages({
          "string.email": "بريد الوكيل غير صحيح",
        }),
    }).optional(),
  }).optional(),
  game: Joi.string().min(2).required().messages({
    "string.empty": "الرياضة مطلوبة",
    "string.min": "الرياضة يجب أن تكون على الأقل حرفين",
  }),
  isActive: Joi.boolean().optional(),
  views: Joi.number().min(0).optional(),
  seo: Joi.object({
    metaTitle: Joi.object({
      en: Joi.string().max(60).allow("").optional(),
      ar: Joi.string().max(60).allow("").optional(),
    }).optional(),
    metaDescription: Joi.object({
      en: Joi.string().max(160).allow("").optional(),
      ar: Joi.string().max(160).allow("").optional(),
    }).optional(),
    keywords: Joi.array().items(Joi.string()).optional(),
  }).optional(),
  profilePicturePreview: Joi.string().allow("").optional(),
  profilePictureFile: Joi.any().optional(),
  agreeToTerms: Joi.boolean().valid(true).required().messages({
    "any.only": "يجب الموافقة على الشروط والأحكام",
    "any.required": "الموافقة على الشروط مطلوبة",
  }),
});
