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

const baseUserFields = {
  email: Joi.string().email().max(120).required(),
  password: Joi.string().min(8).max(72).required(),
  firstName: Joi.string().trim().max(60).allow('', null),
  lastName: Joi.string().trim().max(60).allow('', null),
  displayName: Joi.string().trim().max(120).allow('', null),
  lang: Joi.string().valid('en', 'ar').default('en'),
  avatar: Joi.string().trim().max(300).allow('', null),
  isEmailVerified: Joi.boolean().default(true),
  isActive: Joi.boolean().default(true),
};

export const adminCreatePlayerSchema = Joi.object({
  ...baseUserFields,
  sportCode: Joi.string().trim().max(40).default('football'),
  primaryPosition: Joi.string().trim().max(40).default('forward'),
  secondaryPositions: Joi.array().items(Joi.string().trim().max(40)).max(5),
  heightCm: Joi.number().min(100).max(250),
  weightKg: Joi.number().min(30).max(250),
  preferredFoot: Joi.string().valid(...Object.values(PREFERRED_FOOT)),
  preferredHand: Joi.string().valid(...Object.values(PREFERRED_HAND)),
  physicalStatus: Joi.string().valid(...Object.values(PHYSICAL_STATUS)),
  injuryNote: Joi.string().trim().max(300).allow('', null),
  contractStatus: Joi.string().valid(...Object.values(CONTRACT_STATUS)),
  currentClub: Joi.string().trim().max(100).allow('', null),
  contractEndDate: Joi.date().allow(null),
  nationality: Joi.string().trim().max(60).allow('', null),
  country: Joi.string().trim().max(60).allow('', null),
  city: Joi.string().trim().max(60).allow('', null),
  birthDate: Joi.date().max('now').allow(null),
  about: localized(2000),
  careerHistory: Joi.array().items(Joi.object().unknown(true)),
  stats: Joi.object({
    appearances: Joi.number().min(0).default(0),
    goals: Joi.number().min(0).default(0),
    assists: Joi.number().min(0).default(0),
  }),
  isPublic: Joi.boolean(),
  isVerified: Joi.boolean(),
});

export const adminCreateCoachSchema = Joi.object({
  ...baseUserFields,
  sportCode: Joi.string().trim().max(40).default('football'),
  experienceYears: Joi.number().min(0).max(70),
  licenseGrade: Joi.string().trim().max(40).allow('', null),
  licenses: Joi.array().items(Joi.object().unknown(true)),
  achievements: Joi.array().items(Joi.string().trim().max(200)).max(30),
  specializations: Joi.array().items(Joi.string().trim().max(60)).max(10),
  coachingStyle: Joi.string().trim().max(100).allow('', null),
  currentClub: Joi.string().trim().max(100).allow('', null),
  country: Joi.string().trim().max(60).allow('', null),
  city: Joi.string().trim().max(60).allow('', null),
  about: localized(2000),
  services: Joi.array().items(Joi.object().unknown(true)),
  availability: Joi.boolean(),
  isPublic: Joi.boolean(),
  isVerified: Joi.boolean(),
});

export const adminCreateClubSchema = Joi.object({
  ...baseUserFields,
  clubName: Joi.string().trim().max(120).allow('', null),
  foundedYear: Joi.number().min(1800).max(2100),
  sportCode: Joi.string().trim().max(40),
  league: Joi.string().trim().max(100).allow('', null),
  country: Joi.string().trim().max(60).allow('', null),
  city: Joi.string().trim().max(60).allow('', null),
  stadium: Joi.string().trim().max(120).allow('', null),
  capacity: Joi.number().min(0).max(500000),
  logo: Joi.string().trim().max(300).allow('', null),
  about: localized(3000),
  social: Joi.object({
    website: Joi.string().trim().max(200).allow('', null),
    instagram: Joi.string().trim().max(200).allow('', null),
    twitter: Joi.string().trim().max(200).allow('', null),
    facebook: Joi.string().trim().max(200).allow('', null),
  }),
  isVerified: Joi.boolean(),
});

export const adminCreateAgentSchema = Joi.object({
  ...baseUserFields,
  agencyName: Joi.string().trim().max(120).allow('', null),
  licenseNumber: Joi.string().trim().max(60).allow('', null),
  country: Joi.string().trim().max(60).allow('', null),
  city: Joi.string().trim().max(60).allow('', null),
  about: localized(2000),
  isPublic: Joi.boolean(),
  isVerified: Joi.boolean(),
});

const makeUpdateSchema = (schema) => {
  const keys = Object.keys(schema.describe().keys);
  return schema.fork(keys, (s) => s.optional()).min(1).unknown(false);
};

export const adminUpdatePlayerSchema = makeUpdateSchema(adminCreatePlayerSchema);
export const adminUpdateCoachSchema = makeUpdateSchema(adminCreateCoachSchema);
export const adminUpdateClubSchema = makeUpdateSchema(adminCreateClubSchema);
export const adminUpdateAgentSchema = makeUpdateSchema(adminCreateAgentSchema);

export const adminVerifySchema = Joi.object({
  verified: Joi.boolean().required(),
});

export const adminSportSchema = Joi.object({
  code: Joi.string().trim().lowercase().max(40).required(),
  name: Joi.object({
    en: Joi.string().trim().max(120).required(),
    ar: Joi.string().trim().max(120).required(),
  }).required(),
  positions: Joi.array()
    .items(
      Joi.object({
        code: Joi.string().trim().max(40).required(),
        name: Joi.object({
          en: Joi.string().trim().max(120).required(),
          ar: Joi.string().trim().max(120).required(),
        }).required(),
      })
    )
    .max(50),
  isActive: Joi.boolean().default(true),
});

export const adminUpdateSportSchema = adminSportSchema.fork(['code', 'name'], (schema) => schema.optional()).min(1);

export const adminUserUpdateSchema = Joi.object({
  email: Joi.string().email().max(120),
  firstName: Joi.string().trim().max(60).allow('', null),
  lastName: Joi.string().trim().max(60).allow('', null),
  displayName: Joi.string().trim().max(120).allow('', null),
  lang: Joi.string().valid('en', 'ar'),
  avatar: Joi.string().trim().max(300).allow('', null),
  role: Joi.string().valid('player', 'coach', 'club', 'agent', 'admin'),
  isEmailVerified: Joi.boolean(),
  isActive: Joi.boolean(),
}).min(1);

export const adminMediaQuerySchema = Joi.object({
  kind: Joi.string(),
  ownerType: Joi.string(),
  isPublic: Joi.boolean(),
  q: Joi.string().trim().max(100),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(20),
});

export const adminCurrencySchema = Joi.object({
  currency: Joi.string().valid(...CURRENCIES).default('USD'),
});