import Joi from "joi";

const sportObjectSchema = Joi.object({
  ar: Joi.string().required(),
  en: Joi.string().required(),
  slug: Joi.string().required(),
}).allow(null);

export const playerFormSchema = Joi.object({
  // --- Basic Info ---
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "الاسم مطلوب",
    "string.min": "الاسم يجب أن يكون على الأقل حرفين",
    "string.max": "الاسم طويل جدًا",
  }),
  age: Joi.number().integer().min(10).max(80).required().messages({
    "number.base": "العمر يجب أن يكون رقمًا",
    "number.empty": "العمر مطلوب",
    "number.min": "العمر يجب أن لا يقل عن 10 سنوات",
    "number.max": "العمر يجب أن لا يزيد عن 80 سنة",
  }),
  gender: Joi.string().valid("male", "female").required().messages({
    "any.only": "يرجى اختيار الجنس",
    "string.empty": "يرجى اختيار الجنس",
  }),
  nationality: Joi.string().required().messages({
    "string.empty": "الجنسية مطلوبة",
  }),
  customNationality: Joi.string().when('nationality', {
    is: 'other',
    then: Joi.string().required().messages({ "string.empty": "يرجى تحديد الجنسية" }),
    otherwise: Joi.optional().allow(""),
  }),
  birthCountry: Joi.string().optional().allow(""),
  customBirthCountry: Joi.string().when('birthCountry', {
    is: 'other',
    then: Joi.string().required().messages({ "string.empty": "يرجى تحديد بلد الميلاد" }),
    otherwise: Joi.optional().allow(""),
  }),

  // --- Professional Info ---
  jop: Joi.string().valid("player", "coach").required().messages({
    "any.only": "الفئة (الوظيفة) مطلوبة",
    "string.empty": "الفئة (الوظيفة) مطلوبة",
  }),
  game: sportObjectSchema.required().messages({
    "object.base": "الرياضة مطلوبة",
    "any.required": "الرياضة مطلوبة",
  }),
  customSport: Joi.string().when('game', {
    is: Joi.object({ slug: 'other' }).unknown(),
    then: Joi.string().required().messages({ "string.empty": "يرجى تحديد الرياضة" }),
    otherwise: Joi.optional().allow(""),
  }),
  roleType: sportObjectSchema.when('jop', {
    is: Joi.exist(),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }).messages({
    "any.required": "الفئة مطلوبة",
  }),
  customRoleType: Joi.string().when('roleType', {
    is: Joi.object({ slug: 'other' }).unknown(),
    then: Joi.string().required().messages({ "string.empty": "يرجى تحديد الفئة" }),
    otherwise: Joi.optional().allow(""),
  }),
  position: sportObjectSchema.when('jop', {
    is: 'player',
    then: Joi.required().messages({ "any.required": "المركز مطلوب للاعب" }),
    otherwise: Joi.optional(),
  }),
  customPosition: Joi.string().when('position', {
    is: Joi.object({ slug: 'other' }).unknown(),
    then: Joi.string().required().messages({ "string.empty": "يرجى تحديد المركز" }),
    otherwise: Joi.optional().allow(""),
  }),
  status: Joi.string().valid("available", "contracted", "transferred").required().messages({
    "any.only": "الحالة مطلوبة",
    "string.empty": "الحالة مطلوبة",
  }),
  experience: Joi.number().min(0).max(80).optional().allow(null, "").messages({
    "number.base": "يجب أن تكون سنوات الخبرة رقمًا",
    "number.min": "يجب أن تكون الخبرة 0 أو أكثر",
    "number.max": "يجب ألا تتجاوز الخبرة 80 عامًا",
  }),

  // --- Financial Info ---
  monthlySalary: Joi.object({
    amount: Joi.number().min(0).optional().allow(null, ""),
    currency: Joi.string().optional().allow(null, ""),
  }),
  yearSalary: Joi.object({
    amount: Joi.number().min(0).optional().allow(null, ""),
    currency: Joi.string().optional().allow(null, ""),
  }),
  contractEndDate: Joi.date().optional().allow(null, ""),
  transferredTo: Joi.object({
    club: Joi.string().optional().allow(null, "").max(100),
    startDate: Joi.date().optional().allow(null, ""),
    endDate: Joi.date().optional().allow(null, ""),
    amount: Joi.number().min(0).optional().allow(null, ""),
  }),

  // --- Contact Info ---
  socialLinks: Joi.object({
    instagram: Joi.string().uri().optional().allow(null, "").messages({ "string.uri": "رابط Instagram غير صالح" }),
    twitter: Joi.string().uri().optional().allow(null, "").messages({ "string.uri": "رابط Twitter غير صالح" }),
    whatsapp: Joi.string().optional().allow(null, ""),
    youtube: Joi.string().uri().optional().allow(null, "").messages({ "string.uri": "رابط YouTube غير صالح" }),
  }),
  contactInfo: Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).optional().allow(null, "").messages({ "string.email": "البريد الإلكتروني غير صحيح" }),
    phone: Joi.string().optional().allow(null, ""),
    agent: Joi.object({
      name: Joi.string().optional().allow(null, ""),
      phone: Joi.string().optional().allow(null, ""),
      email: Joi.string().email({ tlds: { allow: false } }).optional().allow(null, "").messages({ "string.email": "بريد الوكيل غير صحيح" }),
    }),
  }),

  // --- System Settings ---
  isPromoted: Joi.object({
    status: Joi.boolean(),
    startDate: Joi.date().optional().allow(null, ""),
    endDate: Joi.date().optional().allow(null, ""),
    type: Joi.string().optional().allow(null, ""),
  }),
  isListed: Joi.boolean(),
  isActive: Joi.boolean(),
  isConfirmed: Joi.boolean(),
  views: Joi.number().integer().min(0),
});
