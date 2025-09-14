// validations/term.validation.js
import Joi from "joi";

const localizedRequired = Joi.object({
  ar: Joi.string().trim().min(1).required(),
  en: Joi.string().trim().min(1).required(),
}).required();

const localizedPartial = Joi.object({
  ar: Joi.string().trim().min(1),
  en: Joi.string().trim().min(1),
}).min(1);

const listItemCreate = Joi.object({
  title: localizedRequired,
  description: localizedRequired,
  icon: Joi.string().trim().optional(),
});

const listItemPatch = Joi.object({
  title: localizedPartial,
  description: localizedPartial,
  icon: Joi.string().trim(),
}).min(1);

const termItemCreate = Joi.object({
  title: localizedRequired,
  description: localizedRequired,
  list: Joi.array().items(listItemCreate).default([]),
});

export const createTermSchema = Joi.object({
  headTitle: localizedRequired,
  headDescription: localizedRequired,
  terms: Joi.array().items(termItemCreate).default([]),
});

// PUT = full replace (same as create)
export const putTermSchema = createTermSchema;

// PATCH = partial; if terms included, expect full items
export const patchTermSchema = Joi.object({
  headTitle: localizedPartial,
  headDescription: localizedPartial,
  terms: Joi.array().items(termItemCreate),
}).min(1);

// Query (pagination)
export const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

// Params (id)
export const idParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});
