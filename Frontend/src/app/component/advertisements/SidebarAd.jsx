"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const SidebarAd = ({ ad, loading }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 1. Loading State (Skeleton)
  if (loading) {
    return (
      <div className="w-full max-w-xs fixed left-4 bottom-4 md:left-auto md:bottom-auto md:right-4 md:top-24 z-30">
        <div className="relative w-full h-[400px] md:h-[500px] bg-gray-100 dark:bg-gray-800/30 rounded-lg overflow-hidden shadow-sm">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-200/60 dark:via-gray-700/30 to-transparent"></div>

          {/* Skeleton content */}
          <div className="absolute bottom-0 left-0 right-0 p-5 space-y-3">
            <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700/50 rounded-md"></div>
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700/50 rounded-md"></div>
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700/50 rounded-md"></div>
            <div className="h-8 w-1/3 mt-3 bg-gray-200 dark:bg-gray-700/50 rounded-full"></div>
          </div>

          {/* Skeleton badge */}
          <div className="absolute top-3 right-3 h-5 w-12 bg-gray-200 dark:bg-gray-700/50 rounded-full"></div>

          {/* Skeleton close button */}
          <div className="absolute -top-2 -right-2 z-50 bg-gray-200 dark:bg-gray-700/50 w-6 h-6 rounded-full"></div>
        </div>
      </div>
    );
  }

  const adMedia =
    isMobile && ad?.media?.mobile?.url ? ad.media.mobile : ad?.media?.desktop;

  // State for ad visibility
  const [isVisible, setIsVisible] = useState(true);

  // 2. Ad Display State
  if (ad && adMedia?.url && isVisible) {
    const adUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/advertisements/click/${ad._id}`;

    return (
      <div className="w-full max-w-xs fixed left-4 bottom-4 md:left-auto md:bottom-auto md:right-4 md:top-24 z-30">
        <div className="group relative">
          {/* Close button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="absolute -top-2 -right-2 z-50 bg-gray-900/80 hover:bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all duration-200"
            aria-label="Close advertisement"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>

          <Link
            href={adUrl}
            target={ad.link?.target || "_blank"}
            rel="noopener noreferrer sponsored"
            className="block"
          >
            <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden border border-gray-200/50 shadow-md hover:shadow-xl transition-all duration-300 group-hover:border-primary/30">
              <Image
                src={adMedia.url}
                alt={
                  language === "ar"
                    ? ad.title.ar
                    : ad.title.en || "Advertisement"
                }
                fill
                style={{ objectFit: "cover" }}
                className="transition-transform duration-700 ease-in-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 300px"
                priority
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

              {/* Ad Badge */}
              <div className="absolute top-3 right-3 bg-white/90 text-gray-900 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm shadow-sm">
                {t("ads.adLabel", "Ad")}
              </div>

              {/* Ad Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white transform transition-transform duration-300 group-hover:translate-y-[-5px]">
                <h3 className="font-bold text-lg mb-2 line-clamp-2 drop-shadow-md">
                  {language === "ar" ? ad.title.ar : ad.title.en}
                </h3>
                {ad.description && (
                  <p className="text-sm opacity-90 line-clamp-3 drop-shadow-md">
                    {language === "ar" ? ad.description.ar : ad.description.en}
                  </p>
                )}
                <div className="mt-3 inline-flex items-center text-xs font-medium text-white/90 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  {t("ads.learnMore", "معرفة المزيد")} →
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // 3. Placeholder State (No Ad, Not Loading)
  return null; // Don't show placeholder when there's no ad
};

export default SidebarAd;
