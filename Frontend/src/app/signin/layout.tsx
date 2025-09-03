import { Metadata } from "next";

export const metadata: Metadata = {
  title: "تسجيل الدخول - متاح ماركت | Sign In - Muta7Market",
  description:
    "سجل دخولك إلى حسابك في متاح ماركت للوصول إلى ملفك الشخصي وإدارة بياناتك الرياضية والتواصل مع اللاعبين والمدربين. Sign in to your Muta7Market account to access your profile, manage your sports data, and connect with players and coaches.",
  keywords: [
    "تسجيل الدخول",
    "دخول الحساب",
    "تسجيل دخول متاح ماركت",
    "حساب اللاعب",
    "حساب المدرب",
    "sign in",
    "login",
    "account access",
    "player account",
    "coach account",
    "user login",
    "secure login",
  ],
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "تسجيل الدخول - متاح ماركت | Sign In to Your Account",
    description:
      "ادخل إلى حسابك للوصول إلى جميع ميزات منصة متاح ماركت الرياضية. Access all features of Muta7Market sports platform.",
    url: "https://muta7markt.com/signin",
  },
  alternates: {
    canonical: "/signin",
  },
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
