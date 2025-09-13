export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
];

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const sectionRequiredFields = {
  personal: ["name", "age", "gender", "nationality", "birthCountry"],
  sports: ["game", "jop", "status", "roleType", "position"],
  financial: [],
  transfer: [],
  contact: [],
  social: [],
  media: [],
  terms: ["agreeToTerms"],
};

export const initialFormValues = {
  name: "",
  age: "",
  gender: "",
  nationality: "",
  customNationality: "",
  birthCountry: "",
  customBirthCountry: "",

  // Job type (player/coach)
  jop: "",
  jopSelected: false,
  jopName: null, // Multilingual job type name { ar: "لاعب", en: "Player" }

  // Role type (e.g., professional player, head coach)
  roleType: "",
  customRoleType: "",
  roleTypeName: null, // Multilingual role type name { ar: "...", en: "..." }
  roleTypeData: null, // Original role type data from API

  // Sport
  game: "",
  gameSelected: false,
  gameName: null, // Multilingual sport name { ar: "...", en: "..." }
  gameData: null, // Original sport data from API

  // Position
  position: "",
  customPosition: "",
  positionName: null, // Multilingual position name { ar: "...", en: "..." }
  positionData: null, // Original position data from API

  // Status
  status: "",
  statusSelected: false,
  statusName: null, // Multilingual status name { ar: "...", en: "..." }

  experience: "0",
  monthlySalary: {
    amount: "",
    currency: "SAR",
  },
  yearSalary: {
    amount: "",
    currency: "SAR",
  },
  contractEndDate: "",
  transferredTo: {
    club: "",
    startDate: "",
    endDate: "",
    amount: "",
  },
  socialLinks: {
    instagram: "",
    twitter: "",
    whatsapp: "",
    youtube: "",
  },
  contactInfo: {
    isHidden: false,
    email: "",
    phone: "",
    agent: {
      name: "",
      phone: "",
      email: "",
    },
  },
  isPromoted: {
    status: false,
    startDate: "",
    endDate: "",
    type: "featured",
  },
  media: {
    video: {
      url: null,
      publicId: null,
      title: null,
      duration: 0,
      uploadedAt: null,
    },
    document: {
      url: null,
      publicId: null,
      title: null,
      type: null,
      size: 0,
      uploadedAt: null,
    },
    images: [],
  },
  profilePicturePreview: "",
  profilePictureFile: null,
  documentFile: null,
  game: "",
  customSport: "",
  isActive: true,
  agreeToTerms: false,
};
