// types.ts
export type Gender = "Male" | "Female";
export type ProfileStatus = "AVAILABLE" | "CONTRACTED" | "TRANSFERRED";
export type Category = "player" | "coach";
export type PromotionType = "featured" | "premium" | "";

export interface YearSalary {
  amount: number;
  currency: string;
}

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
  file?: File;
}

export interface DocumentMedia {
  url: string;
  publicId: string;
  title: string;
  type: string;
  uploadedAt: string;
  file?: File;
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
  experience: number | "";
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

export const sportsOptions = [
  { label: "كرة اليد", value: "handball" },
  { label: "كرة السلة", value: "basketball" },
  { label: "الكرة الطائرة", value: "volleyball" },
  { label: "الريشة الطائرة", value: "badminton" },
  { label: "ألعاب القوى", value: "athletics" },
  { label: "التنس", value: "tennis" },
  { label: "كرة الطاولة", value: "table_tennis" },
  { label: "الكاراتيه", value: "karate" },
  { label: "التايكوندو", value: "taekwondo" },
  { label: "السهام", value: "darts" },
  { label: "الرياضات الالكترونية", value: "esports" },
  { label: "السباحة", value: "swimming" },
  { label: "الجودو", value: "judo" },
  { label: "المبارزة", value: "fencing" },
  { label: "الدراجات الهوائية", value: "cycling" },
  { label: "الإسكواش", value: "squash" },
  { label: "رفع الأثقال", value: "weightlifting" },
  { label: "كرة قدم الصالات", value: "futsal" },
  { label: "الملاكمة", value: "boxing" },
  { label: "الجمباز", value: "gymnastics" },
  { label: "البلياردو والسنوكر", value: "billiards_snooker" },
  { label: "المصارعة", value: "wrestling" },
];

export const nationalities = [
  "السعودية",
  "الإمارات",
  "مصر",
  "المغرب",
  "الكويت",
  "قطر",
  "البحرين",
  "عمان",
  "الأردن",
  "لبنان",
  "سوريا",
  "العراق",
  "ليبيا",
  "تونس",
  "الجزائر",
  "السودان",
  "اليمن",
  "أخرى",
];
