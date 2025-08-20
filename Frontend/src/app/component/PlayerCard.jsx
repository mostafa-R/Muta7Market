"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar, Eye, MapPin, Star, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const getStatusColor = (status) => {
  const colors = {
    "Free Agent": "bg-green-500",
    Contracted: "bg-blue-500",
    Transferred: "bg-ref-500",
  };
  return colors[status] || "bg-gray-500";
};

const getCategoryColor = (jop) => {
  const colors = {
    player: "bg-blue-500",
    coach: "bg-blue-500",
  };
  return colors[jop] || "bg-gray-500";
};

const getStatusText = (status, t) => {
  const texts = {
    "Free Agent": t("player.status.freeAgent"),
    Contracted: t("player.status.contracted"),
    Transferred: t("player.status.transferred"),
  };
  return texts[status] || status;
};

const getCategoryText = (jop, t) => {
  const texts = {
    player: t("common.player"),
    coach: t("common.coach"),
  };
  return texts[jop] || jop;
};

const PlayerCard = ({ player }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const statusText = useMemo(
    () => getStatusText(player.status, t),
    [player.status, t]
  );
  const categoryText = useMemo(
    () => getCategoryText(player.jop, t),
    [player.jop, t]
  );

  return (
    <div className="border border-gray-300 rounded-2xl overflow-hidden group bg-[hsl(var(--card))] shadow-card transition-all duration-300 flex flex-col w-full max-w-[250px] min-w-[250px] min-h-[300px] mb-6">
      {/* Header with Avatar and Status */}
      <div className="relative p-4 sm:p-6 pb-4">
        <div
          className={`absolute top-4 ${
            isRTL ? "left-4" : "right-4"
          } flex flex-col gap-1.5`}
        >
          <span
            className={`text-white text-xs px-2 py-0.5 rounded-md ${getStatusColor(
              player.status
            )} transition-transform group-hover:scale-105`}
            aria-label={`Status: ${statusText}`}
          >
            {statusText}
          </span>
          {/* <span
            className={`text-white text-xs px-2 py-0.5 rounded-md ${getCategoryColor(
              player.jop
            )} transition-transform group-hover:scale-105`}
            aria-label={`Category: ${categoryText}`}
          >
            {categoryText}
          </span> */}
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-white shadow-md overflow-hidden bg-[hsl(var(--primary)/0.15)] mb-3 transition-transform group-hover:scale-105">
            {player.profileImage ? (
              <Image
                src={player.profileImage}
                alt={player.name}
                width={96}
                height={96}
                className="w-full h-full object-cover rounded-full"
                loading="lazy"
                unoptimized
              />
            ) : (
              <span className="text-[hsl(var(--primary))] text-lg sm:text-xl font-bold flex items-center justify-center h-full">
                {player.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            )}
          </div>

          <div className="space-y-1 text-center">
            <h3
              className="text-base sm:text-lg font-bold text-[hsl(var(--card-foreground))] truncate group-hover:text-[hsl(var(--primary))] transition-colors"
              title={player.name}
            >
              {player.name}
            </h3>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[hsl(var(--muted-foreground))] flex-shrink-0" />
                <span
                  className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] truncate max-w-[150px] sm:max-w-[200px]"
                  title={player.nationality}
                >
                  {player.nationality}
                </span>
              </div>
              <div
                className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] truncate max-w-[150px] sm:max-w-[200px]"
                title={categoryText}
              >
                {categoryText}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Player Info */}
      <div className="px-4 sm:px-6 space-y-3 mb-4 flex-1">
        {/* Basic Info */}
        <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[hsl(var(--muted-foreground))] flex-shrink-0" />
            <span className="text-[hsl(var(--muted-foreground))] flex-shrink-0">
              {t("player.age")}:
            </span>
            <span className="font-medium">
              {player.age} {t("player.years")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[hsl(var(--muted-foreground))] flex-shrink-0" />
            <span className="text-[hsl(var(--muted-foreground))] flex-shrink-0">
              {t("player.sport")}:
            </span>
            <span className="font-medium truncate" title={player.sport}>
              {player.sport}
            </span>
          </div>

          {player.position && (
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[hsl(var(--muted-foreground))] flex-shrink-0" />
              <span className="text-[hsl(var(--muted-foreground))] flex-shrink-0">
                {t("player.position")}:
              </span>
              <span className="font-medium truncate" title={player.position}>
                {player.position}
              </span>
            </div>
          )}
        </div>

        {/* Salary Info */}
        {/* {(player.monthlySalary || player.annualContractValue != null) && (
          <div className="bg-[hsl(var(--muted))] rounded-lg p-2 space-y-1.5">
            {player.monthlySalary && (
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2 min-w-0 flex-shrink">
                  <DollarSign className="w-4 h-4 text-[hsl(var(--primary))] flex-shrink-0" />
                  <span className="text-[hsl(var(--muted-foreground))] flex-shrink-0">
                    {t("player.monthlySalary")}:
                  </span>
                </div>
                <span className="font-semibold text-[hsl(var(--primary))] ml-2 flex-shrink-0">
                  {player.monthlySalary.toLocaleString()} SAR
                </span>
              </div>
            )}

            {player.annualContractValue != null && (
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2 min-w-0 flex-shrink">
                  <DollarSign className="w-4 h-4 text-[hsl(var(--primary))] flex-shrink-0" />
                  <span className="text-[hsl(var(--muted-foreground))] flex-shrink-0">
                    {t("player.annualContract")}:
                  </span>
                </div>
                <span className="font-semibold text-[hsl(var(--primary))] ml-2 flex-shrink-0">
                  {player.annualContractValue === 0
                    ? t("player.notSpecified")
                    : `${player.annualContractValue.toLocaleString()} SAR`}
                </span>
              </div>
            )}
          </div>
        )} */}

        {/* Contract Info */}
        {/* {player.transferDeadline && (
          <div className="flex items-center gap-2 text-xs sm:text-sm text-orange-600">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="flex-shrink-0">
              {t("player.transferDeadline")}:
            </span>
            <span className="font-medium truncate flex-shrink-0">
              {new Date(player.transferDeadline).toLocaleDateString(
                language === "ar" ? "ar-EG" : "en-US",
                {
                  month: "short",
                  year: "numeric",
                }
              )}
            </span>
          </div>
        )} */}
      </div>

      {/* Action Button */}
      <div className="mt-auto px-4 sm:px-6 pb-4">
        <Link href={`/players/${player.id}`} passHref>
          <button
            type="button"
            className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border border-[hsl(var(--primary))] rounded-lg px-4 py-2 hover:bg-[hsl(var(--primary)/0.9)] hover:text-white transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2"
            aria-label={t("player.viewProfile")}
          >
            <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-sm sm:text-base">
              {t("player.viewProfile")}
            </span>
          </button>
        </Link>
      </div>
    </div>
  );
};

export default PlayerCard;
