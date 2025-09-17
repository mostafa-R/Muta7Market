"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const InlineAd = ({ ad, loading }) => {
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
      <div className="w-full my-6">
        <div className="relative w-full h-24 md:h-32 bg-gray-200 rounded-lg overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-300/50 to-transparent"></div>
        </div>
      </div>
    );
  }

  const adMedia =
    isMobile && ad?.media?.mobile?.url ? ad.media.mobile : ad?.media?.desktop;

  // 2. Ad Display State
  if (ad && adMedia?.url) {
    const adUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/advertisements/click/${ad._id}`;

    return (
      <div className="w-full my-6">
        <div className="group">
          <Link
            href={adUrl}
            target={ad.link?.target || "_blank"}
            rel="noopener noreferrer sponsored"
          >
            <div className="relative w-full h-24 md:h-32 rounded-lg overflow-hidden border border-gray-200/50 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-gray-300 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
              {/* Content Layout */}
              <div className="flex items-center h-full">
                {/* Image Section */}
                <div className="relative w-24 md:w-32 h-full flex-shrink-0">
                  <Image
                    src={adMedia.url}
                    alt={
                      language === "ar"
                        ? ad.title.ar
                        : ad.title.en || "Advertisement"
                    }
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-500 ease-in-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20"></div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm md:text-base mb-1 line-clamp-1 text-gray-900 dark:text-white">
                      {language === "ar" ? ad.title.ar : ad.title.en}
                    </h3>
                    {ad.description && (
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {language === "ar"
                          ? ad.description.ar
                          : ad.description.en}
                      </p>
                    )}
                  </div>

                  {/* Call to Action Button */}
                  <div className="ml-4 flex-shrink-0">
                    <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 group-hover:bg-primary/90 group-hover:scale-105">
                      {t("ads.viewOffer", "View Offer")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ad Badge */}
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                {t("ads.adLabel", "Ad")}
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // 3. Placeholder State (No Ad, Not Loading)
  return (
    <div className="w-full my-6">
      <div className="relative w-full h-24 md:h-32 bg-gradient-to-r from-[hsl(var(--primary)/0.08)] to-[hsl(var(--accent)/0.08)] rounded-lg border border-dashed border-[hsl(var(--primary)/0.20)] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>

        <div className="flex items-center gap-4 z-10">
          {/* Placeholder Icon */}
          <div className="w-16 h-16 bg-[hsl(var(--primary)/0.20)] rounded-lg flex items-center justify-center">
            <div className="w-8 h-8 bg-[hsl(var(--primary)/0.40)] rounded"></div>
          </div>

          {/* Placeholder Text */}
          <div className="text-center">
            <div className="text-[hsl(var(--muted-foreground))] text-xs md:text-sm font-medium mb-1">
              {t("ads.inlineSpace", "Inline Ad Space")}
            </div>
            <div className="text-sm md:text-base font-semibold text-[hsl(var(--foreground))]">
              {t("ads.advertiseHere", "Advertise Here")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InlineAd;
