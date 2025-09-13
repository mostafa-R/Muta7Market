"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useDirection } from "@/hooks/use-direction";
import useSportsStore from "@/stores/sportsStore";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

// Define Sport type
interface Sport {
  _id: string;
  name: {
    ar: string;
    en: string;
  };
  icon?: {
    url: string;
    publicId: string;
  };
  slug: string;
  positions: any[];
  roleTypes: any[];
}

interface SportCardProps {
  searchTerm: string;
}

function SportCard({ searchTerm }: SportCardProps) {
  const { t } = useTranslation();
  const { isRTL, language } = useLanguage();
  const { classes } = useDirection();
  const { sports, isLoading, error, fetchSports } = useSportsStore();

  // Fetch sports data on component mount
  useEffect(() => {
    fetchSports();
  }, [fetchSports]);

  // Helper function to get sport name based on language
  const getSportName = (sport: Sport) => {
    return language === "ar" ? sport.name?.ar : sport.name?.en;
  };

  // Helper function to get sport icon
  const getSportIcon = (sport: Sport) => {
    // If sport has an uploaded icon, use it
    return sport.icon?.url || null;
  };

  // Filter sports based on search term
  const filteredSports = sports.filter((sport: Sport) => {
    const sportName = getSportName(sport) || "";
    return sportName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--primary))]"></div>
        <span className="ml-3 text-[hsl(var(--foreground))]">
          {t("common.loading") || "Loading..."}
        </span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <Search className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-3">
          {t("common.error") || "Error loading sports"}
        </h3>
        <p className="text-[hsl(var(--muted-foreground))] text-base leading-relaxed">
          {error}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Sports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {filteredSports.map((sport: Sport) => {
          const sportName = getSportName(sport);
          const sportIcon = getSportIcon(sport);

          return (
            <Link key={sport._id} href={`/sports/${sport.slug || sportName} `}>
              <div className="h-full relative overflow-hidden group transition-all duration-300 ease-in-out border border-gray-200 rounded-2xl bg-[hsl(var(--card))] shadow-sm hover:shadow-lg hover:border-[hsl(var(--primary))] transform hover:-translate-y-1">
                <div className="p-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-[hsl(var(--primary))] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                    {sportIcon && (
                      <img
                        src={sportIcon}
                        alt={sportName}
                        className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300"
                        style={{ filter: "brightness(0) invert(1)" }} // Makes SVG white
                      />
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-[hsl(var(--card-foreground))] mb-4 group-hover:text-[hsl(var(--primary))] transition-colors duration-300 text-center leading-tight">
                    {sportName || t(`sports.${sport.slug}`) || "Sport"}
                  </h3>

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
