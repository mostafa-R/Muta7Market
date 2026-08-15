import Joi from "joi";
import { PUBLIC_REGISTERABLE_ROLES } from "../config/constants.js";

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().lowercase().required(),
  phone: Joi.string()
    .required()
    .messages({
      "string.empty": "Phone number is required",
    }),
  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters",
    "string.empty": "Password is required",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
  }),
  role: Joi.string()
    .valid(...PUBLIC_REGISTERABLE_ROLES)
    .optional()
    .messages({
      "any.only": "Role must be one of: player, coach, club, agent, scout",
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().optional().messages({
    "string.empty": "Refresh token cannot be empty",
  }),
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
  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters",
    "string.empty": "Password is required",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters",
    "string.empty": "Password is required",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 50 characters",
  }),
  phone: Joi.string().messages({
    "string.empty": "Phone number is required",
  }),
  bio: Joi.string().trim().allow(null, "").max(200).messages({
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
  newPassword: Joi.string().min(8).max(128).messages({
    "string.min": "Password must be at least 8 characters",
    "string.max": "Password cannot exceed 128 characters",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("newPassword")),
});
