// schema.ts
import Joi from "joi";

export const playerFormSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "الاسم مطلوب",
    "string.min": "الاسم يجب أن يكون على الأقل حرفين",
    "string.max": "الاسم طويل جدًا",
  }),
  age: Joi.number().integer().min(16).max(80).required().messages({
    "number.base": "العمر يجب أن يكون رقم",
    "number.empty": "العمر مطلوب",
    "number.min": "العمر يجب أن لا يقل عن 16",
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
    .valid("AVAILABLE", "CONTRACTED", "TRANSFERRED")
    .required()
    .messages({
      "any.only": "الحالة مطلوبة",
      "string.empty": "الحالة مطلوبة",
    }),
  expreiance: Joi.number().integer().min(0).max(30).allow("").messages({
    "number.base": "يجب أن يكون رقم",
    "number.min": "يجب أن يكون أكبر من أو يساوي 0",
    "number.max": "يجب أن يكون أقل من أو يساوي 30",
  }),
  monthlySalary: Joi.object({
    amount: Joi.number().min(0).allow("").messages({
      "number.base": "يجب أن يكون رقم",
      "number.min": "يجب أن لا يكون سالب",
    }),
    currency: Joi.string().allow(""),
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
    videos: Joi.array().items(Joi.object()).allow(""),
    documents: Joi.array().items(Joi.object()).allow(""),
  }),
  socialLinks: Joi.object({
    instagram: Joi.string().allow("").uri({ allowRelative: false }).messages({
      "string.uri": "يجب أن يكون رابط صحيح",
    }),
    twitter: Joi.string().allow("").uri({ allowRelative: false }).messages({
      "string.uri": "يجب أن يكون رابط صحيح",
    }),
    whatsapp: Joi.string().allow(""),
    youtube: Joi.string().allow("").uri({ allowRelative: false }).messages({
      "string.uri": "يجب أن يكون رابط صحيح",
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
      .pattern(/^[0-9]{8,20}$/)
      .messages({
        "string.pattern.base": "رقم الهاتف غير صحيح",
      }),
    agent: Joi.object({
      name: Joi.string().allow(""),
      phone: Joi.string().allow(""),
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
  profilePictureFile: Joi.string(),
});
