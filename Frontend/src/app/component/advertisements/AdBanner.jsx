"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const AdBanner = ({ ad, loading }) => {
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
      <section className="container mx-auto my-4">
        <div className="relative w-full h-24 md:h-32 lg:h-40 bg-gray-100 dark:bg-gray-800/30 rounded-lg overflow-hidden shadow-sm">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-200/60 dark:via-gray-700/30 to-transparent"></div>

          {/* Skeleton content */}
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6 md:px-8 lg:px-12">
              <div className="space-y-3 max-w-lg">
                <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700/50 rounded-md"></div>
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700/50 rounded-md hidden md:block"></div>
                <div className="h-8 w-24 mt-2 bg-gray-200 dark:bg-gray-700/50 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Skeleton badge */}
          <div className="absolute top-3 right-3 h-5 w-12 bg-gray-200 dark:bg-gray-700/50 rounded-full"></div>
        </div>
      </section>
    );
  }

  // Check if ad and media exist
  if (!ad || !ad.media) {
    return (
      <section className="container mx-auto px-4 my-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Error: Invalid advertisement data</p>
        </div>
      </section>
    );
  }

  const adMedia =
    isMobile && ad?.media?.mobile?.url ? ad.media.mobile : ad?.media?.desktop;

  // 2. Ad Display State
  if (ad && adMedia?.url) {
    const adUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/advertisements/click/${ad._id}`;
    return (
      <section className="container mx-auto my-4">
        <div className="w-full group">
          <Link
            href={adUrl}
            target={ad.link?.target || "_blank"}
            rel="noopener noreferrer sponsored"
            className="block"
          >
            <div className="relative w-full h-24 md:h-32 lg:h-40 rounded-lg overflow-hidden border border-gray-200/50 shadow-md hover:shadow-xl transition-all duration-300 group-hover:border-primary/20">
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
                sizes="(max-width: 768px) 100vw, 1200px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/60"></div>

              {/* Ad Badge */}
              <div className="absolute top-3 right-3 bg-white/90 text-gray-900 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm shadow-sm">
                {t("ads.adLabel", "Ad")}
              </div>

              {/* Ad Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-6 md:px-8 lg:px-12">
                  <div className="max-w-lg text-white">
                    <h3 className="font-bold text-lg md:text-xl line-clamp-1 drop-shadow-md transform transition-transform duration-300 group-hover:translate-y-[-2px]">
                      {language === "ar" ? ad.title.ar : ad.title.en}
                    </h3>
                    {ad.description && (
                      <p className="text-sm opacity-90 line-clamp-1 md:line-clamp-2 drop-shadow-md hidden md:block">
                        {language === "ar"
                          ? ad.description.ar
                          : ad.description.en}
                      </p>
                    )}
                    <div className="mt-2 md:mt-3 inline-flex items-center text-xs font-medium text-white/90 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                      {t("ads.learnMore", "معرفة المزيد")} →
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>
    );
  }

  // 3. Placeholder State (No Ad, Not Loading)
  return (
    <section className="container mx-auto my-4">
      <div className="w-full">
        <div className="relative w-full h-24 md:h-32 lg:h-40 bg-gradient-to-r from-[hsl(var(--primary)/0.03)] to-[hsl(var(--accent)/0.05)] rounded-lg border border-[hsl(var(--primary)/0.15)] flex items-center justify-center overflow-hidden shadow-sm">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="hidden md:block w-12 h-12 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[hsl(var(--primary))]"
              >
                <path d="M7 10v12" />
                <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
              </svg>
            </div>
            <div className="text-center md:text-left">
              <div className="text-[hsl(var(--primary))] text-xs md:text-sm font-medium mb-1">
                {t("ads.adSpace", "مساحة إعلانية")}
              </div>
              <div className="text-sm md:text-base font-semibold text-[hsl(var(--foreground))] mb-1">
                {t("ads.advertiseHere", "أعلن هنا")}
              </div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] opacity-75 hidden md:block">
                {t("ads.bannerSize", "970 × 90 / 728 × 90 / 320 × 50")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdBanner;
