import Joi from "joi";

export const createSportSchema = Joi.object({
  name: Joi.object({
    ar: Joi.string().required().messages({
      "string.empty": "يجب توفير اسم اللعبة باللغة العربية",
      "any.required": "يجب توفير اسم اللعبة باللغة العربية",
    }),
    en: Joi.string().required().messages({
      "string.empty": "يجب توفير اسم اللعبة باللغة الإنجليزية",
      "any.required": "يجب توفير اسم اللعبة باللغة الإنجليزية",
    }),
  }).required(),

  description: Joi.object({
    ar: Joi.string().allow("", null),
    en: Joi.string().allow("", null),
  }),

  positions: Joi.array().items(
    Joi.object({
      name: Joi.object({
        ar: Joi.string().required(),
        en: Joi.string().required(),
      }).required(),
      description: Joi.object({
        ar: Joi.string().allow("", null),
        en: Joi.string().allow("", null),
      }),
    })
  ),

  roleTypes: Joi.array().items(
    Joi.object({
      jop: Joi.string().valid("player", "coach").required(),
      name: Joi.object({
        ar: Joi.string().required(),
        en: Joi.string().required(),
      }).required(),
    })
  ),

  isActive: Joi.boolean(),

  displayOrder: Joi.number().integer().min(0),

  seo: Joi.object({
    metaTitle: Joi.object({
      ar: Joi.string().allow("", null),
      en: Joi.string().allow("", null),
    }),
    metaDescription: Joi.object({
      ar: Joi.string().allow("", null),
      en: Joi.string().allow("", null),
    }),
    keywords: Joi.array().items(Joi.string()),
  }),
});

export const updateSportSchema = Joi.object({
  name: Joi.object({
    ar: Joi.string(),
    en: Joi.string(),
  }),

  description: Joi.object({
    ar: Joi.string().allow("", null),
    en: Joi.string().allow("", null),
  }),

  positions: Joi.array().items(
    Joi.object({
      name: Joi.object({
        ar: Joi.string().required(),
        en: Joi.string().required(),
      }).required(),
      description: Joi.object({
        ar: Joi.string().allow("", null),
        en: Joi.string().allow("", null),
      }),
    })
  ),

  roleTypes: Joi.array().items(
    Joi.object({
      jop: Joi.string().valid("player", "coach").required(),
      name: Joi.object({
        ar: Joi.string().required(),
        en: Joi.string().required(),
      }).required(),
    })
  ),

  isActive: Joi.boolean(),

  displayOrder: Joi.number().integer().min(0),

  seo: Joi.object({
    metaTitle: Joi.object({
      ar: Joi.string().allow("", null),
      en: Joi.string().allow("", null),
    }),
    metaDescription: Joi.object({
      ar: Joi.string().allow("", null),
      en: Joi.string().allow("", null),
    }),
    keywords: Joi.array().items(Joi.string()),
  }),
});
