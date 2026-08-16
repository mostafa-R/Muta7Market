import Joi from 'joi';

const VALUE_TYPES = ['string', 'number', 'boolean', 'json', 'array'];

export const settingCreateSchema = Joi.object({
  key: Joi.string().trim().lowercase().pattern(/^[a-z0-9]+(\.[a-z0-9]+)+$/).required().messages({
    'string.pattern.base': 'validation.invalidSettingKey',
  }),
  value: Joi.any().required(),
  type: Joi.string().valid(...VALUE_TYPES).required(),
  group: Joi.string().trim().lowercase().max(60).default('general'),
  label: Joi.object({
    en: Joi.string().trim().max(120).allow('', null),
    ar: Joi.string().trim().max(120).allow('', null),
  }).default({}),
  description: Joi.object({
    en: Joi.string().trim().max(500).allow('', null),
    ar: Joi.string().trim().max(500).allow('', null),
  }).default({}),
  isPublic: Joi.boolean().default(false),
  isSecret: Joi.boolean().default(false),
});

export const settingUpdateSchema = Joi.object({
  value: Joi.any(),
  type: Joi.string().valid(...VALUE_TYPES),
  group: Joi.string().trim().lowercase().max(60),
  label: Joi.object({
    en: Joi.string().trim().max(120).allow('', null),
    ar: Joi.string().trim().max(120).allow('', null),
  }),
  description: Joi.object({
    en: Joi.string().trim().max(500).allow('', null),
    ar: Joi.string().trim().max(500).allow('', null),
  }),
  isPublic: Joi.boolean(),
  isSecret: Joi.boolean(),
});

export const settingListQuerySchema = Joi.object({
  group: Joi.string().trim().lowercase().max(60),
  isPublic: Joi.boolean(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(200).default(100),
});

export const settingKeyParamSchema = Joi.object({
  key: Joi.string().trim().lowercase().max(200).required(),
});