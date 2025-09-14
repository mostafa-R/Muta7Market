import Joi from "joi";

export const createPlayerFormSchema = (t) =>
  Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        "string.empty": t("fieldValidation.nameRequired"),
        "string.min": t("formValidation.nameTooShort"),
        "string.max": t("formValidation.nameTooLong"),
      }),

    age: Joi.number()
      .integer()
      .min(15)
      .max(50)
      .required()
      .messages({
        "number.base": t("fieldValidation.ageMustBeNumber"),
        "number.empty": t("fieldValidation.ageRequired"),
        "number.min": t("fieldValidation.ageRange"),
        "number.max": t("fieldValidation.ageRange"),
      }),

    gender: Joi.string()
      .valid("male", "female")
      .required()
      .messages({
        "any.only": t("fieldValidation.genderRequired"),
        "string.empty": t("fieldValidation.genderRequired"),
      }),

    nationality: Joi.string()
      .valid(
        "saudi",
        "uae",
        "egypt",
        "morocco",
        "kuwait",
        "qatar",
        "bahrain",
        "oman",
        "jordan",
        "lebanon",
        "syria",
        "iraq",
        "libya",
        "tunisia",
        "algeria",
        "sudan",
        "yemen",
        "other"
      )
      .required()
      .messages({
        "string.empty": t("fieldValidation.nationalityRequired"),
        "any.only": t("formValidation.nationalityInvalid"),
        "any.required": t("fieldValidation.nationalityRequired"),
      }),

    customNationality: Joi.when("nationality", {
      is: "other",
      then: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
          "string.empty": t("fieldValidation.customNationalityRequired"),
          "string.min": t("formValidation.customNationalityTooShort"),
          "string.max": t("formValidation.customNationalityTooLong"),
        }),
      otherwise: Joi.optional(),
    }),

    birthCountry: Joi.string()
      .valid(
        "saudi",
        "uae",
        "egypt",
        "morocco",
        "kuwait",
        "qatar",
        "bahrain",
        "oman",
        "jordan",
        "lebanon",
        "syria",
        "iraq",
        "libya",
        "tunisia",
        "algeria",
        "sudan",
        "yemen",
        "other"
      )
      .required()
      .messages({
        "string.empty": t("fieldValidation.birthCountryRequired"),
        "any.only": t("formValidation.birthCountryInvalid"),
        "any.required": t("fieldValidation.birthCountryRequired"),
      }),

    customBirthCountry: Joi.when("birthCountry", {
      is: "other",
      then: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
          "string.empty": t("fieldValidation.customBirthCountryRequired"),
          "string.min": t("formValidation.customBirthCountryTooShort"),
          "string.max": t("formValidation.customBirthCountryTooLong"),
        }),
      otherwise: Joi.optional(),
    }),

    jop: Joi.string()
      .valid("player", "coach")
      .required()
      .messages({
        "any.only": t("sportsValidation.categoryRequired"),
        "string.empty": t("sportsValidation.categoryRequired"),
      }),

    roleType: Joi.when("jop", {
      is: Joi.exist(),
      then: Joi.alternatives()
        .try(
          Joi.string()
            .required()
            .messages({
              "string.empty": t("sportsValidation.roleTypeRequired"),
              "any.required": t("sportsValidation.roleTypeRequired"),
            }),
          Joi.object({
            ar: Joi.string().required(),
            en: Joi.string().required(),
            slug: Joi.string().optional(),
          })
            .required()
            .messages({
              "object.base": t("sportsValidation.roleTypeRequired"),
              "any.required": t("sportsValidation.roleTypeRequired"),
            })
        )
        .required()
        .messages({
          "alternatives.match": t("sportsValidation.roleTypeRequired"),
          "any.required": t("sportsValidation.roleTypeRequired"),
        }),
      otherwise: Joi.alternatives()
        .try(
          Joi.string().optional(),
          Joi.object({
            ar: Joi.string().optional(),
            en: Joi.string().optional(),
            slug: Joi.string().optional(),
          }).optional()
        )
        .optional(),
    }),

    customRoleType: Joi.when("roleType", {
      is: Joi.alternatives().try("other", Joi.object({ slug: "other" })),
      then: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
          "string.empty": t("sportsValidation.customRoleTypeRequired"),
          "string.min": t("sportsValidation.customRoleTypeTooShort"),
          "string.max": t("sportsValidation.customRoleTypeTooLong"),
        }),
      otherwise: Joi.optional(),
    }),
    position: Joi.when("jop", {
      is: "player",
      then: Joi.alternatives()
        .try(
          Joi.string()
            .min(2)
            .max(100)
            .required()
            .messages({
              "string.empty": t("sportsValidation.positionRequired"),
              "string.min": t("sportsValidation.positionTooShort"),
              "string.max": t("sportsValidation.positionTooShort"),
            }),
          Joi.object({
            ar: Joi.string().required(),
            en: Joi.string().required(),
            slug: Joi.string().optional(),
          })
            .required()
            .messages({
              "object.base": t("sportsValidation.positionRequired"),
              "any.required": t("sportsValidation.positionRequired"),
            })
        )
        .required()
        .messages({
          "alternatives.match": t("sportsValidation.positionRequired"),
          "any.required": t("sportsValidation.positionRequired"),
        }),
      otherwise: Joi.alternatives()
        .try(
          Joi.string().allow("").optional(),
          Joi.object({
            ar: Joi.string().optional(),
            en: Joi.string().optional(),
            slug: Joi.string().optional(),
          }).optional()
        )
        .optional(),
    }),

    customPosition: Joi.when(Joi.ref("jop"), {
      is: "player",
      then: Joi.when("position", {
        is: Joi.alternatives().try("other", Joi.object({ slug: "other" })),
        then: Joi.string()
          .min(2)
          .max(50)
          .required()
          .messages({
            "string.empty": t("sportsValidation.customPositionRequired"),
            "string.min": t("sportsValidation.customPositionTooShort"),
            "string.max": t("sportsValidation.customPositionTooLong"),
          }),
        otherwise: Joi.optional(),
      }),
      otherwise: Joi.optional(),
    }),

    status: Joi.string()
      .valid("available", "contracted", "transferred")
      .required()
      .messages({
        "any.only": t("sportsValidation.statusRequired"),
        "string.empty": t("sportsValidation.statusRequired"),
      }),

    experience: Joi.number()
      .integer()
      .min(0)
      .max(30)
      .optional()
      .messages({
        "number.base": t("fieldValidation.experienceMustBeNumber"),
        "number.min": t("fieldValidation.experienceRange"),
        "number.max": t("fieldValidation.experienceRange"),
      }),

    monthlySalary: Joi.object({
      amount: Joi.alternatives()
        .try(Joi.number().min(0), Joi.string().allow("").optional())
        .optional(),
      currency: Joi.string().default("SAR"),
    }).optional(),

    yearSalary: Joi.object({
      amount: Joi.alternatives()
        .try(Joi.number().min(0), Joi.string().allow("").optional())
        .optional(),
      currency: Joi.string().default("SAR"),
    }).optional(),

    contractEndDate: Joi.alternatives()
      .try(Joi.date(), Joi.string().allow("").optional())
      .optional(),

    transferredTo: Joi.object({
      club: Joi.string().allow("").optional(),
      startDate: Joi.alternatives()
        .try(Joi.date(), Joi.string().allow("").optional())
        .optional(),
      endDate: Joi.alternatives()
        .try(Joi.date(), Joi.string().allow("").optional())
        .optional(),
      amount: Joi.alternatives()
        .try(Joi.number().min(0), Joi.string().allow("").optional())
        .optional(),
    }).optional(),

    socialLinks: Joi.object({
      instagram: Joi.string().uri().allow("").optional(),
      twitter: Joi.string().uri().allow("").optional(),
      whatsapp: Joi.string().allow("").optional(),
      youtube: Joi.string().uri().allow("").optional(),
    }).optional(),

    isPromoted: Joi.object({
      status: Joi.boolean().default(false),
      startDate: Joi.string().allow("", null).optional(),
      endDate: Joi.string().allow("", null).optional(),
      type: Joi.string()
        .valid("featured", "premium")
        .allow(null)
        .default("featured"),
    }).optional(),

    contactInfo: Joi.object({
      isHidden: Joi.boolean().default(false),
      email: Joi.string().email().allow("").optional(),
      phone: Joi.string().allow("").optional(),
      agent: Joi.object({
        name: Joi.string().allow("").optional(),
        phone: Joi.string().allow("").optional(),
        email: Joi.string().email().allow("").optional(),
      }).optional(),
    }).optional(),

    game: Joi.alternatives()
      .try(
        Joi.string()
          .min(2)
          .required()
          .messages({
            "string.empty": t("sportsValidation.sportRequired"),
            "string.min": t("sportsValidation.sportRequired"),
          }),
        Joi.object({
          ar: Joi.string().required(),
          en: Joi.string().required(),
          slug: Joi.string().optional(),
        })
          .required()
          .messages({
            "object.base": t("sportsValidation.sportRequired"),
            "any.required": t("sportsValidation.sportRequired"),
          })
      )
      .required()
      .messages({
        "alternatives.match": t("sportsValidation.sportRequired"),
        "any.required": t("sportsValidation.sportRequired"),
      }),

    customSport: Joi.when("game", {
      is: Joi.alternatives().try("other", Joi.object({ slug: "other" })),
      then: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
          "string.empty": t("sportsValidation.customSportRequired"),
          "string.min": t("sportsValidation.customSportTooShort"),
          "string.max": t("sportsValidation.customSportTooLong"),
        }),
      otherwise: Joi.string()
        .min(2)
        .max(50)
        .allow("")
        .optional()
        .messages({
          "string.empty": t("sportsValidation.customSportRequired"),
          "string.min": t("sportsValidation.customSportTooShort"),
          "string.max": t("sportsValidation.customSportTooLong"),
        }),
    }),

    media: Joi.object({
      video: Joi.object({
        url: Joi.string().allow(null).optional(),
        publicId: Joi.string().allow(null).optional(),
        title: Joi.string().allow(null).optional(),
        duration: Joi.number().default(0),
        uploadedAt: Joi.string().allow(null).optional(),
      }).optional(),
      document: Joi.object({
        url: Joi.string().allow(null).optional(),
        publicId: Joi.string().allow(null).optional(),
        title: Joi.string().allow(null).optional(),
        type: Joi.string().allow(null).optional(),
        size: Joi.number().default(0),
        uploadedAt: Joi.string().allow(null).optional(),
      }).optional(),
      images: Joi.array()
        .items(
          Joi.object({
            url: Joi.string().allow(null).optional(),
            publicId: Joi.string().allow(null).optional(),
            title: Joi.string().allow(null).optional(),
            type: Joi.string().allow(null).optional(),
            size: Joi.number().default(0),
            uploadedAt: Joi.string().allow(null).optional(),
          })
        )
        .max(4)
        .optional(),
    }).optional(),

    agreeToTerms: Joi.boolean()
      .valid(true)
      .required()
      .messages({
        "any.only": t("sportsValidation.termsAcceptanceRequired"),
        "any.required": t("sportsValidation.termsAcceptanceRequired"),
      }),

    profilePicturePreview: Joi.string().allow("").optional(),
    profilePictureFile: Joi.any().optional(),
    documentFile: Joi.any().optional(),
    jopSelected: Joi.boolean().optional(),
    statusSelected: Joi.boolean().optional(),
    gameSelected: Joi.boolean().optional(),
    isActive: Joi.boolean().default(false),
    views: Joi.number().default(0),
    seo: Joi.object().optional(),
  });

export const playerFormSchema = (t) =>
  Joi.object({
    name: Joi.string().min(2).max(100).required(),
    age: Joi.number().integer().min(15).max(50).required(),
    gender: Joi.string().valid("male", "female").required(),
    nationality: Joi.string()
      .valid(
        "saudi",
        "uae",
        "egypt",
        "morocco",
        "kuwait",
        "qatar",
        "bahrain",
        "oman",
        "jordan",
        "lebanon",
        "syria",
        "iraq",
        "libya",
        "tunisia",
        "algeria",
        "sudan",
        "yemen",
        "other"
      )
      .required(),
    customNationality: Joi.when("nationality", {
      is: "other",
      then: Joi.string().min(2).max(50).required(),
      otherwise: Joi.optional(),
    }),
    birthCountry: Joi.string()
      .valid(
        "saudi",
        "uae",
        "egypt",
        "morocco",
        "kuwait",
        "qatar",
        "bahrain",
        "oman",
        "jordan",
        "lebanon",
        "syria",
        "iraq",
        "libya",
        "tunisia",
        "algeria",
        "sudan",
        "yemen",
        "other"
      )
      .required(),
    customBirthCountry: Joi.when("birthCountry", {
      is: "other",
      then: Joi.string().min(2).max(50).required(),
      otherwise: Joi.optional(),
    }),
    jop: Joi.string().valid("player", "coach").required(),
    roleType: Joi.when("jop", {
      is: Joi.exist(),
      then: Joi.alternatives()
        .try(
          Joi.string()
            .required()
            .messages({
              "string.empty": t("sportsValidation.roleTypeRequired"),
              "any.required": t("sportsValidation.roleTypeRequired"),
            }),
          Joi.object({
            ar: Joi.string().required(),
            en: Joi.string().required(),
            slug: Joi.string().optional(),
          })
            .required()
            .messages({
              "object.base": t("sportsValidation.roleTypeRequired"),
              "any.required": t("sportsValidation.roleTypeRequired"),
            })
        )
        .required()
        .messages({
          "alternatives.match": t("sportsValidation.roleTypeRequired"),
          "any.required": t("sportsValidation.roleTypeRequired"),
        }),
      otherwise: Joi.alternatives()
        .try(
          Joi.string().optional(),
          Joi.object({
            ar: Joi.string().optional(),
            en: Joi.string().optional(),
            slug: Joi.string().optional(),
          }).optional()
        )
        .optional(),
    }),
    customRoleType: Joi.when("roleType", {
      is: Joi.alternatives().try("other", Joi.object({ slug: "other" })),
      then: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
          "string.empty": t("sportsValidation.customRoleTypeRequired"),
          "string.min": t("sportsValidation.customRoleTypeTooShort"),
          "string.max": t("sportsValidation.customRoleTypeTooLong"),
        }),
      otherwise: Joi.optional(),
    }),
    position: Joi.when("jop", {
      is: "player",
      then: Joi.alternatives()
        .try(
          Joi.string()
            .min(2)
            .max(100)
            .required()
            .messages({
              "string.empty": t("sportsValidation.positionRequired"),
              "string.min": t("sportsValidation.positionTooShort"),
              "string.max": t("sportsValidation.positionTooShort"),
            }),
          Joi.object({
            ar: Joi.string().required(),
            en: Joi.string().required(),
            slug: Joi.string().optional(),
          })
            .required()
            .messages({
              "object.base": t("sportsValidation.positionRequired"),
              "any.required": t("sportsValidation.positionRequired"),
            })
        )
        .required()
        .messages({
          "alternatives.match": t("sportsValidation.positionRequired"),
          "any.required": t("sportsValidation.positionRequired"),
        }),
      otherwise: Joi.alternatives()
        .try(
          Joi.string().allow("").optional(),
          Joi.object({
            ar: Joi.string().optional(),
            en: Joi.string().optional(),
            slug: Joi.string().optional(),
          }).optional()
        )
        .optional(),
    }),
    customPosition: Joi.when(Joi.ref("jop"), {
      is: "player",
      then: Joi.when("position", {
        is: Joi.alternatives().try("other", Joi.object({ slug: "other" })),
        then: Joi.string()
          .min(2)
          .max(50)
          .required()
          .messages({
            "string.empty": t("sportsValidation.customPositionRequired"),
            "string.min": t("sportsValidation.customPositionTooShort"),
            "string.max": t("sportsValidation.customPositionTooLong"),
          }),
        otherwise: Joi.optional(),
      }),
      otherwise: Joi.optional(),
    }),
    status: Joi.string()
      .valid("available", "contracted", "transferred")
      .required(),
    experience: Joi.number().integer().min(0).max(30).optional(),
    monthlySalary: Joi.object({
      amount: Joi.alternatives()
        .try(Joi.number().min(0), Joi.string().allow("").optional())
        .optional(),
      currency: Joi.string().default("SAR"),
    }).optional(),
    yearSalary: Joi.object({
      amount: Joi.alternatives()
        .try(Joi.number().min(0), Joi.string().allow("").optional())
        .optional(),
      currency: Joi.string().default("SAR"),
    }).optional(),
    contractEndDate: Joi.alternatives()
      .try(Joi.date(), Joi.string().allow("").optional())
      .optional(),
    transferredTo: Joi.object({
      club: Joi.string().allow("").optional(),
      startDate: Joi.alternatives()
        .try(Joi.date(), Joi.string().allow("").optional())
        .optional(),
      endDate: Joi.alternatives()
        .try(Joi.date(), Joi.string().allow("").optional())
        .optional(),
      amount: Joi.alternatives()
        .try(Joi.number().min(0), Joi.string().allow("").optional())
        .optional(),
    }).optional(),
    socialLinks: Joi.object({
      instagram: Joi.string().uri().allow("").optional(),
      twitter: Joi.string().uri().allow("").optional(),
      whatsapp: Joi.string().allow("").optional(),
      youtube: Joi.string().uri().allow("").optional(),
    }).optional(),
    isPromoted: Joi.object({
      status: Joi.boolean().default(false),
      startDate: Joi.string().allow("", null).optional(),
      endDate: Joi.string().allow("", null).optional(),
      type: Joi.string()
        .valid("featured", "premium")
        .allow(null)
        .default("featured"),
    }).optional(),
    contactInfo: Joi.object({
      isHidden: Joi.boolean().default(false),
      email: Joi.string().email().allow("").optional(),
      phone: Joi.string().allow("").optional(),
      agent: Joi.object({
        name: Joi.string().allow("").optional(),
        phone: Joi.string().allow("").optional(),
        email: Joi.string().email().allow("").optional(),
      }).optional(),
    }).optional(),
    game: Joi.alternatives()
      .try(
        Joi.string()
          .min(2)
          .required()
          .messages({
            "string.empty": t("sportsValidation.sportRequired"),
            "string.min": t("sportsValidation.sportRequired"),
          }),
        Joi.object({
          ar: Joi.string().required(),
          en: Joi.string().required(),
          slug: Joi.string().optional(),
        })
          .required()
          .messages({
            "object.base": t("sportsValidation.sportRequired"),
            "any.required": t("sportsValidation.sportRequired"),
          })
      )
      .required()
      .messages({
        "alternatives.match": t("sportsValidation.sportRequired"),
        "any.required": t("sportsValidation.sportRequired"),
      }),
    customSport: Joi.when("game", {
      is: Joi.alternatives().try("other", Joi.object({ slug: "other" })),
      then: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
          "string.empty": t("sportsValidation.customSportRequired"),
          "string.min": t("sportsValidation.customSportTooShort"),
          "string.max": t("sportsValidation.customSportTooLong"),
        }),
      otherwise: Joi.string()
        .min(2)
        .max(50)
        .allow("")
        .optional()
        .messages({
          "string.empty": t("sportsValidation.customSportRequired"),
          "string.min": t("sportsValidation.customSportTooShort"),
          "string.max": t("sportsValidation.customSportTooLong"),
        }),
    }),
    media: Joi.object({
      video: Joi.object({
        url: Joi.string().allow(null).optional(),
        publicId: Joi.string().allow(null).optional(),
        title: Joi.string().allow(null).optional(),
        duration: Joi.number().default(0),
        uploadedAt: Joi.string().allow(null).optional(),
      }).optional(),
      document: Joi.object({
        url: Joi.string().allow(null).optional(),
        publicId: Joi.string().allow(null).optional(),
        title: Joi.string().allow(null).optional(),
        type: Joi.string().allow(null).optional(),
        size: Joi.number().default(0),
        uploadedAt: Joi.string().allow(null).optional(),
      }).optional(),
      images: Joi.array()
        .items(
          Joi.object({
            url: Joi.string().allow(null).optional(),
            publicId: Joi.string().allow(null).optional(),
            title: Joi.string().allow(null).optional(),
            type: Joi.string().allow(null).optional(),
            size: Joi.number().default(0),
            uploadedAt: Joi.string().allow(null).optional(),
          })
        )
        .max(4)
        .optional(),
    }).optional(),
    agreeToTerms: Joi.boolean().valid(true).required(),
    profilePicturePreview: Joi.string().allow("").optional(),
    profilePictureFile: Joi.any().optional(),
    documentFile: Joi.any().optional(),
    jopSelected: Joi.boolean().optional(),
    statusSelected: Joi.boolean().optional(),
    gameSelected: Joi.boolean().optional(),
    customPosition: Joi.when("position", {
      is: Joi.alternatives().try("other", Joi.object({ slug: "other" })),
      then: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
          "string.empty": t("sportsValidation.customPositionRequired"),
          "string.min": t("sportsValidation.customPositionTooShort"),
          "string.max": t("sportsValidation.customPositionTooLong"),
        }),
      otherwise: Joi.optional(),
    }),
    isActive: Joi.boolean().default(false),
    views: Joi.number().default(0),
    seo: Joi.object().optional(),
  });
