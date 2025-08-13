import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().lowercase().required(),
  phone: Joi.string()
    .pattern(/^(\+?\d{1,3}[- ]?)?\d{7,14}$/)
    .required()
    .messages({
      "string.pattern.base": "Please provide a valid phone number",
    }),
  password: Joi.string()
    .min(8)
    .required()
    .pattern(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
    )
    .messages({
      "string.pattern.base":
        "Password must contain at least one letter, one number and one special character (@$!%*?&)",
    }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

export const verifyEmailSchema = Joi.object({
  otp: Joi.string().required(),
});

export const verifyPhoneSchema = Joi.object({
  otp: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
});

export const resetPasswordSchema = Joi.object({
  otp: Joi.string().required(),
  password: Joi.string()
    .min(8)
    .required()
    .pattern(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
    )
    .messages({
      "string.pattern.base":
        "Password must contain at least one letter, one number and one special character (@$!%*?&)",
    }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .required()
    .pattern(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
    )
    .messages({
      "string.pattern.base":
        "Password must contain at least one letter, one number and one special character (@$!%*?&)",
    }),
  confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 50 characters",
  }),
  phone: Joi.string()
    .pattern(/^(\+?\d{1,3}[- ]?)?\d{7,14}$/)
    .messages({
      "string.pattern.base": "Please provide a valid phone number",
    }),
  bio: Joi.string().trim().max(200).messages({
    "string.max": "Bio cannot exceed 200 characters",
  }),
  profileImage: Joi.string().uri().allow(null, "").messages({
    "string.uri": "Profile image must be a valid URL",
  }),
  email: Joi.string().email().trim().messages({
    "string.email": "Please provide a valid email address",
  }),
  oldPassword: Joi.string().when("newPassword", {
    is: Joi.exist(),
    then: Joi.required(),
  }),
  newPassword: Joi.string().min(8).max(128),
  confirmPassword: Joi.string().valid(Joi.ref("newPassword")),
});