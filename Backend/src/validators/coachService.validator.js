import Joi from "joi";

const bilingualString = Joi.string().trim().min(2).max(120);

export const createCoachServiceSchema = Joi.object({
  title: Joi.object({
    en: bilingualString.required().messages({
      "any.required": "English title is required",
    }),
    ar: bilingualString.required().messages({
      "any.required": "Arabic title is required",
    }),
  }).required(),
  description: Joi.object({
    en: Joi.string().max(2000).allow(null, "").default(null),
    ar: Joi.string().max(2000).allow(null, "").default(null),
  }).default({ en: null, ar: null }),
  category: Joi.string()
    .valid(
      "private_training",
      "group_session",
      "trial_session",
      "fitness_program",
      "tactical_analysis",
      "other"
    )
    .default("other"),
  price: Joi.object({
    amount: Joi.number().min(0).default(0),
    currency: Joi.string().default("SAR"),
  }).default({ amount: 0, currency: "SAR" }),
  durationMinutes: Joi.number().min(15).max(600).default(60),
  mode: Joi.string().valid("online", "in_person").default("in_person"),
  location: Joi.object({
    city: Joi.string().max(100).allow(null, "").default(null),
    area: Joi.string().max(100).allow(null, "").default(null),
  }).default({ city: null, area: null }),
  isActive: Joi.boolean().default(true),
});

export const updateCoachServiceSchema = createCoachServiceSchema.keys({
  title: Joi.object({
    en: bilingualString.optional(),
    ar: bilingualString.optional(),
  })
    .min(1)
    .optional(),
  category: Joi.string()
    .valid(
      "private_training",
      "group_session",
      "trial_session",
      "fitness_program",
      "tactical_analysis",
      "other"
    )
    .optional(),
  price: Joi.object({
    amount: Joi.number().min(0).optional(),
    currency: Joi.string().optional(),
  }).optional(),
  durationMinutes: Joi.number().min(15).max(600).optional(),
  mode: Joi.string().valid("online", "in_person").optional(),
  location: Joi.object({
    city: Joi.string().max(100).allow(null, "").optional(),
    area: Joi.string().max(100).allow(null, "").optional(),
  }).optional(),
  isActive: Joi.boolean().optional(),
});