// validations/about.validation.js
import Joi from "joi";

const localizedRequired = Joi.object({
  ar: Joi.string().trim().min(1).required(),
  en: Joi.string().trim().min(1).required(),
}).required();

const localizedPartial = Joi.object({
  ar: Joi.string().trim().min(1),
  en: Joi.string().trim().min(1),
}).min(1);

const itemCreate = Joi.object({
  name: localizedRequired,
  description: localizedRequired,
  icon: Joi.string().trim().optional(),
});

const itemPatch = Joi.object({
  name: localizedPartial,
  description: localizedPartial,
  icon: Joi.string().trim(),
}).min(1);

const sectionCreate = Joi.object({
  title: localizedRequired,
  description: localizedRequired,
  items: Joi.array().items(itemCreate).default([]),
});

const sectionPatch = Joi.object({
  title: localizedPartial,
  description: localizedPartial,
  items: Joi.array().items(itemPatch),
}).min(1);

export const createAboutSchema = Joi.object({
  title: localizedRequired,
  description: localizedRequired,
  list: Joi.array().items(sectionCreate).default([]),
});

export const putAboutSchema = createAboutSchema;

export const patchAboutSchema = Joi.object({
  title: localizedPartial,
  description: localizedPartial,
  list: Joi.array().items(sectionCreate), // If provided, expect full items per section
}).min(1);

export const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

export const idParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});
