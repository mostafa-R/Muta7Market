import Joi from "joi";
import { GENDER, PROFILE_STATUS } from "../config/constants.js";

export const createPlayerSchema = Joi.object({
  user: Joi.any().forbidden(),
  name: Joi.string().trim().required(),
  age: Joi.number().min(15).max(50).required(),
  gender: Joi.string()
    .valid(...Object.values(GENDER))
    .required(),
  nationality: Joi.string().trim().required(),
  customNationality: Joi.string().trim().allow("", null).optional(),
  birthCountry: Joi.string().trim().allow("", null).optional(),
  customBirthCountry: Joi.string().trim().allow("", null).optional(),

  jop: Joi.string().valid("player", "coach").required(),
  roleType: Joi.alternatives()
    .try(
      Joi.string().trim().allow("", null),
      Joi.object({
        ar: Joi.string().required(),
        en: Joi.string().required(),
        slug: Joi.string().optional(),
      })
    )
    .optional(),
  customRoleType: Joi.string().trim().allow("", null).optional(),
  position: Joi.alternatives()
    .try(
      Joi.string().trim().allow("", null),
      Joi.object({
        ar: Joi.string().required(),
        en: Joi.string().required(),
        slug: Joi.string().optional(),
      })
    )
    .optional(),
  customPosition: Joi.string().trim().allow("", null).optional(),
  status: Joi.string()
    .valid(...Object.values(PROFILE_STATUS))
    .optional(),

  experience: Joi.number().min(0).optional(),

  transferredTo: Joi.object({
    club: Joi.string().allow("", null),
    startDate: Joi.alternatives()
      .try(Joi.date().iso(), Joi.string().valid(""))
      .allow(null),
    endDate: Joi.alternatives()
      .try(Joi.date().iso(), Joi.string().valid(""))
      .allow(null),
    amount: Joi.number().min(0).empty("").optional(),
  }).optional(),

  monthlySalary: Joi.object({
    amount: Joi.number().min(0).empty("").optional(), // 👈
    currency: Joi.string().trim(),
  }).optional(),

  yearSalary: Joi.object({
    amount: Joi.number().min(0).empty("").optional(), // 👈
    currency: Joi.string().trim(),
  }).optional(),

  contractEndDate: Joi.alternatives()
    .try(Joi.date().iso(), Joi.string().valid(""))
    .allow(null)
    .optional(),

  // Transfer info
  // Media (files come via multer → NOT validated here)
  // media.* are set in controller; omit from Joi to avoid conflicts

  // Social links
  socialLinks: Joi.object({
    instagram: Joi.string().uri().allow("", null),
    twitter: Joi.string().uri().allow("", null),
    whatsapp: Joi.string().allow("", null),
    youtube: Joi.string().uri().allow("", null),
  }).optional(),

  // Promotion flags
  isPromoted: Joi.object({
    status: Joi.boolean().optional(),
    startDate: Joi.alternatives()
      .try(Joi.date().iso(), Joi.string().valid(""))
      .allow(null),
    endDate: Joi.alternatives()
      .try(Joi.date().iso(), Joi.string().valid(""))
      .allow(null),
    type: Joi.string().allow("", null),
  }).optional(),

  // Contact info
  contactInfo: Joi.object({
    isHidden: Joi.boolean().optional(),
    email: Joi.string().email().allow("", null),
    phone: Joi.string().allow("", null),
    agent: Joi.object({
      name: Joi.string().allow("", null),
      phone: Joi.string().allow("", null),
      email: Joi.string().email().allow("", null),
    }).optional(),
  }).optional(),

  // Game & status
  game: Joi.alternatives()
    .try(
      Joi.string().trim(),
      Joi.object({
        ar: Joi.string().required(),
        en: Joi.string().required(),
        slug: Joi.string().optional(),
      })
    )
    .required(),
  customSport: Joi.string().trim().allow("", null).optional(),
  views: Joi.number().min(0).optional(),
  isActive: Joi.boolean().optional(),
}).prefs({
  abortEarly: false,
  stripUnknown: true,
  convert: true,
});

export const updatePlayerSchema = Joi.object({
  // identity not updatable from client
  user: Joi.any().forbidden(),

  name: Joi.string().trim(),
  age: Joi.number().min(15).max(50),
  gender: Joi.string().valid(...Object.values(GENDER)),
  nationality: Joi.string().trim(),
  customNationality: Joi.string().trim().allow("", null).optional(),
  birthCountry: Joi.string().trim().allow("", null).optional(),
  customBirthCountry: Joi.string().trim().allow("", null).optional(),

  jop: Joi.string().valid("player", "coach"),
  roleType: Joi.alternatives()
    .try(
      Joi.string().trim().allow("", null),
      Joi.object({
        ar: Joi.string().required(),
        en: Joi.string().required(),
        slug: Joi.string().optional(),
      })
    )
    .optional(),
  customRoleType: Joi.string().trim().allow("", null).optional(),
  position: Joi.alternatives()
    .try(
      Joi.string().trim().allow("", null),
      Joi.object({
        ar: Joi.string().required(),
        en: Joi.string().required(),
        slug: Joi.string().optional(),
      })
    )
    .optional(),
  customPosition: Joi.string().trim().allow("", null).optional(),
  status: Joi.string().valid(...Object.values(PROFILE_STATUS)),

  experience: Joi.number().min(0).optional(),

  monthlySalary: Joi.object({
    amount: Joi.number().min(0),
    currency: Joi.string().trim(),
  }),

  yearSalary: Joi.object({
    amount: Joi.number().min(0),
    currency: Joi.string().trim(),
  }),

  contractEndDate: Joi.alternatives()
    .try(Joi.date().iso(), Joi.string().valid(""))
    .allow(null),

  transferredTo: Joi.object({
    club: Joi.string().allow("", null),
    startDate: Joi.alternatives()
      .try(Joi.date().iso(), Joi.string().valid(""))
      .allow(null),
    endDate: Joi.alternatives()
      .try(Joi.date().iso(), Joi.string().valid(""))
      .allow(null),
    amount: Joi.number().min(0).empty("").optional(),
  }).optional(),

  socialLinks: Joi.object({
    instagram: Joi.string().uri().allow("", null),
    twitter: Joi.string().uri().allow("", null),
    whatsapp: Joi.string().allow("", null),
    youtube: Joi.string().uri().allow("", null),
  }),

  isPromoted: Joi.object({
    status: Joi.boolean(),
    startDate: Joi.alternatives()
      .try(Joi.date().iso(), Joi.string().valid(""))
      .allow(null),
    endDate: Joi.alternatives()
      .try(Joi.date().iso(), Joi.string().valid(""))
      .allow(null),
    type: Joi.string().allow("", null),
  }),

  contactInfo: Joi.object({
    isHidden: Joi.boolean(),
    email: Joi.string().email().allow("", null),
    phone: Joi.string().allow("", null),
    agent: Joi.object({
      name: Joi.string().allow("", null),
      phone: Joi.string().allow("", null),
      email: Joi.string().email().allow("", null),
    }),
  }),

  game: Joi.alternatives().try(
    Joi.string().trim(),
    Joi.object({
      ar: Joi.string().required(),
      en: Joi.string().required(),
      slug: Joi.string().optional(),
    })
  ),
  customSport: Joi.string().trim().allow("", null).optional(),
  views: Joi.number().min(0),
  isActive: Joi.boolean(),
}).prefs({ abortEarly: false, stripUnknown: true, convert: true });

export const filterPlayerSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  sortBy: Joi.string(),
  nationality: Joi.string(),
  category: Joi.string(),
  status: Joi.string(),
  gender: Joi.string().valid(...Object.values(GENDER)),
  ageMin: Joi.number().min(15),
  ageMax: Joi.number().max(50),
  salaryMin: Joi.number().min(0),
  salaryMax: Joi.number(),
  isPromoted: Joi.boolean(),
  search: Joi.string(),
});

export const promotePlayerSchema = Joi.object({
  days: Joi.number().min(1).max(365).required(),
  type: Joi.string().valid("featured", "premium").default("featured"),
});

export const transferPlayerSchema = Joi.object({
  clubName: Joi.string().required(),
  amount: Joi.number().min(0).required(),
});

export const statisticsSchema = Joi.object({
  goals: Joi.number().min(0),
  assists: Joi.number().min(0),
  matches: Joi.number().min(0),
  yellowCards: Joi.number().min(0),
  redCards: Joi.number().min(0),
});
