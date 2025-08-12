import Joi from 'joi';
import { OFFER_STATUS } from '../config/constants.js';

export const createOfferSchema = Joi.object({
  title: Joi.object({
    en: Joi.string().min(10).max(100).required(),
    ar: Joi.string().min(10).max(100).required()
  }).required(),
  description: Joi.object({
    en: Joi.string().min(10).max(2000).required(),
    ar: Joi.string().min(10).max(2000).required()
  }).required(),
  category: Joi.string()
    .valid(
      'player_wanted',
      'coach_wanted',
      'player_available',
      'coach_available',
      'other'
    )
    .required(),
  targetProfile: Joi.object({
    type: Joi.string().valid('player', 'coach'),
    positions: Joi.array().items(Joi.string()),
    nationality: Joi.string(),
    ageRange: Joi.object({
      min: Joi.number().min(15),
      max: Joi.number().max(70)
    }),
    experienceYears: Joi.object({
      min: Joi.number().min(0),
      max: Joi.number().max(50)
    }),
    salaryRange: Joi.object({
      min: Joi.number().min(0),
      max: Joi.number(),
      currency: Joi.string().default('SAR')
    })
  }),
  offerDetails: Joi.object({
    club: Joi.string(),
    location: Joi.string(),
    contractDuration: Joi.number().min(1).max(60),
    benefits: Joi.array().items(Joi.string()),
    requirements: Joi.array().items(Joi.string())
  }),
  contactInfo: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    whatsapp: Joi.string(),
    preferredContactMethod: Joi.string().valid('email', 'phone', 'whatsapp')
  }).required(),
  expiryDate: Joi.date()
    .min('now')
    .max(
      Joi.ref('$now', { adjust: (value) => value + 90 * 24 * 60 * 60 * 1000 })
    ),
  seo: Joi.object({
    metaTitle: Joi.object({
      en: Joi.string().max(60),
      ar: Joi.string().max(60)
    }),
    metaDescription: Joi.object({
      en: Joi.string().max(160),
      ar: Joi.string().max(160)
    }),
    keywords: Joi.array().items(Joi.string())
  })
});

export const updateOfferSchema = createOfferSchema.keys({
  title: Joi.object({
    en: Joi.string().min(10).max(100),
    ar: Joi.string().min(10).max(100)
  }),
  description: Joi.object({
    en: Joi.string().min(50).max(2000),
    ar: Joi.string().min(50).max(2000)
  }),
  category: Joi.string().valid(
    'player_wanted',
    'coach_wanted',
    'player_available',
    'coach_available',
    'other'
  ),
  contactInfo: Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    phone: Joi.string(),
    whatsapp: Joi.string(),
    preferredContactMethod: Joi.string().valid('email', 'phone', 'whatsapp')
  })
});

export const filterOfferSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  sortBy: Joi.string(),
  search: Joi.string(),
  category: Joi.string(),
  status: Joi.string().valid(...Object.values(OFFER_STATUS)),
  isPromoted: Joi.boolean(),
  nationality: Joi.string(),
  minSalary: Joi.number(),
  maxSalary: Joi.number(),
  location: Joi.string()
});

export const promoteOfferSchema = Joi.object({
  days: Joi.number().min(1).max(365).required(),
  type: Joi.string().valid('featured', 'premium', 'urgent').default('featured')
});

export const unlockContactSchema = Joi.object({
  offerId: Joi.string().required()
});
