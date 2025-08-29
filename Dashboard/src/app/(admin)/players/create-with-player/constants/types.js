/**
 * Form Data Structure for Player Creation
 * This file defines the structure and constants used in the player creation form
 */

// Step numbers constants
export const FORM_STEPS = {
  ACCOUNT_INFO: 1,
  PERSONAL_INFO: 2,
  PROFESSIONAL_INFO: 3,
  CONTACT_INFO: 4,
  MEDIA_UPLOAD: 5
};

// Step titles in Arabic
export const STEP_TITLES = {
  [FORM_STEPS.ACCOUNT_INFO]: "معلومات الحساب",
  [FORM_STEPS.PERSONAL_INFO]: "المعلومات الشخصية", 
  [FORM_STEPS.PROFESSIONAL_INFO]: "المعلومات المهنية",
  [FORM_STEPS.CONTACT_INFO]: "معلومات التواصل",
  [FORM_STEPS.MEDIA_UPLOAD]: "الوسائط"
};

// Initial form data structure
export const INITIAL_FORM_DATA = {
  // User data
  email: "",
  name: "",
  password: "",
  phone: "",
  role: "user",
  isActive: true,
  isEmailVerified: true,

  // Player data
  age: "",
  gender: "",
  nationality: "",
  customNationality: "",
  birthCountry: "",
  customBirthCountry: "",
  jop: "",
  roleType: "",
  customRoleType: "",
  position: "",
  customPosition: "",
  status: "",
  experience: 0,
  monthlySalary: {
    amount: 0,
    currency: "",
  },
  yearSalary: {
    amount: 0,
    currency: "",
  },
  contractEndDate: "",
  transferredTo: {
    club: "",
    startDate: "",
    endDate: "",
    amount: 0,
  },
  socialLinks: {
    instagram: "",
    twitter: "",
    whatsapp: "",
    youtube: "",
  },
  contactInfo: {
    email: "",
    phone: "",
    agent: {
      name: "",
      phone: "",
      email: "",
    },
  },
  game: "",
  customSport: "",
  isListed: true,
  playerIsActive: true,
};

// Initial files state structure
export const INITIAL_FILES_STATE = {
  profileImage: null,
  document: null,
  playerVideo: null,
  images: [],
};

// Initial previews state structure
export const INITIAL_PREVIEWS_STATE = {
  profileImage: null,
  images: [],
};

// Initial custom fields state structure
export const INITIAL_CUSTOM_FIELDS_STATE = {
  nationality: false,
  birthCountry: false,
  roleType: false,
  position: false,
  sport: false,
};

// File types and limits
export const FILE_CONSTRAINTS = {
  MAX_IMAGES: 4,
  ACCEPTED_IMAGE_TYPES: ['image/*'],
  ACCEPTED_VIDEO_TYPES: ['video/*'],
  ACCEPTED_DOCUMENT_TYPES: ['.pdf', '.doc', '.docx'],
};

// Validation constraints
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  AGE_MIN: 15,
  AGE_MAX: 50,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 15,
};

// API endpoints
export const API_ENDPOINTS = {
  CREATE_PLAYER: '/admin/users-with-player',
};

// Toast message types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

// Toast durations in milliseconds
export const TOAST_DURATIONS = {
  SHORT: 3000,
  MEDIUM: 4000,
  LONG: 5000,
};

/**
 * JSDoc type definitions for better documentation
 */

/**
 * @typedef {Object} FormData
 * @property {string} email - User email (required)
 * @property {string} name - User full name (required)
 * @property {string} password - User password (required)
 * @property {string} phone - User phone number (required)
 * @property {string} role - User role (default: "user")
 * @property {boolean} isActive - Account active status
 * @property {boolean} isEmailVerified - Email verification status
 * @property {string|number} age - Player age (required)
 * @property {string} gender - Player gender (required)
 * @property {string} nationality - Player nationality (required)
 * @property {string} customNationality - Custom nationality if "other" selected
 * @property {string} birthCountry - Player birth country (required)
 * @property {string} customBirthCountry - Custom birth country if "other" selected
 * @property {string} jop - Job type ("player" or "coach")
 * @property {string} roleType - Role type (depends on job)
 * @property {string} customRoleType - Custom role type if "other" selected
 * @property {string} position - Player position
 * @property {string} customPosition - Custom position if "other" selected
 * @property {string} status - Player status ("available", "contracted", "transferred")
 * @property {number} experience - Years of experience
 * @property {SalaryInfo} monthlySalary - Monthly salary information
 * @property {SalaryInfo} yearSalary - Yearly salary information
 * @property {string} contractEndDate - Contract end date
 * @property {TransferInfo} transferredTo - Transfer information
 * @property {SocialLinks} socialLinks - Social media links
 * @property {ContactInfo} contactInfo - Contact information
 * @property {string} game - Sport type
 * @property {string} customSport - Custom sport if "other" selected
 * @property {boolean} isListed - Whether player is listed publicly
 * @property {boolean} playerIsActive - Player profile active status
 */

/**
 * @typedef {Object} SalaryInfo
 * @property {number} amount - Salary amount
 * @property {string} currency - Currency code
 */

/**
 * @typedef {Object} TransferInfo
 * @property {string} club - Club name
 * @property {string} startDate - Transfer start date
 * @property {string} endDate - Transfer end date
 * @property {number} amount - Transfer amount
 */

/**
 * @typedef {Object} SocialLinks
 * @property {string} instagram - Instagram URL
 * @property {string} twitter - Twitter URL
 * @property {string} whatsapp - WhatsApp number
 * @property {string} youtube - YouTube URL
 */

/**
 * @typedef {Object} ContactInfo
 * @property {string} email - Contact email
 * @property {string} phone - Contact phone
 * @property {AgentInfo} agent - Agent information
 */

/**
 * @typedef {Object} AgentInfo
 * @property {string} name - Agent name
 * @property {string} phone - Agent phone
 * @property {string} email - Agent email
 */

/**
 * @typedef {Object} FilesState
 * @property {File|null} profileImage - Profile image file
 * @property {File|null} document - Document file (CV)
 * @property {File|null} playerVideo - Video file
 * @property {File[]} images - Array of additional image files
 */

/**
 * @typedef {Object} PreviewsState
 * @property {string|null} profileImage - Profile image preview URL
 * @property {string[]} images - Array of image preview URLs
 */

/**
 * @typedef {Object} CustomFieldsState
 * @property {boolean} nationality - Show custom nationality field
 * @property {boolean} birthCountry - Show custom birth country field
 * @property {boolean} roleType - Show custom role type field
 * @property {boolean} position - Show custom position field
 * @property {boolean} sport - Show custom sport field
 */

const types = {
  FORM_STEPS,
  STEP_TITLES,
  INITIAL_FORM_DATA,
  INITIAL_FILES_STATE,
  INITIAL_PREVIEWS_STATE,
  INITIAL_CUSTOM_FIELDS_STATE,
  FILE_CONSTRAINTS,
  VALIDATION_RULES,
  API_ENDPOINTS,
  TOAST_TYPES,
  TOAST_DURATIONS,
};

export default types;
