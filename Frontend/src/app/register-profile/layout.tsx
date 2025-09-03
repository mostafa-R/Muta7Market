import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "تسجيل الملف الرياضي - أنشئ ملفك الرياضي المتميز | Create Sports Profile",
  description:
    "أنشئ ملفك الرياضي الاحترافي في متاح ماركت. أضف مهاراتك وإنجازاتك وخبراتك الرياضية لتظهر للأندية والمدربين والكشافة. سواء كنت لاعباً أو مدرباً، ابدأ رحلتك المهنية اليوم. Create your professional sports profile on Muta7Market. Showcase your skills, achievements, and experience to clubs, coaches, and scouts.",
  keywords: [
    "تسجيل الملف الرياضي",
    "ملف اللاعب",
    "ملف المدرب",
    "السيرة الذاتية الرياضية",
    "عرض المهارات الرياضية",
    "الملف المهني",
    "sports profile",
    "player profile",
    "coach profile",
    "athletic resume",
    "sports portfolio",
    "professional profile",
    "showcase skills",
    "sports CV",
    "athlete registration",
    "talent profile",
    "sports career",
  ],
  openGraph: {
    title:
      "تسجيل الملف الرياضي - أنشئ ملفك المتميز | Create Your Sports Profile",
    description:
      "اظهر مواهبك وخبراتك للعالم. ملف رياضي شامل يساعدك في الوصول للفرص المناسبة. Showcase your talents and experience to the world with a comprehensive sports profile.",
    url: "https://muta7markt.com/register-profile",
    images: [
      {
        url: "/assets/profile-creation.png",
        width: 1200,
        height: 630,
        alt: "إنشاء الملف الرياضي - Create Sports Profile",
      },
    ],
  },
  twitter: {
    title: "Create Your Sports Profile - Muta7Market",
    description:
      "Build your professional sports profile. Showcase skills, experience, and achievements to reach new opportunities.",
  },
  alternates: {
    canonical: "/register-profile",
  },
};

export default function RegisterProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
