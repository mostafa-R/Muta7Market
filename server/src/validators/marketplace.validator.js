import Joi from 'joi';
import { CURRENCIES, OFFER_TYPE } from '../config/constants.js';

export const searchPlayersSchema = Joi.object({
  q: Joi.string().trim().max(100),
  sportCode: Joi.string().trim().max(40),
  position: Joi.string().trim().max(40),
  heightMin: Joi.number().min(100).max(250),
  heightMax: Joi.number().min(100).max(250),
  weightMin: Joi.number().min(30).max(250),
  weightMax: Joi.number().min(30).max(250),
  preferredFoot: Joi.string().valid('left', 'right', 'both'),
  physicalStatus: Joi.string().valid('available', 'injured'),
  contractStatus: Joi.string().valid('freeAgent', 'contracted', 'onLoan'),
  ageMin: Joi.number().min(14).max(60),
  ageMax: Joi.number().min(14).max(60),
  country: Joi.string().trim().max(60),
  city: Joi.string().trim().max(60),
  minRating: Joi.number().min(1).max(5),
  featuredOnly: Joi.boolean().default(false),
  sort: Joi.string().valid('rating', 'views', 'newest', 'featured', 'height'),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(20),
});

export const searchCoachesSchema = Joi.object({
  q: Joi.string().trim().max(100),
  sportCode: Joi.string().trim().max(40),
  country: Joi.string().trim().max(60),
  city: Joi.string().trim().max(60),
  minExperience: Joi.number().min(0).max(70),
  minRating: Joi.number().min(1).max(5),
  sort: Joi.string().valid('rating', 'experience', 'newest'),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(20),
});

export const shortlistSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  description: Joi.string().trim().max(500).allow('', null),
  isPrivate: Joi.boolean().default(true),
});

export const shortlistMemberSchema = Joi.object({
  playerProfileId: Joi.string().hex().length(24).required(),
});

export const offerSchema = Joi.object({
  playerProfileId: Joi.string().hex().length(24).required(),
  type: Joi.string().valid(...Object.values(OFFER_TYPE)).required(),
  salaryPerYear: Joi.number().min(0).default(0),
  currency: Joi.string().valid(...CURRENCIES).default('USD'),
  contractDurationMonths: Joi.number().min(1).max(120).default(12),
  transferFee: Joi.number().min(0).default(0),
  bonus: Joi.number().min(0).default(0),
  notes: Joi.object({
    en: Joi.string().trim().max(2000).allow('', null),
    ar: Joi.string().trim().max(2000).allow('', null),
  }),
  expiresAt: Joi.date().min('now').allow(null).messages({ 'date.min': 'validation.dateInFuture' }),
});

export const createNegotiationSchema = Joi.object({
  offerId: Joi.string().hex().length(24).allow(null),
  playerUserId: Joi.string().hex().length(24).allow(null),
}).custom((value, helpers) => {
  if (!value.offerId && !value.playerUserId) {
    return helpers.error('any.required');
  }
  return value;
}, 'at least one of offerId or playerUserId');

export const offerRespondSchema = Joi.object({
  action: Joi.string().valid('accept', 'decline').required(),
  note: Joi.string().trim().max(1000).allow('', null),
});

export const messageSchema = Joi.object({
  body: Joi.string().trim().min(1).max(5000).required(),
});

export const contactRequestSchema = Joi.object({
  playerProfileId: Joi.string().hex().length(24).required(),
  message: Joi.string().trim().max(1000).allow('', null),
});

export const contactRespondSchema = Joi.object({
  response: Joi.string().trim().max(1000).required(),
});
