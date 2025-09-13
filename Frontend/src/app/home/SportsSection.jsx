"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import useSportsStore from "@/stores/sportsStore";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
// No default icon import needed

const SportsSection = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { sports, isLoading, error, fetchSports } = useSportsStore();
  const scrollContainerRef = useRef(null);

  // Fetch sports data on component mount
  useEffect(() => {
    fetchSports();
  }, [fetchSports]);

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

  // Simple helper function to get sport icon from database
  const getSportIcon = (sport) => {
    // If sport has an uploaded icon, use it
    return sport.icon?.url || null;
  };

  // Helper function to get sport name based on language
  const getSportName = (sport) => {
    return language === "ar" ? sport.name?.ar : sport.name?.en;
  };

  // Show loading state
  if (isLoading) {
    return (
      <section className="bg-gradient-to-br from-gray-50 to-white">
        <div className="w-[90%] mx-auto px-1 sm:px-1 lg:px-1">
          <div className="mb-3">
            <div className="bg-white rounded-xl p-1 md:p-1 shadow-sm border border-gray-100 relative">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00184d]"></div>
                <span className="ml-2 text-gray-600">
                  {t("common.loading") || "Loading..."}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="bg-gradient-to-br from-gray-50 to-white">
        <div className="w-[90%] mx-auto px-1 sm:px-1 lg:px-1">
          <div className="mb-3">
            <div className="bg-white rounded-xl p-1 md:p-1 shadow-sm border border-gray-100">
              <div className="flex items-center justify-center py-8">
                <div className="text-red-500 text-center">
                  <p>{t("common.error") || "Error loading sports"}</p>
                  <p className="text-sm text-gray-500 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Don't render if no sports available
  if (!sports || sports.length === 0) {
    return (
      <section className="bg-gradient-to-br from-gray-50 to-white">
        <div className="w-[90%] mx-auto px-1 sm:px-1 lg:px-1">
          <div className="mb-3">
            <div className="bg-white rounded-xl p-1 md:p-1 shadow-sm border border-gray-100">
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-500">
                  {t("common.noSportsAvailable") || "No sports available"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

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
                const sportIcon = getSportIcon(sport);
                const sportName = getSportName(sport);
                const Icon = typeof sportIcon === "function" ? sportIcon : null;

                return (
                  <Link
                    key={sport._id}
                    href={`/sports/${sport.slug || sportName}`}
                    className="group flex-shrink-0"
                  >
                    <div className="flex flex-col items-center justify-center min-w-[70px] md:min-w-[80px] lg:min-w-[90px] p-2 md:p-3 rounded-lg transition-all duration-300 ease-in-out hover:bg-gray-50">
                      {/* Icon Container */}
                      <div className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mb-1 md:mb-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        {/* Only show image if icon URL exists, no fallback */}
                        {sportIcon && (
                          <img
                            src={sportIcon}
                            alt={sportName}
                            className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-gray-600 group-hover:text-[#00184d] transition-colors duration-300"
                          />
                        )}
                      </div>

                      {/* Sport Name */}
                      <h3 className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors duration-300 text-center leading-tight">
                        {sportName || t(`sports.${sport.slug}`) || "Sport"}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SportsSection;
