import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "جميع المدربين - اعثر على أفضل المدربين الرياضيين | All Coaches - Find Top Sports Trainers",
  description:
    "تصفح أفضل المدربين الرياضيين المعتمدين في جميع الرياضات. مدربون محترفون ذوو خبرة عالية لتطوير مهاراتك الرياضية. البحث حسب الرياضة والخبرة والتخصص. Browse certified sports coaches across all disciplines. Professional trainers with extensive experience to develop your athletic skills.",
  keywords: [
    "مدربين رياضيين",
    "مدربون محترفون",
    "تدريب رياضي",
    "مدربين معتمدين",
    "تطوير المهارات الرياضية",
    "الأكاديميات الرياضية",
    "sports coaches",
    "professional trainers",
    "sports training",
    "certified coaches",
    "athletic development",
    "sports academies",
    "personal trainers",
    "team coaches",
    "skill development",
    "sports mentorship",
    "Saudi coaches",
    "experienced trainers",
  ],
  openGraph: {
    title:
      "جميع المدربين - أفضل المدربين الرياضيين | Professional Sports Coaches",
    description:
      "مئات المدربين المعتمدين في أكثر من 11 رياضة. خبرة عالية وشهادات معترف بها دولياً. Hundreds of certified coaches across 11+ sports with international credentials.",
    url: "https://muta7markt.com/coaches",
    images: [
      {
        url: "/assets/coaches-hero.png",
        width: 1200,
        height: 630,
        alt: "جميع المدربين في متاح ماركت - All Coaches at Muta7Market",
      },
    ],
  },
  twitter: {
    title: "All Coaches - Muta7Market Professional Trainers",
    description:
      "Certified sports coaches across all disciplines. Find experienced trainers to develop your athletic potential.",
  },
  alternates: {
    canonical: "/coaches",
  },
};

export default function CoachesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
