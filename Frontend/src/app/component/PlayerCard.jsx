"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar, Eye, MapPin, Pin, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  translateNationality,
  translatePosition,
  translateSport,
} from "../../utils/translationFallback";
import PlayerRoleBadge from "./PlayerRoleBadge";

const getStatusColor = (status) => {
  const colors = {
    "Free Agent": "bg-[#016666]",
    Contracted: "bg-blue-600",
    Transferred: "bg-purple-500",
  };
  return colors[status] || "bg-slate-500";
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

const getSportText = (sport, t) => {
  return translateSport(t, sport);
};

const getNationalityText = (nationality, t) => {
  return translateNationality(t, nationality);
};

const getPositionText = (position, sport, t) => {
  if (!position) return null;

  if (position.includes(".")) {
    const translated = t(position);

    if (translated === position) {
      const positionKey = position.split(".").pop();
      return formatPositionText(positionKey);
    }

    return translated;
  }

  return translatePosition(t, position, sport);
};

const formatPositionText = (text) => {
  return text
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const getGenderBorderColor = (gender) => {
  return gender?.toLowerCase() === "female"
    ? "border-pink-400"
    : "border-[#00183d]";
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
  const sportText = useMemo(
    () => getSportText(player.sport, t),
    [player.sport, t]
  );
  const nationalityText = useMemo(
    () => getNationalityText(player.nationality, t),
    [player.nationality, t]
  );
  const positionText = useMemo(
    () => getPositionText(player.position, player.sport, t),
    [player.position, player.sport, t]
  );

  const borderColorClass = useMemo(
    () => getGenderBorderColor(player.gender),
    [player.gender]
  );

  return (
    <div
      className={`border-2 ${borderColorClass} rounded-xl overflow-hidden group bg-[hsl(var(--card))] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col w-full max-w-[260px] min-w-[260px] min-h-[260px] mb-6 hover:border-[hsl(var(--primary)/0.2)]`}
      role="article"
      aria-label={`${t("player.playerCard")} - ${player.name}`}
    >
      {/* Header with Avatar and Status */}
      <div className="relative p-4 pb-3">
        {/* Promoted Pin */}
        {player.isPromoted && player.isPromoted.status === true && (
          <div
            className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} z-10`}
            title={t("player.promoted")}
            aria-label={t("player.promoted")}
          >
            <div className="flex items-center justify-center w-6 h-6 bg-[#cd9834] rounded-full shadow-sm transition-transform group-hover:scale-110">
              <Pin className="w-3 h-3 text-white" />
            </div>
          </div>
        )}

        <div className="flex flex-col items-center">
          {/* Avatar with Status Badge */}
          <div className="relative mb-3">
            <div className="w-26 h-26 rounded-full border-2 border-white shadow-sm overflow-hidden bg-gradient-to-br from-[hsl(var(--primary)/0.1)] to-[hsl(var(--primary)/0.15)] transition-transform group-hover:scale-105">
              {player.profileImage ? (
                <Image
                  src={player.profileImage}
                  alt={`${t("player.playerPhoto")} - ${player.name}`}
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  unoptimized
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  aria-label={`${t("player.playerInitials")} - ${player.name}`}
                >
                  <span className="text-[hsl(var(--primary))] text-lg font-bold">
                    {player.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)}
                  </span>
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div
              className={`absolute -bottom-1 ${isRTL ? "left-0" : "right-0"}`}
            >
              <span
                className={`text-white text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                  player.status
                )} shadow-sm transition-transform group-hover:scale-105 font-medium`}
                aria-label={`Status: ${statusText}`}
              >
                {statusText}
              </span>
            </div>
          </div>

          {/* Player Info */}
          <div className="text-center space-y-1">
            <h3
              className="text-base font-bold text-[hsl(var(--card-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors leading-tight"
              title={player.name}
            >
              {player.name}
            </h3>

            {/* Location */}
            <div className="flex items-center justify-center gap-1 text-[hsl(var(--muted-foreground))]">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span
                className="text-xs font-medium truncate max-w-[140px]"
                title={nationalityText}
              >
                {nationalityText}
              </span>
            </div>

            {/* Job Category Badge */}
            <div className="flex justify-center mt-2">
              <span className="inline-flex items-center px-2.5 py-1 bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] rounded-full text-xs font-medium border border-[hsl(var(--primary)/0.2)]">
                {categoryText}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Player Details */}
      <div className="px-4 flex-1">
        <div className="grid grid-cols-5 gap-2 mb-2">
          {/* Age */}
          <div className="col-span-2 flex items-center justify-center p-2 bg-[hsl(var(--muted)/0.3)] rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-[hsl(var(--primary))] mr-1" />
            <div className="text-center">
              <div className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
                {t("player.age")}
              </div>
              <div className="text-sm font-bold text-[hsl(var(--card-foreground))]">
                {player.age}
              </div>
            </div>
          </div>

          {/* Sport */}
          <div className="col-span-3 flex items-center justify-center p-2 bg-[hsl(var(--muted)/0.3)] rounded-lg">
            <Trophy className="w-3.5 h-3.5 text-[hsl(var(--primary))] mr-1" />
            <div className="text-center min-w-0 flex-1">
              <div className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
                {t("player.sport")}
              </div>
              <div
                className="text-sm font-bold text-[hsl(var(--card-foreground))] truncate"
                title={sportText}
              >
                {sportText}
              </div>
            </div>
          </div>
        </div>

        <PlayerRoleBadge player={player} t={t} positionText={positionText} />
      </div>

      {/* Action Button */}
      <div className="mt-auto px-4 pb-4">
        <Link href={`/players/${player.id}`} passHref>
          <button
            type="button"
            className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg px-4 py-2.5 hover:bg-[hsl(var(--primary)/0.9)] transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-1 font-medium shadow-sm hover:shadow group/btn"
            aria-label={`${t("player.clickToViewDetails")} ${player.name}`}
            title={`${t("player.clickToViewDetails")} ${player.name}`}
          >
            <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            <span className="text-sm">{t("player.viewProfile")}</span>
          </button>
        </Link>
      </div>
    </div>
  );
};

export default PlayerCard;
