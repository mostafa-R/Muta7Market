import Joi from "joi";

// ================================
// USER VALIDATION SCHEMAS
// ================================

export const verifyUserEmailSchema = Joi.object({
  isEmailVerified: Joi.boolean().required(),
});

export const updatePromotionSchema = Joi.object({
  status: Joi.boolean().required(),
  startDate: Joi.date().allow(null),
  endDate: Joi.date().allow(null),
  type: Joi.string().allow(null),
});

export const getRecentPeopleQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  jop: Joi.string().valid("player", "coach", "all").default("all"),
  isActive: Joi.string().valid("true", "false").optional(),
  isPromoted: Joi.string().valid("true", "false").optional(),
  minAge: Joi.number().integer().min(0).optional(),
  maxAge: Joi.number().integer().min(0).optional(),
  nationality: Joi.string().optional(),
  game: Joi.string().optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().optional(),
  search: Joi.string().optional(),
});

export const createUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 100 characters",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
  }),

  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters",
    "string.empty": "Password is required",
  }),

  phone: Joi.string()
    .pattern(/^[0-9+\-\s()]+$/)
    .min(10)
    .max(20)
    .messages({
      "string.pattern.base": "Please provide a valid phone number",
      "string.min": "Phone number must be at least 10 digits",
      "string.max": "Phone number cannot exceed 20 characters",
    }),

  role: Joi.string()
    .valid("user", "admin", "super_admin")
    .default("user")
    .messages({
      "any.only": "Role must be one of: user, admin, super_admin",
    }),

  isActive: Joi.boolean().default(true),

  avatar: Joi.object({
    url: Joi.string().uri(),
    publicId: Joi.string(),
  }).optional(),

  dateOfBirth: Joi.date().max("now").optional(),

  address: Joi.object({
    street: Joi.string().max(200),
    city: Joi.string().max(100),
    state: Joi.string().max(100),
    country: Joi.string().max(100),
    zipCode: Joi.string().max(20),
  }).optional(),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 100 characters",
  }),

  email: Joi.string().email().messages({
    "string.email": "Please provide a valid email address",
  }),

  phone: Joi.string()
    .pattern(/^[0-9+\-\s()]+$/)
    .min(10)
    .max(20)
    .messages({
      "string.pattern.base": "Please provide a valid phone number",
      "string.min": "Phone number must be at least 10 digits",
      "string.max": "Phone number cannot exceed 20 characters",
    }),

  role: Joi.string().valid("user", "admin", "super_admin").messages({
    "any.only": "Role must be one of: user, admin, super_admin",
  }),

  isActive: Joi.boolean(),
  isEmailVerified: Joi.boolean(),
  isPhoneVerified: Joi.boolean(),

  avatar: Joi.object({
    url: Joi.string().uri(),
    publicId: Joi.string(),
  }),

  dateOfBirth: Joi.date().max("now"),

  address: Joi.object({
    street: Joi.string().max(200),
    city: Joi.string().max(100),
    state: Joi.string().max(100),
    country: Joi.string().max(100),
    zipCode: Joi.string().max(20),
  }),
});

// ================================
// PLAYER VALIDATION SCHEMAS
// ================================

export const createPlayerSchema = Joi.object({
  user: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "Invalid user ID format",
    }),

  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Player name is required",
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 100 characters",
  }),

  age: Joi.number().integer().min(16).max(50).required().messages({
    "number.base": "Age must be a number",
    "number.integer": "Age must be a whole number",
    "number.min": "Age must be at least 16",
    "number.max": "Age cannot exceed 50",
    "any.required": "Age is required",
  }),

  gender: Joi.string().valid("male", "female").required().messages({
    "any.only": "Gender must be either male or female",
    "any.required": "Gender is required",
  }),

  nationality: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Nationality is required",
    "string.min": "Nationality must be at least 2 characters",
    "string.max": "Nationality cannot exceed 100 characters",
  }),

  jop: Joi.string().valid("player", "coach").required().messages({
    "any.only": "Job must be either player or coach",
    "any.required": "Job is required",
  }),

  position: Joi.string().trim().max(100).messages({
    "string.max": "Position cannot exceed 100 characters",
  }),

  status: Joi.string()
    .valid("available", "contracted", "transferred", "recently transferred")
    .default("available")
    .messages({
      "any.only":
        "Status must be one of: available, contracted, transferred, recently transferred",
    }),

  experience: Joi.number().integer().min(0).max(30).default(0).messages({
    "number.base": "Experience must be a number",
    "number.integer": "Experience must be a whole number",
    "number.min": "Experience cannot be negative",
    "number.max": "Experience cannot exceed 30 years",
  }),

  monthlySalary: Joi.object({
    amount: Joi.number().min(0).default(0),
    currency: Joi.string().valid("SAR", "USD", "EUR").default("SAR"),
  }).default({ amount: 0, currency: "SAR" }),

  yearSalary: Joi.object({
    amount: Joi.number().min(0).default(0),
    currency: Joi.string().valid("SAR", "USD", "EUR").default("SAR"),
  }).default({ amount: 0, currency: "SAR" }),

  contractEndDate: Joi.date().greater("now").allow(null),

  transferredTo: Joi.object({
    club: Joi.string().max(200).allow(""),
    date: Joi.date().allow(null),
    amount: Joi.number().min(0).allow(""),
  }).default({ club: "", date: null, amount: "" }),

  media: Joi.object({
    profileImage: Joi.object({
      url: Joi.string().uri().allow(""),
      publicId: Joi.string().allow(""),
    }).default({ url: "", publicId: "" }),
    videos: Joi.array()
      .items(
        Joi.object({
          url: Joi.string().uri().required(),
          publicId: Joi.string(),
          title: Joi.string().max(200),
          type: Joi.string(),
          duration: Joi.number(),
          uploadedAt: Joi.date().default(Date.now),
        })
      )
      .default([]),
    documents: Joi.array()
      .items(
        Joi.object({
          url: Joi.string().uri().required(),
          publicId: Joi.string(),
          title: Joi.string().max(200),
          type: Joi.string(),
          uploadedAt: Joi.date().default(Date.now),
        })
      )
      .default([]),
  }).default(),

  socialLinks: Joi.object({
    instagram: Joi.string().uri().allow(""),
    twitter: Joi.string().uri().allow(""),
    whatsapp: Joi.string().allow(""),
    youtube: Joi.string().uri().allow(""),
  }).default({ instagram: "", twitter: "", whatsapp: "", youtube: "" }),

  isPromoted: Joi.object({
    status: Joi.boolean().default(false),
    startDate: Joi.date().allow(""),
    endDate: Joi.date().allow(""),
    type: Joi.string().allow(""),
  }).default({ status: false, startDate: "", endDate: "", type: "" }),

  contactInfo: Joi.object({
    isHidden: Joi.boolean().default(true),
    email: Joi.string().email().allow(""),
    phone: Joi.string()
      .pattern(/^[0-9+\-\s()]+$/)
      .allow(""),
    agent: Joi.object({
      name: Joi.string().max(100).allow(""),
      phone: Joi.string()
        .pattern(/^[0-9+\-\s()]+$/)
        .allow(""),
      email: Joi.string().email().allow(""),
    }).default({ name: "", phone: "", email: "" }),
  }).default(),

  game: Joi.string().max(100).allow(""),

  isActive: Joi.boolean().default(true),

  isConfirmed: Joi.boolean().default(false),

  views: Joi.number().integer().min(0).default(0),

  seo: Joi.object({
    metaTitle: Joi.object({
      en: Joi.string().max(200).allow(""),
      ar: Joi.string().max(200).allow(""),
    }).default({ en: "", ar: "" }),
    metaDescription: Joi.object({
      en: Joi.string().max(500).allow(""),
      ar: Joi.string().max(500).allow(""),
    }).default({ en: "", ar: "" }),
    keywords: Joi.array().items(Joi.string().max(50)).default([]),
  }).default(),
});

export const updatePlayerSchema = Joi.object({
  // Basic Information
  name: Joi.string().trim().min(2).max(100).messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 100 characters",
  }),

  age: Joi.alternatives()
    .try(
      Joi.number().integer().min(15).max(50),
      Joi.string()
        .pattern(/^\d+$/)
        .custom((value) => parseInt(value))
    )
    .messages({
      "number.base": "Age must be a number",
      "number.integer": "Age must be a whole number",
      "number.min": "Age must be at least 15",
      "number.max": "Age cannot exceed 50",
    }),

  gender: Joi.string().valid("male", "female").messages({
    "any.only": "Gender must be either male or female",
  }),

  nationality: Joi.string().trim().max(100).allow("").messages({
    "string.max": "Nationality cannot exceed 100 characters",
  }),

  customNationality: Joi.string().trim().max(100).allow("").messages({
    "string.max": "Custom nationality cannot exceed 100 characters",
  }),

  birthCountry: Joi.string().trim().max(100).allow("").messages({
    "string.max": "Birth country cannot exceed 100 characters",
  }),

  customBirthCountry: Joi.string().trim().max(100).allow("").messages({
    "string.max": "Custom birth country cannot exceed 100 characters",
  }),

  // Professional Information
  jop: Joi.string().valid("player", "coach").messages({
    "any.only": "Job must be either player or coach",
  }),

  roleType: Joi.alternatives()
    .try(
      Joi.string().trim().max(100).allow(""),
      Joi.object({
        ar: Joi.string().required(),
        en: Joi.string().required(),
        slug: Joi.string().optional(),
      }).unknown()
    )
    .messages({
      "string.max": "Role type cannot exceed 100 characters",
    }),

  customRoleType: Joi.string().trim().max(100).allow("").messages({
    "string.max": "Custom role type cannot exceed 100 characters",
  }),

  position: Joi.alternatives()
    .try(
      Joi.string().trim().max(100).allow(""),
      Joi.object({
        ar: Joi.string().required(),
        en: Joi.string().required(),
        slug: Joi.string().optional(),
      }).unknown()
    )
    .messages({
      "string.max": "Position cannot exceed 100 characters",
    }),

  customPosition: Joi.string().trim().max(100).allow("").messages({
    "string.max": "Custom position cannot exceed 100 characters",
  }),

  status: Joi.string()
    .valid("available", "contracted", "transferred", "recently transferred")
    .messages({
      "any.only":
        "Status must be one of: available, contracted, transferred, recently transferred",
    }),

  experience: Joi.alternatives()
    .try(
      Joi.number().integer().min(0).max(30),
      Joi.string()
        .pattern(/^\d+$/)
        .custom((value) => parseInt(value))
    )
    .messages({
      "number.base": "Experience must be a number",
      "number.integer": "Experience must be a whole number",
      "number.min": "Experience cannot be negative",
      "number.max": "Experience cannot exceed 30 years",
    }),

  game: Joi.alternatives().try(
    Joi.string().max(100).allow(""),
    Joi.object({
      ar: Joi.string().required(),
      en: Joi.string().required(),
      slug: Joi.string().optional(),
    }).unknown()
  ),

  customSport: Joi.string().trim().max(100).allow("").messages({
    "string.max": "Custom sport cannot exceed 100 characters",
  }),

  // Financial Information
  monthlySalary: Joi.object({
    amount: Joi.alternatives().try(
      Joi.number().min(0),
      Joi.string()
        .pattern(/^\d+$/)
        .custom((value) => parseInt(value))
    ),
    currency: Joi.string().valid("SAR", "USD", "EUR").allow(""),
  }),

  yearSalary: Joi.object({
    amount: Joi.alternatives().try(
      Joi.number().min(0),
      Joi.string()
        .pattern(/^\d+$/)
        .custom((value) => parseInt(value))
    ),
    currency: Joi.string().valid("SAR", "USD", "EUR").allow(""),
  }),

  contractEndDate: Joi.alternatives().try(
    Joi.date().allow(null),
    Joi.string().allow("")
  ),

  transferredTo: Joi.object({
    club: Joi.string().max(200).allow(""),
    startDate: Joi.alternatives().try(
      Joi.date().allow(null),
      Joi.string().allow("")
    ),
    endDate: Joi.alternatives().try(
      Joi.date().allow(null),
      Joi.string().allow("")
    ),
    amount: Joi.alternatives().try(
      Joi.number().min(0),
      Joi.string()
        .pattern(/^\d+$/)
        .custom((value) => parseInt(value)),
      Joi.string().allow("")
    ),
  }),

  // Social Links
  socialLinks: Joi.object({
    instagram: Joi.string().allow(""),
    twitter: Joi.string().allow(""),
    whatsapp: Joi.string().allow(""),
    youtube: Joi.string().allow(""),
  }),

  // Contact Information
  contactInfo: Joi.object({
    isHidden: Joi.boolean(),
    email: Joi.string().email().allow(""),
    phone: Joi.string().allow(""),
    agent: Joi.object({
      name: Joi.string().max(100).allow(""),
      phone: Joi.string().allow(""),
      email: Joi.string().email().allow(""),
    }),
  }),

  // Promotion Information
  isPromoted: Joi.object({
    status: Joi.alternatives().try(
      Joi.boolean(),
      Joi.string()
        .valid("true", "false")
        .custom((value) => value === "true")
    ),
    startDate: Joi.alternatives().try(
      Joi.date().allow(null),
      Joi.string().allow("")
    ),
    endDate: Joi.alternatives().try(
      Joi.date().allow(null),
      Joi.string().allow("")
    ),
    type: Joi.string().allow(""),
  }),

  // System Settings
  isListed: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string()
      .valid("true", "false")
      .custom((value) => value === "true")
  ),

  isActive: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string()
      .valid("true", "false")
      .custom((value) => value === "true")
  ),

  isConfirmed: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string()
      .valid("true", "false")
      .custom((value) => value === "true")
  ),

  views: Joi.alternatives().try(
    Joi.number().integer().min(0),
    Joi.string()
      .pattern(/^\d+$/)
      .custom((value) => parseInt(value))
  ),

  // Media handling
  existingMedia: Joi.alternatives().try(
    Joi.object().unknown(true),
    Joi.string().custom((value) => {
      try {
        return JSON.parse(value);
      } catch (e) {
        throw new Error("Invalid JSON for existingMedia");
      }
    })
  ),

  // Additional fields
  media: Joi.object().unknown(true),
  stats: Joi.object().unknown(true),
  bio: Joi.string().max(1000).allow(""),

  seo: Joi.object({
    metaTitle: Joi.object({
      en: Joi.string().max(200).allow(""),
      ar: Joi.string().max(200).allow(""),
    }),
    metaDescription: Joi.object({
      en: Joi.string().max(500).allow(""),
      ar: Joi.string().max(500).allow(""),
    }),
    keywords: Joi.array().items(Joi.string().max(50)),
  }),
});

// ================================
// BULK OPERATIONS SCHEMAS
// ================================

export const bulkUpdateUsersSchema = Joi.object({
  userIds: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({ "string.pattern.base": "Invalid user ID format" })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "At least one user ID is required",
      "any.required": "User IDs array is required",
    }),

  updates: updateUserSchema
    .required()
    .messages({ "any.required": "Updates object is required" }),
});

export const bulkUpdatePlayersSchema = Joi.object({
  playerIds: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({ "string.pattern.base": "Invalid player ID format" })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "At least one player ID is required",
      "any.required": "Player IDs array is required",
    }),

  updates: updatePlayerSchema
    .required()
    .messages({ "any.required": "Updates object is required" }),
});

// ================================
// QUERY VALIDATION SCHEMAS
// ================================

export const getUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200),
  role: Joi.string().valid("user", "admin", "super_admin"),
  isActive: Joi.string().valid("true", "false"),
});

export const getPlayersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200),
  jop: Joi.string().valid("player", "coach").optional(), // ✅ إضافة jop field
  position: Joi.string().max(100),
  status: Joi.string().valid(
    "available",
    "contracted",
    "transferred",
    "recently transferred"
  ),
  nationality: Joi.string().max(100),
  minAge: Joi.number().integer().min(16).max(50),
  maxAge: Joi.number().integer().min(16).max(50),
  isActive: Joi.string().valid("true", "false"),
});
