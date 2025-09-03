import { Metadata } from "next";

export const metadata: Metadata = {
  title: "إنشاء حساب جديد - انضم لمتاح ماركت | Sign Up - Join Muta7Market",
  description:
    "أنشئ حسابك المجاني في متاح ماركت اليوم وابدأ رحلتك الرياضية. انضم لآلاف اللاعبين والمدربين في أكبر منصة رياضية بالمنطقة. Create your free Muta7Market account today and start your sports journey. Join thousands of players and coaches on the region's largest sports platform.",
  keywords: [
    "إنشاء حساب",
    "تسجيل جديد",
    "انضمام متاح ماركت",
    "حساب مجاني",
    "تسجيل لاعب",
    "تسجيل مدرب",
    "sign up",
    "create account",
    "join Muta7Market",
    "free registration",
    "player registration",
    "coach registration",
    "new account",
  ],
  openGraph: {
    title: "إنشاء حساب - انضم لمتاح ماركت | Create Your Sports Account",
    description:
      "سجل مجاناً واكتشف عالم الرياضة. تواصل مع اللاعبين والمدربين وطور مهاراتك. Register for free and discover the world of sports.",
    url: "https://muta7markt.com/signup",
    images: [
      {
        url: "/assets/signup-hero.png",
        width: 1200,
        height: 630,
        alt: "انضم لمتاح ماركت - Join Muta7Market",
      },
    ],
  },
  twitter: {
    title: "Join Muta7Market - Create Your Sports Account",
    description:
      "Register for free and connect with thousands of athletes and coaches across the Middle East.",
  },
  alternates: {
    canonical: "/signup",
  },
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
