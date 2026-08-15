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
