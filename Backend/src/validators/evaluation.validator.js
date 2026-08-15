import Joi from "joi";

const ratingItemSchema = Joi.object({
  category: Joi.string().trim().required().messages({
    "string.empty": "Rating category is required",
    "any.required": "Rating category is required",
  }),
  score: Joi.number().min(1).max(10).required().messages({
    "number.min": "Score must be between 1 and 10",
    "number.max": "Score must be between 1 and 10",
    "any.required": "Score is required",
  }),
});

const contextSchema = Joi.object({
  type: Joi.string().valid(
    "trial",
    "interview",
    "training",
    "general",
    "transfer"
  ),
  ref: Joi.string().hex().length(24).allow(null),
  title: Joi.string().trim().max(120).allow("", null),
});

export const createEvaluationSchema = Joi.object({
  subjectType: Joi.string()
    .valid("player", "coach", "scout", "agent", "academy")
    .required(),
  subject: Joi.string().hex().length(24).required(),
  context: contextSchema,
  ratings: Joi.array().items(ratingItemSchema).min(1).max(20),
  overallRating: Joi.number().min(1).max(10).required(),
  strengths: Joi.array().items(Joi.string().trim().max(200)).max(20),
  weaknesses: Joi.array().items(Joi.string().trim().max(200)).max(20),
  notes: Joi.string().trim().max(2000).allow("", null),
  recommendation: Joi.string().valid(
    "strongly_recommend",
    "recommend",
    "neutral",
    "not_recommend"
  ),
  status: Joi.string().valid("draft", "submitted"),
});

export const updateEvaluationSchema = Joi.object({
  context: contextSchema,
  ratings: Joi.array().items(ratingItemSchema).min(1).max(20),
  overallRating: Joi.number().min(1).max(10),
  strengths: Joi.array().items(Joi.string().trim().max(200)).max(20),
  weaknesses: Joi.array().items(Joi.string().trim().max(200)).max(20),
  notes: Joi.string().trim().max(2000).allow("", null),
  recommendation: Joi.string().valid(
    "strongly_recommend",
    "recommend",
    "neutral",
    "not_recommend"
  ),
  status: Joi.string().valid("draft", "submitted"),
});

export const getEvaluationsBySubjectSchema = Joi.object({
  subjectType: Joi.string()
    .valid("player", "coach", "scout", "agent", "academy")
    .required(),
  subject: Joi.string().hex().length(24).required(),
  status: Joi.string().valid("draft", "submitted"),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

export const getEvaluationByIdSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

export const getSubjectRatingStatsSchema = Joi.object({
  subjectType: Joi.string()
    .valid("player", "coach", "scout", "agent", "academy")
    .required(),
  subject: Joi.string().hex().length(24).required(),
});
