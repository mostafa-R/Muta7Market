import Joi from 'joi';
import { KYC_DOC_TYPES, RATING_TYPES, TRIAL_STATUS } from '../config/constants.js';

export const kycSubmitSchema = Joi.object({
  orgName: Joi.string().trim().max(120).allow('', null),
  docTypes: Joi.array().items(Joi.string().valid(...Object.values(KYC_DOC_TYPES))).min(1).max(5).required(),
});

export const kycReviewSchema = Joi.object({
  action: Joi.string().valid('approve', 'reject').required(),
  note: Joi.string().trim().max(500).allow('', null),
});

export const trialSchema = Joi.object({
  playerUserId: Joi.string().hex().length(24).required(),
  offerId: Joi.string().hex().length(24).allow(null),
  scheduledAt: Joi.date().min('now').required().messages({
    'date.min': 'validation.dateInFuture',
    'any.required': 'validation.fieldRequired',
  }),
  durationMinutes: Joi.number().min(15).max(600).default(90),
  location: Joi.object({
    venue: Joi.string().trim().max(200).allow('', null),
    country: Joi.string().trim().max(60).allow('', null),
    city: Joi.string().trim().max(60).allow('', null),
  }),
  notes: Joi.string().trim().max(2000).allow('', null),
});

export const trialStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(TRIAL_STATUS)).required(),
  outcome: Joi.string().valid('positive', 'negative', 'neutral', '').default(''),
  notes: Joi.string().trim().max(2000).allow('', null),
});

export const ratingSchema = Joi.object({
  toUserId: Joi.string().hex().length(24).required(),
  type: Joi.string().valid(...Object.values(RATING_TYPES)).required(),
  offerId: Joi.string().hex().length(24).allow(null),
  score: Joi.number().min(1).max(5).required(),
  comment: Joi.string().trim().max(1000).allow('', null),
});
