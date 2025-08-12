
import Joi from "joi";

export const UserSchema = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string()
    .min(1)
    .required()
    .messages({ "string.empty": "الاسم الكامل مطلوب" }),
  profileImage: Joi.string().uri().allow("").optional(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "البريد الإلكتروني غير صالح",
    }),
  phone: Joi.string().allow("").optional(),
  role: Joi.string().required(),
  isEmailVerified: Joi.boolean().required(),
  isPhoneVerified: Joi.boolean().required(),
  phoneVerificationOTP: Joi.string().allow("").optional(),
  phoneVerificationExpires: Joi.date().iso().allow(null).optional(),
  isActive: Joi.boolean().required(),
  refreshTokens: Joi.array().items(Joi.string()).optional(),
  __v: Joi.number().optional(),
  createdAt: Joi.date().iso().required(),
  updatedAt: Joi.date().iso().required(),
  lastLogin: Joi.date().iso().allow(null).optional(),
  address: Joi.string().allow("").optional(),
  occupation: Joi.string().allow("").optional(),
  website: Joi.string().uri().allow("").optional(),
  bio: Joi.string().allow("").optional(),
  dateOfBirth: Joi.date().iso().allow(null).optional(),
});

export const PendingPaymentSchema = Joi.object({
  id: Joi.string().required(),
  itemName: Joi.string().required(),
  price: Joi.number().positive().required(),
  orderDate: Joi.date().iso().required(),
});

export const ProfileFormSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .required()
    .messages({ "string.empty": "الاسم الكامل مطلوب" }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "البريد الإلكتروني غير صالح",
    }),
  phone: Joi.string().allow("").optional(),
  password: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .allow("")
    .optional()
    .messages({
      "string.pattern.base":
        "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير، حرف صغير، رقم، ورمز خاص",
    }),
  address: Joi.string().allow("").optional(),
  occupation: Joi.string().allow("").optional(),
  website: Joi.string().uri().allow("").optional(),
  bio: Joi.string().allow("").optional(),
  dateOfBirth: Joi.date().iso().allow(null).optional(),
});

export const PlayerSchema = Joi.object({
  _id: Joi.string().required(),
  user: Joi.string().allow(null).optional(), // جعل الحقل اختياريًا لتجنب الأخطاء
  name: Joi.alternatives().try(
    Joi.object({
      en: Joi.string().min(1).allow("").optional().messages({
        "string.min": "الاسم (بالإنجليزية) يجب أن يكون على الأقل حرفًا واحدًا",
      }),
      ar: Joi.string().min(1).allow("").optional().messages({
        "string.min": "الاسم (بالعربية) يجب أن يكون على الأقل حرفًا واحدًا",
      }),
    }),
    Joi.string().allow("").optional() // دعم name كسلسلة نصية للتعامل مع البيانات القديمة
  ).optional(),
  age: Joi.number().integer().min(15).max(50).allow(null).optional().messages({
    "number.base": "العمر يجب أن يكون رقمًا",
    "number.min": "العمر يجب أن لا يقل عن 15",
    "number.max": "العمر يجب أن لا يزيد عن 50",
  }),
  gender: Joi.string().valid("Male", "Female").allow(null).optional().messages({
    "any.only": "الرجاء اختيار الجنس",
  }),
  nationality: Joi.string().min(2).allow("").optional().messages({
    "string.min": "الجنسية يجب أن تكون على الأقل حرفين",
  }),
  jop: Joi.string().valid("player", "coach").allow(null).optional().messages({
    "any.only": "الفئة مطلوبة",
  }),
  position: Joi.alternatives().try(
    Joi.object({
      en: Joi.string().allow("").optional().messages({
        "string.max": "المنصب (بالإنجليزية) طويل جدًا",
      }),
      ar: Joi.string().allow("").optional().messages({
        "string.max": "المنصب (بالعربية) طويل جدًا",
      }),
    }),
    Joi.string().allow("").optional() // دعم position كسلسلة نصية للتعامل مع البيانات القديمة
  ).optional(),
  status: Joi.string()
    .valid("available", "contracted", "transferred")
    .allow(null)
    .optional()
    .messages({
      "any.only": "الحالة مطلوبة",
    }),
  expreiance: Joi.number().min(0).max(30).allow(null).optional().messages({
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
  contractEndDate: Joi.date().iso().allow(null).optional().messages({
    "date.base": "يجب أن يكون تاريخ انتهاء العقد صالحًا",
  }),
  transferredTo: Joi.object({
    club: Joi.string().allow(null).optional(),
    date: Joi.date().iso().allow(null).optional().messages({
      "date.base": "يجب أن يكون تاريخ الانتقال صالحًا",
    }),
    amount: Joi.number().min(0).allow(0).optional().messages({
      "number.base": "يجب أن يكون المبلغ رقمًا",
      "number.min": "يجب أن لا يكون المبلغ سالبًا",
    }),
  }).optional(),
  media: Joi.object({
    profileImage: Joi.object({
      url: Joi.string().allow(null).optional(),
      publicId: Joi.string().allow(null).optional(),
    }).optional(),
    videos: Joi.array()
      .items(
        Joi.object({
          url: Joi.string().allow("").optional(),
          publicId: Joi.string().allow("").optional(),
          title: Joi.string().allow("").optional(),
          duration: Joi.number().min(0).allow(0).optional(),
          uploadedAt: Joi.date().iso().allow(null).optional(),
        })
      )
      .optional(),
    documents: Joi.array()
      .items(
        Joi.object({
          url: Joi.string().allow("").optional(),
          publicId: Joi.string().allow("").optional(),
          title: Joi.string().allow("").optional(),
          type: Joi.string().allow("").optional(),
          uploadedAt: Joi.date().iso().allow(null).optional(),
        })
      )
      .optional(),
  }).optional(),
  socialLinks: Joi.object({
    instagram: Joi.string()
      .allow(null)
      .uri()
      .pattern(/^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/)
      .optional()
      .messages({
        "string.uri": "يجب أن يكون رابط Instagram صحيحًا",
        "string.pattern.base": "يجب أن يكون رابط Instagram صحيحًا",
      }),
    twitter: Joi.string()
      .allow(null)
      .uri()
      .pattern(/^(https?:\/\/)?(www\.)?(twitter|x)\.com\/[a-zA-Z0-9._]+\/?$/)
      .optional()
      .messages({
        "string.uri": "يجب أن يكون رابط Twitter صحيحًا",
        "string.pattern.base": "يجب أن يكون رابط Twitter صحيحًا",
      }),
    whatsapp: Joi.string().allow(null).optional().messages({
      "string.pattern.base": "رقم WhatsApp غير صحيح",
    }),
    youtube: Joi.string()
      .allow(null)
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
    startDate: Joi.date().iso().allow(null).optional(),
    endDate: Joi.date().iso().allow(null).optional(),
    type: Joi.string().allow(null).optional(),
  }).optional(),
  contactInfo: Joi.object({
    isHidden: Joi.boolean().optional(),
    email: Joi.string().allow(null).email({ tlds: false }).optional().messages({
      "string.email": "البريد الإلكتروني غير صحيح",
    }),
    phone: Joi.string().allow(null).optional().messages({
      "string.pattern.base": "رقم الهاتف غير صحيح",
    }),
    agent: Joi.object({
      name: Joi.string().allow(null).optional(),
      phone: Joi.string().allow(null).optional().messages({
        "string.pattern.base": "رقم هاتف الوكيل غير صحيح",
      }),
      email: Joi.string().allow(null).email({ tlds: false }).optional().messages({
        "string.email": "بريد الوكيل غير صحيح",
      }),
    }).optional(),
  }).optional(),
  game: Joi.string().min(2).allow("").optional().messages({
    "string.min": "الرياضة يجب أن تكون على الأقل حرفين",
  }),
  views: Joi.number().min(0).optional(),
  isActive: Joi.boolean().optional(),
  createdAt: Joi.date().iso().allow(null).optional(),
  updatedAt: Joi.date().iso().allow(null).optional(),
});

