// schema.ts
import Joi from "joi";

export const playerFormSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "الاسم مطلوب",
    "string.min": "الاسم يجب أن يكون على الأقل حرفين",
    "string.max": "الاسم طويل جدًا",
  }),
  age: Joi.number().integer().min(10).max(80).required().messages({
    "number.base": "العمر يجب أن يكون رقم",
    "number.empty": "العمر مطلوب",
    "number.min": "العمر يجب أن لا يقل عن 10",
    "number.max": "العمر يجب أن لا يزيد عن 80",
  }),
  gender: Joi.string().valid("Male", "Female").required().messages({
    "any.only": "الرجاء اختيار الجنس",
    "string.empty": "الرجاء اختيار الجنس",
  }),
  nationality: Joi.string().min(2).required().messages({
    "string.empty": "الجنسية مطلوبة",
  }),
  category: Joi.string().valid("player", "coach").required().messages({
    "any.only": "الفئة مطلوبة",
    "string.empty": "الفئة مطلوبة",
  }),
  position: Joi.string().allow("").max(100),
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
    amount: Joi.number().min(0).allow("").messages({
      "number.base": "يجب أن يكون رقم",
      "number.min": "يجب أن لا يكون سالب",
    }),
    currency: Joi.string().allow(""),
  }),
  yearSalary: Joi.number().min(0).allow("").messages({
    "number.base": "يجب أن يكون رقم",
    "number.min": "يجب أن لا يكون سالب",
  }),
  contractEndDate: Joi.string().allow(""),
  transferredTo: Joi.object({
    club: Joi.string().allow("").max(100),
    date: Joi.string().allow(""),
    amount: Joi.alternatives().try(Joi.string(), Joi.number()).allow(""),
  }),
  media: Joi.object({
    profileImage: Joi.object({
      url: Joi.string().allow(""),
      publicId: Joi.string().allow(""),
    }),
    videos: Joi.array()
      .items(
        Joi.object({
          url: Joi.string().allow(""),
          publicId: Joi.string().allow(""),
          title: Joi.string().allow(""),
          duration: Joi.number().allow(0),
          uploadedAt: Joi.string().allow(""),
          file: Joi.any().optional(),
        })
      )
      .allow(""),
    documents: Joi.array()
      .items(
        Joi.object({
          url: Joi.string().allow(""),
          publicId: Joi.string().allow(""),
          title: Joi.string().allow(""),
          type: Joi.string().allow(""),
          uploadedAt: Joi.string().allow(""),
          file: Joi.any().optional(),
        })
      )
      .allow(""),
  }),
  socialLinks: Joi.object({
    instagram: Joi.string()
      .allow("")
      .uri()
      .pattern(/^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/)
      .messages({
        "string.uri": "يجب أن يكون رابط Instagram صحيحًا",
        "string.pattern.base": "يجب أن يكون رابط Instagram صحيحًا",
      }),
    twitter: Joi.string()
      .allow("")
      .uri()
      .pattern(/^(https?:\/\/)?(www\.)?(twitter|x)\.com\/[a-zA-Z0-9._]+\/?$/)
      .messages({
        "string.uri": "يجب أن يكون رابط Twitter صحيحًا",
        "string.pattern.base": "يجب أن يكون رابط Twitter صحيحًا",
      }),
    whatsapp: Joi.string()
      .allow("")
     
      .messages({
        "string.pattern.base": "رقم WhatsApp غير صحيح",
      }),
    youtube: Joi.string()
      .allow("")
      .uri()
      .pattern(
        /^(https?:\/\/)?(www\.)?youtube\.com\/[a-zA-Z0-9_-]+\/?$/
      )
      .messages({
        "string.uri": "يجب أن يكون رابط YouTube صحيحًا",
        "string.pattern.base": "يجب أن يكون رابط YouTube صحيحًا",
      }),
  }),
  isPromoted: Joi.object({
    status: Joi.boolean(),
    startDate: Joi.string().allow(""),
    endDate: Joi.string().allow(""),
    type: Joi.string().allow(""),
  }),
  contactInfo: Joi.object({
    isHidden: Joi.boolean(),
    email: Joi.string().allow("").email({ tlds: false }).messages({
      "string.email": "البريد الإلكتروني غير صحيح",
    }),
    phone: Joi.string()
      .allow("")
     
      .messages({
        "string.pattern.base": "رقم الهاتف غير صحيح",
      }),
    agent: Joi.object({
      name: Joi.string().allow(""),
      phone: Joi.string()
        .allow("")
        
        .messages({
          "string.pattern.base": "رقم هاتف الوكيل غير صحيح",
        }),
      email: Joi.string().allow("").email({ tlds: false }).messages({
        "string.email": "بريد الوكيل غير صحيح",
      }),
    }),
  }),
  game: Joi.string().min(2).required().messages({
    "string.empty": "الرياضة مطلوبة",
  }),
  agreeToTerms: Joi.boolean().valid(true).messages({
    "any.only": "يجب الموافقة على الشروط والأحكام",
  }),
  profilePicturePreview: Joi.string().allow(""),
  profilePictureFile: Joi.any().optional(),
});
