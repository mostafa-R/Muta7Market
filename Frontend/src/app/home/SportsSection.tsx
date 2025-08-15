"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  FaBasketballBall,
  FaBiking,
  FaChessKnight,
  FaDumbbell,
  FaFistRaised,
  FaFootballBall,
  FaRunning,
  FaSwimmer,
  FaTableTennis,
  FaVolleyballBall,
} from "react-icons/fa";
import {
  GiArcheryTarget,
  GiBoxingGlove,
  GiGoalKeeper,
  GiKimono,
  GiMuscleUp,
  GiSwordman,
  GiTennisRacket,
} from "react-icons/gi";
import { IoGameControllerOutline } from "react-icons/io5";
import { MdSportsGymnastics, MdSportsTennis } from "react-icons/md";

const sports = [
  {
    id: "handball",
    name: "كرة اليد",
    icon: FaFootballBall,
  },
  {
    id: "basketball",
    name: "كرة السلة",
    icon: FaBasketballBall,
  },
  {
    id: "volleyball",
    name: "الكرة الطائرة",
    icon: FaVolleyballBall,
  },
  {
    id: "badminton",
    name: "الريشة الطائرة",
    icon: GiTennisRacket,
  },
  {
    id: "athletics",
    name: "ألعاب القوى",
    icon: FaRunning,
  },
  {
    id: "tennis",
    name: "التنس",
    icon: MdSportsTennis,
  },
  {
    id: "tabletennis",
    name: "كرة الطاولة",
    icon: FaTableTennis,
  },
  {
    id: "karate",
    name: "الكاراتيه",
    icon: GiKimono,
  },
  {
    id: "taekwondo",
    name: "التايكوندو",
    icon: FaFistRaised,
  },
  {
    id: "archery",
    name: "الرماية",
    icon: GiArcheryTarget,
  },
  {
    id: "esports",
    name: "الألعاب الإلكترونية",
    icon: IoGameControllerOutline,
  },
  {
    id: "judo",
    name: "الجودو",
    icon: GiKimono,
  },
  {
    id: "fencing",
    name: "المبارزة",
    icon: GiSwordman,
  },
  {
    id: "cycling",
    name: "الدراجات",
    icon: FaBiking,
  },
  {
    id: "squash",
    name: "الإسكواش",
    icon: GiTennisRacket,
  },
  {
    id: "weightlifting",
    name: "رفع الأثقال",
    icon: FaDumbbell,
  },
  {
    id: "futsal",
    name: "كرة قدم الصالات",
    icon: GiGoalKeeper,
  },
  {
    id: "boxing",
    name: "الملاكمة",
    icon: GiBoxingGlove,
  },
  {
    id: "gymnastics",
    name: "الجمباز",
    icon: MdSportsGymnastics,
  },
  {
    id: "billiards",
    name: "البلياردو",
    icon: FaChessKnight,
  },
  {
    id: "wrestling",
    name: "المصارعة",
    icon: GiMuscleUp,
  },
  {
    id: "swimming",
    name: "السباحة",
    icon: FaSwimmer,
  },
];

const SportsSection = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <section className="py-8 md:py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            {t("home.exploreAllSports")}
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t("sports.description")}
          </p>
        </div>

        {/* Sports Grid */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 lg:gap-5 mb-12">
          {sports.map((sport) => {
            const Icon = sport.icon;
            return (
              <Link
                key={sport.id}
                href={`/sports/${sport.id}`}
                className="group"
              >
                <div className="flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100 hover:border-[#00184d] transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
                  {/* Icon Container */}
                  <div className="w-16 h-16 mx-auto mb-4 bg-[hsl(var(--primary))] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <Icon className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
                  </div>

                  {/* Sport Name */}
                  <h3 className="text-xs sm:text-sm md:text-base font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300 text-center leading-tight px-1">
                    {t(`sports.${sport.id}`)}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link href="/sports">
            <button
              type="button"
              className="inline-flex items-center justify-center bg-gradient-to-r from-[#00184d] to-[#00184d] hover:from-[#00184d] hover:to-[#00184d] text-white font-semibold rounded-xl text-base md:text-lg px-8 py-4 md:px-10 md:py-5 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#00184d]"
            >
              <Trophy className="w-5 h-5 md:w-6 md:h-6 ml-3" />
              {t("home.viewAll")} {t("sports.allSports")}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SportsSection;
