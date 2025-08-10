// constants/validation.js
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
