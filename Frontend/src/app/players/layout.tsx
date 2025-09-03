import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    " اللاعبين - اكتشف المواهب الرياضية | Players - Discover Athletic Talents",
  description:
    "تصفح آلاف اللاعبين الموهوبين في جميع الرياضات. لاعبون محترفون وهواة من السعودية والمنطقة. البحث حسب الرياضة، الفئة، الجنسية والحالة التعاقدية. Browse thousands of talented players across all sports. Professional and amateur athletes from Saudi Arabia and the region.",
  keywords: [
    "لاعبين",
    "مواهب رياضية",
    "لاعبون محترفون",
    "لاعبون هواة",
    "البحث عن لاعبين",
    "التوظيف الرياضي",
    "الانتقالات الرياضية",
    "players",
    "athletic talents",
    "professional athletes",
    "amateur players",
    "player search",
    "sports recruitment",
    "player transfers",
    "free agents",
    "contracted players",
    "sports profiles",
    "athlete directory",
    "Saudi players",
    "Middle East athletes",
  ],
  openGraph: {
    title: "جميع اللاعبين - اكتشف المواهب الرياضية | All Players Directory",
    description:
      "آلاف اللاعبين المسجلين في أكثر من 11 رياضة. ابحث عن المواهب وتواصل معها مباشرة. Thousands of registered players across 11+ sports. Search for talents and connect directly.",
    url: "https://muta7markt.com/players",
    images: [
      {
        url: "/assets/players-hero.png",
        width: 1200,
        height: 630,
        alt: "جميع اللاعبين في متاح ماركت - All Players at Muta7Market",
      },
    ],
  },
  twitter: {
    title: "All Players - Muta7Market Athlete Directory",
    description:
      "Thousands of players across all sports. Find professional and amateur athletes from Saudi Arabia and beyond.",
  },
  alternates: {
    canonical: "/players",
  },
};

export default function PlayersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
