"use client";

import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import {
  FaBiking,
  FaDumbbell,
  FaRunning,
  FaSwimmer,
  FaTableTennis,
} from "react-icons/fa";
import {
  GiArcheryTarget,
  GiBoxingGlove,
  GiGoalKeeper,
  GiKimono,
  GiSwordman,
} from "react-icons/gi";
import { IoGameControllerOutline } from "react-icons/io5";
import { MdSportsGymnastics, MdSportsTennis } from "react-icons/md";

import { useLanguage } from "@/contexts/LanguageContext";
import { useDirection } from "@/hooks/use-direction";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface SportCardProps {
  searchTerm: string;
}

function SportCard({ searchTerm }: SportCardProps) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { classes } = useDirection();

  const sports = [
    {
      id: "handball",
      name: t("sports.handball"),
      icon: "./assets/handball.svg",
    },
    {
      id: "basketball",
      name: t("sports.basketball"),
      icon: "./assets/basketball.svg",
    },
    {
      id: "volleyball",
      name: t("sports.volleyball"),
      icon: "./assets/volleyball.svg",
    },
    {
      id: "football",
      name: t("sports.football"),
      icon: "./assets/football-ball.svg",
    },
    {
      id: "futsal",
      name: t("sports.futsal"),
      icon: GiGoalKeeper,
    },
    {
      id: "badminton",
      name: t("sports.badminton"),
      icon: "./assets/badminton.svg",
    },
    {
      id: "athletics",
      name: t("sports.athletics"),
      icon: FaRunning,
    },
    {
      id: "tennis",
      name: t("sports.tennis"),
      icon: MdSportsTennis,
    },
    {
      id: "tabletennis",
      name: t("sports.tabletennis"),
      icon: FaTableTennis,
    },
    {
      id: "karate",
      name: t("sports.karate"),
      icon: GiKimono,
    },
    {
      id: "taekwondo",
      name: t("sports.taekwondo"),
      icon: "./assets/taekwondo.svg",
    },
    {
      id: "archery",
      name: t("sports.archery"),
      icon: GiArcheryTarget,
    },
    {
      id: "esports",
      name: t("sports.esports"),
      icon: IoGameControllerOutline,
    },
    {
      id: "judo",
      name: t("sports.judo"),
      icon: "./assets/judo.svg",
    },
    {
      id: "fencing",
      name: t("sports.fencing"),
      icon: GiSwordman,
    },
    {
      id: "cycling",
      name: t("sports.cycling"),
      icon: FaBiking,
    },
    {
      id: "squash",
      name: t("sports.squash"),
      icon: "./assets/squash.svg",
    },
    {
      id: "weightlifting",
      name: t("sports.weightlifting"),
      icon: FaDumbbell,
    },

    {
      id: "boxing",
      name: t("sports.boxing"),
      icon: GiBoxingGlove,
    },
    {
      id: "gymnastics",
      name: t("sports.gymnastics"),
      icon: MdSportsGymnastics,
    },
    {
      id: "billiards",
      name: t("sports.billiards"),
      icon: "./assets/billiards.svg",
    },
    {
      id: "wrestling",
      name: t("sports.wrestling"),
      icon: "./assets/wrestling.svg",
    },
    {
      id: "swimming",
      name: t("sports.swimming"),
      icon: FaSwimmer,
    },
  ];

  // إزالة التكرار بناءً على id باستخدام reduce
  const uniqueSports = sports.reduce<typeof sports>((unique, sport) => {
    return unique.find((item) => item.id === sport.id)
      ? unique
      : [...unique, sport];
  }, []);

  // فلترة الرياضات بناءً على مصطلح البحث
  const filteredSports = uniqueSports.filter((sport) =>
    sport.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Sports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {filteredSports.map((sport) => {
          const Icon = sport.icon;
          return (
            <Link key={sport.id} href={`/sports/${sport.id}`}>
              <div className="h-full relative overflow-hidden group transition-all duration-300 ease-in-out border border-gray-200 rounded-2xl bg-[hsl(var(--card))] shadow-sm hover:shadow-lg hover:border-[hsl(var(--primary))] transform hover:-translate-y-1">
                <div className="p-6">
                  {/* Icon Container with improved styling */}
                  <div className="w-16 h-16 mx-auto mb-4 bg-[hsl(var(--primary))] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                    {typeof sport.icon === "string" ? (
                      // For SVG file paths
                      <img
                        src={sport.icon}
                        alt={sport.name}
                        className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300"
                        style={{ filter: "brightness(0) invert(1)" }} // Makes SVG white
                      />
                    ) : (
                      // For React Icons and custom SVG components
                      <Icon className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
                    )}
                  </div>

                  {/* Sport Name with better typography */}
                  <h3 className="text-lg font-bold text-[hsl(var(--card-foreground))] mb-4 group-hover:text-[hsl(var(--primary))] transition-colors duration-300 text-center leading-tight">
                    {sport.name}
                  </h3>

                  {/* Action Button with enhanced styling */}
                  <button
                    type="button"
                    className="w-full flex items-center justify-center border border-[hsl(var(--primary))] text-[hsl(var(--primary))] rounded-lg px-4 py-3 bg-transparent hover:bg-[hsl(var(--primary)/0.1)] group-hover:shadow-md transition-all duration-300 ease-in-out font-medium"
                  >
                    {isRTL ? (
                      <ArrowLeft className="w-4 h-4 ml-2 group-hover:-translate-x-1 transition-transform duration-300" />
                    ) : (
                      <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    )}
                    {t("sports.explorePlayers")}
                  </button>
                </div>

                {/* Subtle background pattern for visual interest */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[hsl(var(--primary)/0.02)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* No Results with improved styling */}
      {filteredSports.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-[hsl(var(--muted))] rounded-full flex items-center justify-center">
            <Search className="w-10 h-10 text-[hsl(var(--muted-foreground))]" />
          </div>
          <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-3">
            {t("errors.noResults")}
          </h3>
          <p className="text-[hsl(var(--muted-foreground))] text-base leading-relaxed">
            {t("errors.tryDifferentKeywords")}
          </p>
        </div>
      )}
    </>
  );
}

export default SportCard;
