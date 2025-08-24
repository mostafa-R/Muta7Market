"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  FaBasketballBall,
  FaBiking,
  FaChessKnight,
  FaDumbbell,
  FaFistRaised,
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
    icon: "./assets/handball.svg",
  },
  {
    id: "basketball",
    name: "كرة السلة",
    icon: "./assets/basketball.svg",
  },
  {
    id: "volleyball",
    name: "الكرة الطائرة",
    icon: "./assets/volleyball.svg",
  },
  {
    id: "football",
    name: "كرة قدم",
    icon: "./assets/football-ball.svg",
  },
  {
    id: "futsal",
    name: "كرة قدم الصالات",
    icon: GiGoalKeeper,
  },
  {
    id: "esports",
    name: "الألعاب الإلكترونية",
    icon: IoGameControllerOutline,
  },
  {
    id: "badminton",
    name: "الريشة الطائرة",
    icon: "./assets/badminton.svg",
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
    icon: "./assets/taekwondo.svg",
  },
  {
    id: "archery",
    name: "الرماية",
    icon: GiArcheryTarget,
  },

  {
    id: "judo",
    name: "الجودو",
    icon: "./assets/judo.svg",
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
    icon: "./assets/squash.svg",
  },
  {
    id: "weightlifting",
    name: "رفع الأثقال",
    icon: FaDumbbell,
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
    icon: "./assets/billiards.svg",
  },
  {
    id: "wrestling",
    name: "المصارعة",
    icon: "./assets/wrestling.svg",
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <section className="bg-gradient-to-br from-gray-50 to-white">
      <div className="w-[90%] mx-auto px-1 sm:px-1 lg:px-1">
        {/* Horizontal Scrollable Sports Navigation */}
        <div className="mb-3">
          <div className="bg-white rounded-xl p-1 md:p-1 shadow-sm border border-gray-100 relative">
            {/* Left Arrow */}
            <button
              onClick={scrollLeft}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={scrollRight}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>

            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto scrollbar-hide gap-3 md:gap-4 w-auto flex-nowrap px-8"
            >
              {sports.map((sport) => {
                const Icon = sport.icon;
                return (
                  <Link
                    key={sport.id}
                    href={`/sports/${sport.id}`}
                    className="group flex-shrink-0"
                  >
                    <div className="flex flex-col items-center justify-center min-w-[70px] md:min-w-[80px] lg:min-w-[90px] p-2 md:p-3 rounded-lg transition-all duration-300 ease-in-out hover:bg-gray-50">
                      {/* Icon Container */}
                      <div className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mb-1 md:mb-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        {typeof sport.icon === "string" ? (
                          // For SVG file paths
                          <img
                            src={sport.icon}
                            alt={sport.name}
                            className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-gray-600 group-hover:text-[#00184d] transition-colors duration-300"
                          />
                        ) : (
                          // For React Icons and custom SVG components
                          <Icon className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-gray-600 group-hover:text-[#00184d] transition-colors duration-300" />
                        )}
                      </div>

                      {/* Sport Name */}
                      <h3 className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors duration-300 text-center leading-tight">
                        {t(`sports.${sport.id}`)}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        {/* <div className="text-center">
          <Link href="/sports">
            <button
              type="button"
              className="inline-flex items-center justify-center bg-gradient-to-r from-[#00184d] to-[#00184d] hover:from-[#00184d] hover:to-[#00184d] text-white font-semibold rounded-xl text-sm md:text-base px-6 py-3 md:px-8 md:py-4 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#00184d]"
            >
              <Trophy className="w-4 h-4 md:w-5 md:h-5 ml-2 md:ml-3" />
              {t("home.viewAll")} {t("sports.allSports")}
            </button>
          </Link>
        </div> */}
      </div>
    </section>
  );
};

export default SportsSection;
