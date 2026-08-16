import Joi from 'joi';

export const mediaUpdateSchema = Joi.object({
  title: Joi.object({
    en: Joi.string().trim().max(150).allow('', null),
    ar: Joi.string().trim().max(150).allow('', null),
  }),
  description: Joi.object({
    en: Joi.string().trim().max(1000).allow('', null),
    ar: Joi.string().trim().max(1000).allow('', null),
  }),
  category: Joi.string().trim().max(40),
  isPublic: Joi.boolean(),
});

export const idParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

export const playerIdParamSchema = Joi.object({
  playerId: Joi.string().hex().length(24).required(),
});

export const orderNumberParamSchema = Joi.object({
  orderNumber: Joi.string().trim().max(60).required(),
});

export const adminBanSchema = Joi.object({
  reason: Joi.string().trim().max(300).allow('', null),
});

export const adminQuerySchema = Joi.object({
  role: Joi.string().valid('player', 'coach', 'club', 'agent', 'admin'),
  q: Joi.string().trim().max(100),
  isActive: Joi.boolean(),
  status: Joi.string(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(20),
});
