import Joi from "joi";

export const playerFormSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "الاسم مطلوب",
    "string.min": "الاسم يجب أن يكون على الأقل حرفين",
    "string.max": "الاسم طويل جدًا",
  }),
  age: Joi.number().integer().min(16).max(80).required().messages({
    "number.base": "العمر يجب أن يكون رقم",
    "number.empty": "العمر مطلوب",
    "number.min": "العمر يجب أن لا يقل عن 16",
    "number.max": "العمر يجب أن لا يزيد عن 80",
  }),
  gender: Joi.string().valid("Male", "Female").required().messages({
    "any.only": "الرجاء اختيار الجنس",
    "string.empty": "الرجاء اختيار الجنس",
  }),
  nationality: Joi.string().min(2).required().messages({
    "string.empty": "الجنسية مطلوبة",
  }),
  category: Joi.string().valid("player", "coach").required().messages({
    "any.only": "الفئة مطلوبة",
    "string.empty": "الفئة مطلوبة",
  }),
  position: Joi.string().allow("").max(100),
  status: Joi.string()
    .valid("available", "contracted", "transferred")
    .required()
    .messages({
      "any.only": "الحالة مطلوبة",
      "string.empty": "الحالة مطلوبة",
    }),
  expreiance: Joi.number().integer().min(0).max(30).allow("").messages({
    "number.base": "يجب أن يكون رقم",
    "number.min": "يجب أن يكون أكبر من أو يساوي 0",
    "number.max": "يجب أن يكون أقل من أو يساوي 30",
  }),
  monthlySalary: Joi.object({
    amount: Joi.number().min(0).allow("").messages({
      "number.base": "يجب أن يكون رقم",
      "number.min": "يجب أن لا يكون سالب",
    }),
    currency: Joi.string().allow(""),
  }),
  yearSalary: Joi.number().min(0).allow("").messages({
    "number.base": "يجب أن يكون رقم",
    "number.min": "يجب أن لا يكون سالب",
  }),
  contractEndDate: Joi.string().allow(""),
  transferredTo: Joi.object({
    club: Joi.string().allow("").max(100),
    date: Joi.string().allow(""),
    amount: Joi.alternatives().try(Joi.string(), Joi.number()).allow(""),
  }),
  media: Joi.object({
    profileImage: Joi.object({
      url: Joi.string().allow(""),
      publicId: Joi.string().allow(""),
    }),
    videos: Joi.array()
      .items(
        Joi.object({
          url: Joi.string().allow(""),
          publicId: Joi.string().allow(""),
          title: Joi.string().allow(""),
          duration: Joi.number().allow(0),
          uploadedAt: Joi.string().allow(""),
          file: Joi.any().optional(), // Allow file field for upload
        })
      )
      .allow(""),
    documents: Joi.array()
      .items(
        Joi.object({
          url: Joi.string().allow(""),
          publicId: Joi.string().allow(""),
          title: Joi.string().allow(""),
          type: Joi.string().allow(""),
          uploadedAt: Joi.string().allow(""),
          file: Joi.any().optional(), // Allow file field for upload
        })
      )
      .allow(""),
  }),
  socialLinks: Joi.object({
    instagram: Joi.string().allow("").uri({ allowRelative: false }).messages({
      "string.uri": "يجب أن يكون رابط صحيح",
    }),
    twitter: Joi.string().allow("").uri({ allowRelative: false }).messages({
      "string.uri": "يجب أن يكون رابط صحيح",
    }),
    whatsapp: Joi.string().allow(""),
    youtube: Joi.string().allow("").uri({ allowRelative: false }).messages({
      "string.uri": "يجب أن يكون رابط صحيح",
    }),
  }),
  isPromoted: Joi.object({
    status: Joi.boolean(),
    startDate: Joi.string().allow(""),
    endDate: Joi.string().allow(""),
    type: Joi.string().allow(""),
  }),
  contactInfo: Joi.object({
    isHidden: Joi.boolean(),
    email: Joi.string().allow("").email({ tlds: false }).messages({
      "string.email": "البريد الإلكتروني غير صحيح",
    }),
    phone: Joi.string()
      .allow("")
      .pattern(/^[0-9]{8,20}$/)
      .messages({
        "string.pattern.base": "رقم الهاتف غير صحيح",
      }),
    agent: Joi.object({
      name: Joi.string().allow(""),
      phone: Joi.string().allow(""),
      email: Joi.string().allow("").email({ tlds: false }).messages({
        "string.email": "بريد الوكيل غير صحيح",
      }),
    }),
  }),
  game: Joi.string().min(2).required().messages({
    "string.empty": "الرياضة مطلوبة",
  }),
  agreeToTerms: Joi.boolean().valid(true).messages({
    "any.only": "يجب الموافقة على الشروط والأحكام",
  }),
  profilePicturePreview: Joi.string().allow(""),
  profilePictureFile: Joi.any().optional(), // Changed to optional
});

// Type definitions
export type Gender = "Male" | "Female";
export type ProfileStatus = "AVAILABLE" | "CONTRACTED" | "TRANSFERRED";
export type Category = "player" | "coach";
export type PromotionType = "featured" | "premium" | "";

export interface SocialLinks {
  instagram: string;
  twitter: string;
  whatsapp: string;
  youtube: string;
}

export interface ProfileImage {
  url: string;
  publicId: string;
}

export interface VideoMedia {
  url: string;
  publicId: string;
  title: string;
  duration: number;
  uploadedAt: string;
  file?: File; // Added for upload handling
}

export interface DocumentMedia {
  url: string;
  publicId: string;
  title: string;
  type: string;
  uploadedAt: string;
  file?: File; // Added for upload handling
}

export interface Media {
  profileImage: ProfileImage;
  videos: VideoMedia[];
  documents: DocumentMedia[];
}

export interface MonthlySalary {
  amount: number;
  currency: string;
}

export interface TransferInfo {
  club: string;
  date: string;
  amount: number | "";
}

export interface IsPromoted {
  status: boolean;
  startDate: string;
  endDate: string;
  type: PromotionType;
}

export interface AgentInfo {
  name: string;
  phone: string;
  email: string;
}

export interface ContactInfo {
  isHidden: boolean;
  email: string;
  phone: string;
  agent: AgentInfo;
}

export interface PlayerFormData {
  name: string;
  age: number | "";
  gender: Gender | "";
  nationality: string;
  category: Category | "";
  position: string;
  status: ProfileStatus | "";
  expreiance: number | "";
  monthlySalary: MonthlySalary;
  yearSalary: number | "";
  contractEndDate: string;
  transferredTo: TransferInfo;
  media: Media;
  socialLinks: SocialLinks;
  isPromoted: IsPromoted;
  contactInfo: ContactInfo;
  game: string;
  agreeToTerms: boolean;
  profilePicturePreview?: string;
  profilePictureFile?: File;
}
