import Joi from "joi";

export const subscribeToProSchema = Joi.object({
  playerId: Joi.string().required().messages({
    "any.required": "Player ID is required",
    "string.base": "Player ID must be a string",
  }),
  billingInterval: Joi.string()
    .valid("month", "year")
    .default("month")
    .messages({
      "any.only": "Billing interval must be month or year",
    }),
});

export const subscribeSchema = Joi.object({
  plan: Joi.string()
    .valid("pro", "club", "agent")
    .default("pro")
    .messages({
      "any.only": "Plan must be pro, club, or agent",
    }),
  playerId: Joi.string().allow("", null).optional(),
  billingInterval: Joi.string()
    .valid("month", "year")
    .default("month")
    .messages({
      "any.only": "Billing interval must be month or year",
    }),
});
