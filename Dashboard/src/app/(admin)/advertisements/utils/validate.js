import { z } from "zod";

export const advertisementSchema = z.object({
  titleAr: z.string().min(2, "العنوان بالعربية مطلوب"),
  titleEn: z.string().min(2, "العنوان بالإنجليزية مطلوب"),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  
  source: z.enum(["internal", "google"]).default("internal"),
  googleAdSlotId: z.string().optional(),
  googleAdFormat: z.string().optional(),

  type: z.enum(["banner", "popup", "sidebar", "featured", "inline"]),
  position: z.enum(["home", "players", "coaches", "profile", "all"]),
  
  link: z.string().url("رابط غير صالح").optional().or(z.literal('')),
  
  startDate: z.date({ required_error: "تاريخ البدء مطلوب" }),
  endDate: z.date({ required_error: "تاريخ الانتهاء مطلوب" }),
  
  isActive: z.boolean().default(true),
  priority: z.number().min(0).default(0),
  
  advertiserName: z.string().min(2, "اسم المعلن مطلوب"),
  advertiserEmail: z.string().email("بريد إلكتروني غير صالح"),
  advertiserPhone: z.string().optional(),
  
  desktopImage: z.any().optional(),
  mobileImage: z.any().optional(),
}).refine(data => data.endDate >= data.startDate, {
  message: "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء",
  path: ["endDate"],
});

export const adTypeOptions = [
  { value: "banner", label: "بانر" },
  { value: "popup", label: "نافذة منبثقة" },
  { value: "sidebar", label: "شريط جانبي" },
  { value: "featured", label: "متميز" },
  { value: "inline", label: "مدمج" },
];

export const adPositionOptions = [
  { value: "home", label: "الصفحة الرئيسية" },
  { value: "players", label: "صفحة اللاعبين" },
  { value: "coaches", label: "صفحة المدربين" },
  { value: "profile", label: "صفحة الملف الشخصي" },
  { value: "all", label: "الكل" },
];

// Gender options removed - not used in advertisements
