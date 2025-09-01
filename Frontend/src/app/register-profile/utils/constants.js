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
  jop: "",
  jopSelected: false,
  roleType: "",
  customRoleType: "", 
  position: "",
  customPosition: "", 
  status: "",
  statusSelected: false,
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
