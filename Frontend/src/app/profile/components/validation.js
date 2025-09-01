import Joi from "joi";

export const createUserSchema = (t) =>
  Joi.object({
    _id: Joi.string().required(),
    name: Joi.string()
      .min(3)
      .required()
      .messages({ "string.empty": t("validation.nameRequired") }),
    profileImage: Joi.string().uri().allow("").optional(),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.email": t("validation.invalidEmail"),
      }),
    phone: Joi.string().allow("").optional(),
    role: Joi.string().required(),
    isEmailVerified: Joi.boolean().required(),
    isPhoneVerified: Joi.boolean().required(),
    phoneVerificationOTP: Joi.string().allow("").optional(),
    phoneVerificationExpires: Joi.date().iso().allow(null).optional(),
    isActive: Joi.boolean().required(),
    refreshTokens: Joi.array().items(Joi.string()).optional(),
    __v: Joi.number().optional(),
    createdAt: Joi.date().iso().required(),
    updatedAt: Joi.date().iso().required(),
    lastLogin: Joi.date().iso().allow(null).optional(),
    address: Joi.string().allow("").optional(),
    occupation: Joi.string().allow("").optional(),
    website: Joi.string().uri().allow("").optional(),
    bio: Joi.string().allow("").optional(),
    dateOfBirth: Joi.date().iso().allow(null).optional(),
  });

export const createPendingPaymentSchema = (t) =>
  Joi.object({
    id: Joi.string().required(),
    itemName: Joi.string().required(),
    price: Joi.number().positive().required(),
    orderDate: Joi.date().iso().required(),
  });

export const createPlayerSchema = (t) =>
  Joi.object({
    _id: Joi.string().required(),
    user: Joi.string().allow(null).optional(),
    name: Joi.alternatives()
      .try(
        Joi.object({
          en: Joi.string()
            .min(1)
            .allow("")
            .optional()
            .messages({
              "string.min": t("validation.nameEnMinLength"),
            }),
          ar: Joi.string()
            .min(1)
            .allow("")
            .optional()
            .messages({
              "string.min": t("validation.nameArMinLength"),
            }),
        }),
        Joi.string().allow("").optional()
      )
      .optional(),
    age: Joi.number()
      .integer()
      .min(15)
      .max(50)
      .allow(null)
      .optional()
      .messages({
        "number.base": t("validation.ageMustBeNumber"),
        "number.min": t("validation.ageMin"),
        "number.max": t("validation.ageMax"),
      }),
    gender: Joi.string()
      .valid("Male", "Female")
      .allow(null)
      .optional()
      .messages({
        "any.only": t("validation.genderRequired"),
      }),
    nationality: Joi.string()
      .min(2)
      .allow("")
      .optional()
      .messages({
        "string.min": t("validation.nationalityMinLength"),
      }),
    jop: Joi.string()
      .valid("player", "coach")
      .allow(null)
      .optional()
      .messages({
        "any.only": t("validation.categoryRequired"),
      }),
    position: Joi.alternatives()
      .try(
        Joi.object({
          en: Joi.string()
            .allow("")
            .optional()
            .messages({
              "string.max": t("validation.positionEnMaxLength"),
            }),
          ar: Joi.string()
            .allow("")
            .optional()
            .messages({
              "string.max": t("validation.positionArMaxLength"),
            }),
        }),
        Joi.string().allow("").optional()
      )
      .optional(),
    status: Joi.string()
      .valid("available", "contracted", "transferred")
      .allow(null)
      .optional()
      .messages({
        "any.only": t("validation.statusRequired"),
      }),
    expreiance: Joi.number()
      .min(0)
      .max(30)
      .allow(null)
      .optional()
      .messages({
        "number.base": t("validation.experienceMustBeNumber"),
        "number.min": t("validation.experienceMin"),
        "number.max": t("validation.experienceMax"),
      }),
    monthlySalary: Joi.object({
      amount: Joi.number()
        .min(0)
        .allow(0)
        .optional()
        .messages({
          "number.base": t("validation.amountMustBeNumber"),
          "number.min": t("validation.amountMin"),
        }),
      currency: Joi.string().default("SAR").optional(),
    }).optional(),
    yearSalary: Joi.object({
      amount: Joi.number()
        .min(0)
        .allow(0)
        .optional()
        .messages({
          "number.base": t("validation.amountMustBeNumber"),
          "number.min": t("validation.amountMin"),
        }),
      currency: Joi.string().default("SAR").optional(),
    }).optional(),
    contractEndDate: Joi.date()
      .iso()
      .allow(null)
      .optional()
      .messages({
        "date.base": t("validation.validContractEndDate"),
      }),
    transferredTo: Joi.object({
      club: Joi.string().allow(null).optional(),
      date: Joi.date()
        .iso()
        .allow(null)
        .optional()
        .messages({
          "date.base": t("validation.validTransferDate"),
        }),
      amount: Joi.number()
        .min(0)
        .allow(0)
        .optional()
        .messages({
          "number.base": t("validation.amountMustBeNumber"),
          "number.min": t("validation.amountMin"),
        }),
    }).optional(),
    media: Joi.object({
      profileImage: Joi.object({
        url: Joi.string().allow(null).optional(),
        publicId: Joi.string().allow(null).optional(),
      }).optional(),
      videos: Joi.array()
        .items(
          Joi.object({
            url: Joi.string().allow("").optional(),
            publicId: Joi.string().allow("").optional(),
            title: Joi.string().allow("").optional(),
            duration: Joi.number().min(0).allow(0).optional(),
            uploadedAt: Joi.date().iso().allow(null).optional(),
          })
        )
        .optional(),
      documents: Joi.array()
        .items(
          Joi.object({
            url: Joi.string().allow("").optional(),
            publicId: Joi.string().allow("").optional(),
            title: Joi.string().allow("").optional(),
            type: Joi.string().allow("").optional(),
            uploadedAt: Joi.date().iso().allow(null).optional(),
          })
        )
        .optional(),
    }).optional(),
    socialLinks: Joi.object({
      instagram: Joi.string()
        .allow(null)
        .uri()
        .pattern(/^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/)
        .optional()
        .messages({
          "string.uri": t("validation.validInstagramUrl"),
          "string.pattern.base": t("validation.validInstagramUrl"),
        }),
      twitter: Joi.string()
        .allow(null)
        .uri()
        .pattern(/^(https?:\/\/)?(www\.)?(twitter|x)\.com\/[a-zA-Z0-9._]+\/?$/)
        .optional()
        .messages({
          "string.uri": t("validation.validTwitterUrl"),
          "string.pattern.base": t("validation.validTwitterUrl"),
        }),
      whatsapp: Joi.string()
        .allow(null)
        .optional()
        .messages({
          "string.pattern.base": t("validation.invalidWhatsAppNumber"),
        }),
      youtube: Joi.string()
        .allow(null)
        .uri()
        .pattern(/^(https?:\/\/)?(www\.)?youtube\.com\/[a-zA-Z0-9_-]+\/?$/)
        .optional()
        .messages({
          "string.uri": t("validation.validYoutubeUrl"),
          "string.pattern.base": t("validation.validYoutubeUrl"),
        }),
    }).optional(),
    isPromoted: Joi.object({
      status: Joi.boolean().optional(),
      startDate: Joi.date().iso().allow(null).optional(),
      endDate: Joi.date().iso().allow(null).optional(),
      type: Joi.string().allow(null).optional(),
    }).optional(),
    contactInfo: Joi.object({
      isHidden: Joi.boolean().optional(),
      email: Joi.string()
        .allow(null)
        .email({ tlds: false })
        .optional()
        .messages({
          "string.email": t("validation.invalidEmail"),
        }),
      phone: Joi.string()
        .allow(null)
        .optional()
        .messages({
          "string.pattern.base": t("validation.invalidPhoneNumber"),
        }),
      agent: Joi.object({
        name: Joi.string().allow(null).optional(),
        phone: Joi.string()
          .allow(null)
          .optional()
          .messages({
            "string.pattern.base": t("validation.invalidAgentPhoneNumber"),
          }),
        email: Joi.string()
          .allow(null)
          .email({ tlds: false })
          .optional()
          .messages({
            "string.email": t("validation.invalidAgentEmail"),
          }),
      }).optional(),
    }).optional(),
    game: Joi.string()
      .min(2)
      .allow("")
      .optional()
      .messages({
        "string.min": t("validation.sportMinLength"),
      }),
    views: Joi.number().min(0).optional(),
    isActive: Joi.boolean().optional(),
    createdAt: Joi.date().iso().allow(null).optional(),
    updatedAt: Joi.date().iso().allow(null).optional(),
  });

export const createProfileFormSchema = (t) =>
  Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        "string.empty": t("validation.nameRequired"),
        "string.min": t("validation.nameMinLength"),
        "string.max": t("validation.nameMaxLength"),
      }),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.email": t("validation.invalidEmail"),
        "string.empty": t("validation.emailRequired"),
      }),
    phone: Joi.string()
      .pattern(/^(\+?\d{1,3}[- ]?)?\d{7,14}$/)
      .allow("")
      .optional()
      .messages({
        "string.pattern.base": t("validation.invalidPhoneNumber"),
      }),
    bio: Joi.string()
      .max(200)
      .allow("")
      .optional()
      .messages({
        "string.max": t("validation.bioMaxLength"),
      }),
    newPassword: Joi.string()
      .min(8)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .allow("")
      .optional()
      .messages({
        "string.pattern.base": t("validation.passwordPattern"),
        "string.min": t("validation.passwordMinLength"),
      }),
    confirmPassword: Joi.string().when("newPassword", {
      is: Joi.string().min(1),
      then: Joi.string()
        .valid(Joi.ref("newPassword"))
        .required()
        .messages({
          "any.only": t("validation.passwordsDoNotMatch"),
          "string.empty": t("validation.confirmPasswordRequired"),
        }),
      otherwise: Joi.string().allow("").optional(),
    }),
    oldPassword: Joi.string().when("newPassword", {
      is: Joi.string().min(1),
      then: Joi.string()
        .required()
        .messages({
          "string.empty": t("validation.currentPasswordRequired"),
        }),
      otherwise: Joi.string().allow("").optional(),
    }),
  });

export const UserSchema = createUserSchema(() => "Error");
export const PendingPaymentSchema = createPendingPaymentSchema(() => "Error");
export const PlayerSchema = createPlayerSchema(() => "Error");
export const ProfileFormSchema = createProfileFormSchema(() => "Error");
