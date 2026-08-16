import Joi from 'joi';
import { ALL_ROLES, EMAIL_REGEX, LANGUAGES } from '../config/constants.js';

export const registerSchema = Joi.object({
  email: Joi.string().email().max(120).required().messages({
    'string.email': 'validation.invalidEmail',
    'any.required': 'validation.fieldRequired',
  }),
  password: Joi.string().min(8).max(100).required().messages({
    'string.min': 'validation.minLength',
    'any.required': 'validation.fieldRequired',
  }),
  role: Joi.string().valid(...ALL_ROLES).required().messages({
    'any.only': 'validation.invalidRole',
    'any.required': 'validation.fieldRequired',
  }),
  firstName: Joi.string().trim().max(60).allow('', null),
  lastName: Joi.string().trim().max(60).allow('', null),
  displayName: Joi.string().trim().max(120).allow('', null),
  lang: Joi.string().valid(...LANGUAGES).default('en'),
  termsAccepted: Joi.boolean().valid(true).required().messages({
    'any.only': 'validation.termsRequired',
    'any.required': 'validation.termsRequired',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const verifyEmailSchema = Joi.object({
  token: Joi.string().required(),
});

export const resendVerificationSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).max(100).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'validation.passwordMismatch',
  }),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(100).required(),
});
