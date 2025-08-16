"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Calendar,
  Clock,
  DollarSign,
  Eye,
  MapPin,
  Star,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";

// دالة للحصول على لون الحالة
const getStatusColor = (status) => {
  switch (status) {
    case "Free Agent":
      return "bg-gray-500";
    case "Contracted":
      return "bg-blue-500";
    case "Transferred":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

// دالة للحصول على لون الفئة
const getCategoryColor = (jop) => {
  switch (jop) {
    case "player":
      return "bg-blue-500";
    case "coach":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
};

// دالة للحصول على نص الحالة
const getStatusText = (status, t) => {
  switch (status) {
    case "Free Agent":
      return t("player.status.freeAgent");
    case "Contracted":
      return t("player.status.contracted");
    case "Transferred":
      return t("player.status.transferred");
    default:
      return status;
  }
};

// دالة للحصول على نص الفئة
const getCategoryText = (jop, t) => {
  switch (jop) {
    case "player":
      return t("common.player");
    case "coach":
      return t("common.coach");
    default:
      return jop;
  }
};

// المكون الرئيسي
const PlayerCard = ({ player }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === "ar";

  return (
    <div className="border border-gray-300 overflow-hidden group rounded-2xl transition-smooth bg-[hsl(var(--card))] shadow-card h-[450px] w-[300px] flex flex-col min-h-0">
      <div className="flex-1 min-h-0">
        {/* Header with Avatar and Status */}
        <div className="relative p-6 pb-4">
          <div className={`absolute top-4 ${isRTL ? "left-4" : "right-4"}`}>
            <div className="flex flex-col gap-2">
              <span
                className={`text-white text-center text-xs px-2 py-1 rounded-lg ${getStatusColor(
                  player.status
                )}`}
              >
                {getStatusText(player.status, t)}
              </span>
              <span
                className={`text-white text-xs px-2 py-1 rounded-lg ${getCategoryColor(
                  player.jop
                )}`}
              >
                {getCategoryText(player.jop, t)}
              </span>
            </div>
          </div>

          <div className="mx-auto flex items-center justify-center flex-col">
            <div className="w-24 h-24 rounded-full border border-white shadow-card overflow-hidden flex items-center justify-center bg-[hsl(var(--primary)/0.15)] mb-2">
              {player.profileImage ? (
                <Image
                  src={player.profileImage}
                  alt={player.name}
                  width={64}
                  height={64}
                  className="w-22 h-22 object-cover rounded-full"
                  unoptimized
                />
              ) : (
                <span className="text-[hsl(var(--primary))] text-xl font-bold">
                  {player.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-[hsl(var(--card-foreground))] truncate group-hover:text-[hsl(var(--primary))] transition-colors">
                {player.name}
              </h3>
              <div className="flex justify-center items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                  {player.nationality}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Player Info */}
        <div className="px-6 pb-4 space-y-3 mt-3">
          <div className="grid grid-cols-2 text-sm gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[hsl(var(--muted-foreground))] flex-shrink-0" />
              <span className="text-[hsl(var(--muted-foreground))]">
                {t("player.age")}:
              </span>
              <span className="font-medium">
                {player.age} {t("player.years")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[hsl(var(--muted-foreground))] flex-shrink-0" />
              <span className="text-[hsl(var(--muted-foreground))]">
                {t("player.sport")}:
              </span>
              <span className="font-medium">{player.sport}</span>
            </div>
          </div>

          {player.position && (
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-[hsl(var(--muted-foreground))] flex-shrink-0" />
              <span className="text-[hsl(var(--muted-foreground))]">
                {t("player.position")}:
              </span>
              <span className="font-medium">{player.position}</span>
            </div>
          )}

          {(player.monthlySalary || player.annualContractValue != null) && (
            <div className="bg-[hsl(var(--muted))] rounded-lg p-3 space-y-2">
              {player.monthlySalary && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[hsl(var(--primary))] flex-shrink-0" />
                    <span className="text-[hsl(var(--muted-foreground))]">
                      {t("player.monthlySalary")}:
                    </span>
                  </div>
                  <span className="font-semibold text-[hsl(var(--primary))]">
                    ${player.monthlySalary.toLocaleString()}
                  </span>
                </div>
              )}

              {player.annualContractValue != null && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[hsl(var(--primary))] flex-shrink-0" />
                    <span className="text-[hsl(var(--muted-foreground))]">
                      {t("player.annualContract")}:
                    </span>
                  </div>
                  <span className="font-semibold text-[hsl(var(--primary))]">
                    $
                    {player.annualContractValue === 0
                      ? t("player.notSpecified")
                      : player.annualContractValue.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}

          {player.transferDeadline && (
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>{t("player.transferDeadline")}:</span>
              <span className="font-medium">
                {new Date(player.transferDeadline).toLocaleDateString(
                  language === "ar" ? "ar-EG" : "en-US",
                  {
                    month: "long",
                    year: "numeric",
                  }
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="px-6 pb-6">
        <Link href={`/players/${player.id}`}>
          <button
            type="button"
            className="w-full group bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] 
        border border-[hsl(var(--primary))] rounded-lg px-4 py-2 hover:bg-[hsl(var(--primary)/0.9)] hover:text-white transition flex items-center justify-center cursor-pointer gap-2"
          >
            <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
            {t("player.viewProfile")}
          </button>
        </Link>
      </div>
    </div>
  );
};

export default PlayerCard;
