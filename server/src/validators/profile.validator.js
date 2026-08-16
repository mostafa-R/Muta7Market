import Joi from 'joi';
import {
  CONTRACT_STATUS,
  CURRENCIES,
  PREFERRED_FOOT,
  PREFERRED_HAND,
  PHYSICAL_STATUS,
} from '../config/constants.js';

const localized = (max = 2000) =>
  Joi.object({
    en: Joi.string().trim().max(max).allow('', null),
    ar: Joi.string().trim().max(max).allow('', null),
  });

const dateUpToNow = Joi.date().max('now').messages({
  'date.max': 'validation.dateInPast',
});

export const updateMeSchema = Joi.object({
  firstName: Joi.string().trim().max(60).allow('', null),
  lastName: Joi.string().trim().max(60).allow('', null),
  displayName: Joi.string().trim().max(120).allow('', null),
  lang: Joi.string().valid('en', 'ar'),
  avatar: Joi.string().trim().allow('', null),
});

export const playerProfileSchema = Joi.object({
  sportCode: Joi.string().trim().max(40).required(),
  primaryPosition: Joi.string().trim().max(40).required(),
  secondaryPositions: Joi.array().items(Joi.string().trim().max(40)).max(5),
  heightCm: Joi.number().min(100).max(250),
  weightKg: Joi.number().min(30).max(250),
  preferredFoot: Joi.string().valid(...Object.values(PREFERRED_FOOT)),
  preferredHand: Joi.string().valid(...Object.values(PREFERRED_HAND)),
  physicalStatus: Joi.string().valid(...Object.values(PHYSICAL_STATUS)),
  injuryNote: Joi.string().trim().max(300).allow('', null),
  contractStatus: Joi.string().valid(...Object.values(CONTRACT_STATUS)),
  currentClub: Joi.string().trim().max(100).allow('', null),
  contractEndDate: Joi.date().min('now').allow(null).messages({ 'date.min': 'validation.dateInFuture' }),
  nationality: Joi.string().trim().max(60).allow('', null),
  country: Joi.string().trim().max(60).allow('', null),
  city: Joi.string().trim().max(60).allow('', null),
  birthDate: dateUpToNow.required(),
  about: localized(2000),
  careerHistory: Joi.array().items(
    Joi.object({
      club: Joi.string().trim().max(100).required(),
      country: Joi.string().trim().max(60).allow('', null),
      from: Joi.date().required(),
      to: Joi.date().allow(null).min(Joi.ref('from')).messages({ 'date.min': 'validation.invalidDate' }),
      isCurrent: Joi.boolean().default(false),
      competition: Joi.string().trim().max(100).allow('', null),
      appearances: Joi.number().min(0).default(0),
      goals: Joi.number().min(0).default(0),
      trophies: Joi.array().items(Joi.string().trim().max(100)).max(20),
    })
  ),
  stats: Joi.object({
    appearances: Joi.number().min(0).default(0),
    goals: Joi.number().min(0).default(0),
    assists: Joi.number().min(0).default(0),
  }),
  isPublic: Joi.boolean(),
});

export const coachProfileSchema = Joi.object({
  sportCode: Joi.string().trim().max(40).required(),
  experienceYears: Joi.number().min(0).max(70),
  licenseGrade: Joi.string().trim().max(40).allow('', null),
  licenses: Joi.array().items(
    Joi.object({
      name: Joi.string().trim().max(100).required(),
      issuingBody: Joi.string().trim().max(100).allow('', null),
      year: Joi.number().min(1950).max(2100),
      grade: Joi.string().trim().max(40).allow('', null),
    })
  ),
  achievements: Joi.array().items(Joi.string().trim().max(200)).max(30),
  specializations: Joi.array().items(Joi.string().trim().max(60)).max(10),
  coachingStyle: Joi.string().trim().max(100).allow('', null),
  currentClub: Joi.string().trim().max(100).allow('', null),
  country: Joi.string().trim().max(60).allow('', null),
  city: Joi.string().trim().max(60).allow('', null),
  about: localized(2000),
  services: Joi.array().items(
    Joi.object({
      title: Joi.object({ en: Joi.string().trim().max(120).required(), ar: Joi.string().trim().max(120).required() }),
      description: localized(1000),
      price: Joi.number().min(0).default(0),
      currency: Joi.string().valid(...CURRENCIES).default('USD'),
    })
  ),
  availability: Joi.boolean(),
  isPublic: Joi.boolean(),
});

export const clubProfileSchema = Joi.object({
  clubName: Joi.string().trim().max(120).required(),
  foundedYear: Joi.number().min(1800).max(2100),
  sportCode: Joi.string().trim().max(40),
  league: Joi.string().trim().max(100).allow('', null),
  country: Joi.string().trim().max(60).allow('', null),
  city: Joi.string().trim().max(60).allow('', null),
  stadium: Joi.string().trim().max(120).allow('', null),
  capacity: Joi.number().min(0).max(500000),
  about: localized(3000),
  social: Joi.object({
    website: Joi.string().trim().max(200).allow('', null),
    instagram: Joi.string().trim().max(200).allow('', null),
    twitter: Joi.string().trim().max(200).allow('', null),
    facebook: Joi.string().trim().max(200).allow('', null),
  }),
});

export const clubVacancySchema = Joi.object({
  position: Joi.string().trim().max(40).required(),
  count: Joi.number().min(1).max(50).default(1),
  contractType: Joi.string().valid('permanent', 'loan', 'trial', 'seasonal').default('permanent'),
  salaryRange: Joi.object({
    min: Joi.number().min(0).default(0),
    max: Joi.number().min(0).default(0),
    currency: Joi.string().valid(...CURRENCIES).default('USD'),
  }),
  expiresAt: Joi.date().min('now').allow(null).messages({ 'date.min': 'validation.dateInFuture' }),
  isActive: Joi.boolean().default(true),
});

export const agentProfileSchema = Joi.object({
  agencyName: Joi.string().trim().max(120).allow('', null),
  licenseNumber: Joi.string().trim().max(60).allow('', null),
  country: Joi.string().trim().max(60).allow('', null),
  city: Joi.string().trim().max(60).allow('', null),
  about: localized(2000),
  isPublic: Joi.boolean(),
});

export const agentClientSchema = Joi.object({
  playerProfileId: Joi.string().hex().length(24).required(),
});
