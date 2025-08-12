import Joi from 'joi';
import { GENDER, PROFILE_STATUS } from '../config/constants.js';

export const createCoachSchema = Joi.object({
  name: Joi.object({
    en: Joi.string().required(),
    ar: Joi.string().required()
  }).required(),

  age: Joi.number().min(25).max(70).required(),

  gender: Joi.string()
    .valid(...Object.values(GENDER))
    .required(),

  nationality: Joi.string().required(),

  category: Joi.string()
    .valid(
      'head_coach',
      'assistant_coach',
      'goalkeeper_coach',
      'fitness_coach',
      'technical_director'
    )
    .required(),

  experience: Joi.object({
    years: Joi.number().min(0).default(0),
    clubs: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        position: Joi.string().required(),
        from: Joi.date().required(),
        to: Joi.date().greater(Joi.ref('from')).required(),
        achievements: Joi.array().items(Joi.string())
      })
    )
  }),

  licenses: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      issuedBy: Joi.string().required(),
      issuedDate: Joi.date().required(),
      expiryDate: Joi.date().required(),
      documentUrl: Joi.string().uri()
    })
  ),

  monthlySalary: Joi.object({
    amount: Joi.number().min(0).default(0),
    currency: Joi.string().default('SAR')
  }),

  annualContract: Joi.object({
    amount: Joi.number().min(0).default(0),
    currency: Joi.string().default('SAR')
  }),

  contractEndDate: Joi.date().optional(),

  status: Joi.string()
    .valid(...Object.values(PROFILE_STATUS))
    .default(PROFILE_STATUS.AVAILABLE),

  transferredTo: Joi.object({
    club: Joi.string(),
    date: Joi.date(),
    amount: Joi.number().min(0)
  }),

  media: Joi.object({
    profileImage: Joi.object({
      url: Joi.string().uri(),
      publicId: Joi.string()
    }),
    images: Joi.array().items(
      Joi.object({
        url: Joi.string().uri().required(),
        publicId: Joi.string().required(),
        title: Joi.string(),
        type: Joi.string(),
        uploadedAt: Joi.date()
      })
    )
  }),

  socialLinks: Joi.object({
    instagram: Joi.string().uri(),
    twitter: Joi.string().uri(),
    whatsapp: Joi.string(),
    linkedin: Joi.string().uri()
  }),

  achievements: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      year: Joi.number().integer().min(1900).max(new Date().getFullYear()),
      description: Joi.string()
    })
  ),

  isPromoted: Joi.object({
    status: Joi.boolean().default(false),
    startDate: Joi.date(),
    endDate: Joi.date(),
    type: Joi.string().valid('featured', 'premium')
  }),

  contactInfo: Joi.object({
    isHidden: Joi.boolean().default(true),
    email: Joi.string().email(),
    phone: Joi.string(),
    agent: Joi.object({
      name: Joi.string(),
      phone: Joi.string(),
      email: Joi.string().email()
    })
  }),

  seo: Joi.object({
    metaTitle: Joi.object({
      en: Joi.string(),
      ar: Joi.string()
    }),
    metaDescription: Joi.object({
      en: Joi.string(),
      ar: Joi.string()
    }),
    keywords: Joi.array().items(Joi.string())
  }),

  views: Joi.number().min(0).default(0),

  isActive: Joi.boolean().default(true)
});

export const updateUserSchema = Joi.object({
  name: Joi.object({
    en: Joi.string(),
    ar: Joi.string()
  }),
  email: Joi.string().email(),
  password: Joi.string().min(6).max(32),
  phone: Joi.string().pattern(/^[0-9]{6,15}$/),
  gender: Joi.string().valid('male', 'female', 'other'),
  nationality: Joi.string(),
  birthDate: Joi.date().less('now'),
  isDeleted: Joi.boolean(),
  isActive: Joi.boolean(),
  role: Joi.string().valid('admin', 'coach', 'player', 'scout') // Adjust based on your roles
});
