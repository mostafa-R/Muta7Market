import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "جميع الرياضات - اكتشف رياضتك المفضلة | All Sports - Discover Your Favorite Sport",
  description:
    "استكشف جميع الرياضات المتاحة في متاح ماركت. كرة القدم، كرة السلة، التنس، الريشة الطائرة، والمزيد. اعثر على اللاعبين والمدربين في رياضتك المفضلة. Explore all sports available on Muta7Market including football, basketball, tennis, badminton and more.",
  keywords: [
    "جميع الرياضات",
    "كرة القدم",
    "كرة السلة",
    "التنس",
    "الريشة الطائرة",
    "كرة اليد",
    "الاسكواش",
    "المصارعة",
    "الجودو",
    "التايكوندو",
    "البلياردو",
    "all sports",
    "football",
    "basketball",
    "tennis",
    "badminton",
    "handball",
    "squash",
    "wrestling",
    "judo",
    "taekwondo",
    "billiards",
    "sports categories",
    "find sports",
    "sports directory",
    "athletic sports",
  ],
  openGraph: {
    title: "جميع الرياضات - اكتشف رياضتك المفضلة | All Sports Directory",
    description:
      "استكشف أكثر من 11 رياضة مختلفة. اعثر على أفضل اللاعبين والمدربين في كل رياضة. Explore 11+ different sports and find the best players and coaches.",
    url: "https://muta7markt.com/sports",
    images: [
      {
        url: "/assets/sports-hero.png",
        width: 1200,
        height: 630,
        alt: "جميع الرياضات في متاح ماركت - All Sports at Muta7Market",
      },
    ],
  },
  twitter: {
    title: "All Sports - Muta7Market Sports Directory",
    description:
      "Discover 11+ sports categories. Find players and coaches across all sports disciplines.",
  },
  alternates: {
    canonical: "/sports",
  },
};

export default function SportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
