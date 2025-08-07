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
}

export interface DocumentMedia {
  url: string;
  publicId: string;
  title: string;
  type: string;
  uploadedAt: string;
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
