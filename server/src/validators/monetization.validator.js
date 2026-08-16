import Joi from 'joi';
import { AD_TYPE, CURRENCIES, SUBSCRIPTION_PERIOD } from '../config/constants.js';

export const subscribeSchema = Joi.object({
  planCode: Joi.string().trim().max(60).required(),
  period: Joi.string().valid(...Object.values(SUBSCRIPTION_PERIOD)).default('monthly'),
  autoRenew: Joi.boolean().default(false),
});

export const subscriptionInvoiceSchema = Joi.object({
  planCode: Joi.string().trim().max(60).required(),
  period: Joi.string().valid(...Object.values(SUBSCRIPTION_PERIOD)).default('monthly'),
  autoRenew: Joi.boolean().default(false),
  clientMobile: Joi.string().trim().max(20).allow('', null),
});

export const cancelSubscriptionSchema = Joi.object({
  reason: Joi.string().trim().max(500).allow('', null),
});

export const planAdminSchema = Joi.object({
  code: Joi.string().trim().lowercase().max(60).required(),
  name: Joi.object({
    en: Joi.string().trim().max(120).required(),
    ar: Joi.string().trim().max(120).required(),
  }).required(),
  description: Joi.object({
    en: Joi.string().trim().max(500).allow('', null),
    ar: Joi.string().trim().max(500).allow('', null),
  }),
  targetRole: Joi.string().valid('player', 'coach', 'club', 'agent').required(),
  priceMonthly: Joi.number().min(0).required(),
  priceYearly: Joi.number().min(0).default(0),
  currency: Joi.string().valid(...CURRENCIES).default('USD'),
  features: Joi.array().items(Joi.string().trim().max(120)).max(20),
  isActive: Joi.boolean().default(true),
});

export const advertisementSchema = Joi.object({
  type: Joi.string().valid(...Object.values(AD_TYPE)).default('banner'),
  adType: Joi.string().valid('banner', 'customHtml', 'googleAdsense').default('banner'),
  placement: Joi.string()
    .valid('homeBanner', 'homeSidebar', 'searchResults', 'videoPreroll', 'playerProfile', 'coachProfile', 'clubProfile', 'mobileBanner')
    .default('homeBanner'),
  title: Joi.object({
    en: Joi.string().trim().max(150).required(),
    ar: Joi.string().trim().max(150).required(),
  }).required(),
  description: Joi.object({
    en: Joi.string().trim().max(1000).allow('', null),
    ar: Joi.string().trim().max(1000).allow('', null),
  }),
  image: Joi.string().trim().max(300).allow('', null),
  link: Joi.string().trim().max(300).allow('', null),
  customHtml: Joi.string().trim().max(10000).allow('', null),
  googleSlot: Joi.object({
    clientId: Joi.string().trim().max(120).allow('', null),
    slotId: Joi.string().trim().max(120).allow('', null),
    format: Joi.string().valid('auto', 'horizontal', 'vertical', 'rectangle', 'fluid').default('auto'),
  }),
  geo: Joi.object({
    country: Joi.string().trim().max(60).allow('', null),
    city: Joi.string().trim().max(60).allow('', null),
  }),
  targetRoles: Joi.array().items(Joi.string().valid('player', 'coach', 'club', 'agent')).max(4),
  targetCountries: Joi.array().items(Joi.string().trim().uppercase().max(3)).max(50),
  priority: Joi.number().min(0).max(1000).default(0),
  trial: Joi.string().hex().length(24).allow(null),
  maxImpressions: Joi.number().min(0).default(0),
  maxClicks: Joi.number().min(0).default(0),
  startsAt: Joi.date().required(),
  endsAt: Joi.date().greater(Joi.ref('startsAt')).required().messages({
    'date.greater': 'validation.invalidDate',
  }),
  status: Joi.string().valid('draft', 'active', 'paused', 'expired'),
});
