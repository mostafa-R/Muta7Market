import Joi from "joi";

export const createRoomSchema = Joi.object({
  offerId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "offerId must be a valid ObjectId",
      "any.required": "offerId is required",
    }),
  participantIds: Joi.array()
    .items(
      Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .messages({ "string.pattern.base": "participantIds must be valid ObjectIds" })
    )
    .min(1)
    .max(10)
    .default([]),
});

export const sendMessageSchema = Joi.object({
  message: Joi.string().trim().min(1).max(4000).required(),
});

export const getRoomsQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(20),
});