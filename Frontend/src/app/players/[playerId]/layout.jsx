import React from "react";

async function getPlayerData(playerId) {
  try {
    const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/players/${playerId}`;
    const response = await fetch(API_URL, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Failed to fetch player data:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const player = await getPlayerData(params.playerId);

  if (!player) {
    return {
      title: "Player Not Found - Muta7Market",
      description:
        "The requested player profile could not be found on Muta7Market sports platform.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const isCoach = player.jop === "coach";
  const playerType = isCoach ? "Coach" : "Player";
  const playerTypeAr = isCoach ? "مدرب" : "لاعب";

  // Helper function to extract string value from multilingual objects or strings
  const getStringValue = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object" && (value.ar || value.en || value.slug)) {
      return value.slug || value.en || value.ar;
    }
    return String(value);
  };

  // Create sport text
  const sport = getStringValue(player.game) || "Sports";
  const sportAr = getSportInArabic(sport);

  // Create nationality text
  const nationality = player.nationality || "International";
  const nationalityAr = getNationalityInArabic(nationality);

  // Age and experience
  const age = player.age || "N/A";
  const experience = player.experience || 0;

  // Status
  const status =
    player.status === "available"
      ? "متاح للانتقال"
      : player.status === "contracted"
      ? "متعاقد"
      : "محول";
  const statusEn =
    player.status === "available"
      ? "Available"
      : player.status === "contracted"
      ? "Contracted"
      : "Transferred";

  // Category
  const category =
    player.category === "Elite"
      ? "نخبة"
      : player.category === "Professional"
      ? "محترف"
      : player.category === "Amateur"
      ? "هاوي"
      : "رياضي";
  const categoryEn = player.category || "Athlete";

  const title = `${player.name} - ${playerTypeAr} ${sportAr} | ${playerType} ${sport} Profile - Muta7Market`;

  const description = isCoach
    ? `تعرف على المدرب ${player.name} في ${sportAr}. مدرب ${category} من ${nationalityAr} بخبرة ${experience} سنوات. تصفح ملف المدرب الكامل وتواصل مباشرة. Meet Coach ${player.name} in ${sport}. ${categoryEn} coach from ${nationality} with ${experience} years experience. View full profile and connect directly.`
    : `تعرف على اللاعب ${player.name} في ${sportAr}. لاعب ${category} ${status} من ${nationalityAr}، العمر ${age} سنة بخبرة ${experience} سنوات. تصفح ملف اللاعب الكامل وشاهد الفيديوهات والإحصائيات. Meet Player ${player.name} in ${sport}. ${categoryEn} ${statusEn} athlete from ${nationality}, age ${age} with ${experience} years experience. View full profile with videos and stats.`;

  // Create image URL - use player's profile image if available
  const imageUrl = player.media?.profileImage?.url || "/trophy.png";
  const fullImageUrl = imageUrl.startsWith("http")
    ? imageUrl
    : `https://muta7markt.com${imageUrl}`;

  return {
    title,
    description,
    keywords: [
      // Arabic keywords
      player.name,
      playerTypeAr,
      sportAr,
      nationalityAr,
      category,
      status,
      "متاح ماركت",
      "منصة رياضية",
      "ملف رياضي",

      // English keywords
      player.name,
      playerType.toLowerCase(),
      sport.toLowerCase(),
      nationality.toLowerCase(),
      categoryEn.toLowerCase(),
      statusEn.toLowerCase(),
      "Muta7Market",
      "sports profile",
      "athlete profile",
      "sports marketplace",
      `${sport} ${playerType.toLowerCase()}`,
      `${nationality} ${playerType.toLowerCase()}`,
    ],
    openGraph: {
      title: `${player.name} - ${playerType} Profile | Muta7Market`,
      description: isCoach
        ? `Professional ${sport} coach from ${nationality} with ${experience} years experience. View full coaching profile, credentials, and contact information.`
        : `${categoryEn} ${sport} player from ${nationality}, age ${age}. ${statusEn} for transfer. View full player profile with videos, stats, and contact details.`,
      url: `https://muta7markt.com/players/${params.playerId}`,
      type: "profile",
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: `${player.name} - ${playerType} Profile Photo`,
        },
        {
          url: "/trophy.png",
          width: 400,
          height: 400,
          alt: "Muta7Market Sports Platform",
        },
      ],
      locale: "ar_SA",
      alternateLocale: "en_US",
      siteName: "Muta7Market",
    },
    twitter: {
      card: "summary_large_image",
      title: `${player.name} - ${sport} ${playerType} | Muta7Market`,
      description: isCoach
        ? `Professional ${sport} coach with ${experience} years experience from ${nationality}. View coaching profile and connect directly.`
        : `${categoryEn} ${sport} player, age ${age} from ${nationality}. ${statusEn} for opportunities. View profile with videos and stats.`,
      images: [fullImageUrl],
      creator: "@muta7market",
    },
    alternates: {
      canonical: `/players/${params.playerId}`,
    },
    other: {
      "profile:first_name": player.name.split(" ")[0] || "",
      "profile:last_name": player.name.split(" ").slice(1).join(" ") || "",
      "profile:username": player.name.replace(/\s+/g, "").toLowerCase(),
      "article:author": "Muta7Market",
      "article:section": isCoach ? "Coaches" : "Players",
      "article:tag": [sport, nationality, categoryEn].join(","),
    },
  };
}

// Helper functions for Arabic translations
function getSportInArabic(sport) {
  const sportTranslations = {
    football: "كرة القدم",
    basketball: "كرة السلة",
    volleyball: "كرة الطائرة",
    tennis: "التنس",
    badminton: "الريشة الطائرة",
    handball: "كرة اليد",
    squash: "الاسكواش",
    wrestling: "المصارعة",
    judo: "الجودو",
    taekwondo: "التايكوندو",
    billiards: "البلياردو",
  };
  return sportTranslations[sport.toLowerCase()] || sport;
}

function getNationalityInArabic(nationality) {
  const nationalityTranslations = {
    "Saudi Arabia": "السعودية",
    "Saudi Arabian": "سعودي",
    Egypt: "مصر",
    Egyptian: "مصري",
    UAE: "الإمارات",
    Emirati: "إماراتي",
    Jordan: "الأردن",
    Jordanian: "أردني",
    Lebanon: "لبنان",
    Lebanese: "لبناني",
    Syria: "سوريا",
    Syrian: "سوري",
    Iraq: "العراق",
    Iraqi: "عراقي",
    Kuwait: "الكويت",
    Kuwaiti: "كويتي",
    Qatar: "قطر",
    Qatari: "قطري",
    Bahrain: "البحرين",
    Bahraini: "بحريني",
    Oman: "عمان",
    Omani: "عماني",
  };
  return nationalityTranslations[nationality] || nationality;
}

export default function PlayerLayout({ children }) {
  return <React.Fragment>{children}</React.Fragment>;
}
