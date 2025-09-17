"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const FeaturedAd = ({ ad, loading }) => {
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
      <section className="container mx-auto px-4 my-8">
        <div className="relative w-full h-32 md:h-40 lg:h-48 bg-gray-200 rounded-xl overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-300/50 to-transparent"></div>
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
      <section className="container mx-auto px-4 my-8">
        <div className="group relative">
          {/* Featured Badge */}
          <div className="absolute -top-3 left-4 z-20 flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            <Star size={12} className="fill-current" />
            {t("ads.featured", "Featured")}
          </div>

          <Link
            href={adUrl}
            target={ad.link?.target || "_blank"}
            rel="noopener noreferrer sponsored"
          >
            <div className="relative w-full h-32 md:h-40 lg:h-48 rounded-xl overflow-hidden border-2 border-yellow-400/30 shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:border-yellow-400/50 group-hover:scale-[1.02]">
              <Image
                src={adMedia.url}
                alt={
                  language === "ar"
                    ? ad.title.ar
                    : ad.title.en || "Featured Advertisement"
                }
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-500 ease-in-out group-hover:scale-105"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60"></div>

              {/* Ad Badge */}
              <div className="absolute top-3 right-3 bg-white/90 text-gray-900 text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm">
                {t("ads.adLabel", "Ad")}
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-0 flex items-center justify-between p-6">
                <div className="text-white">
                  <h3 className="font-bold text-lg md:text-xl mb-2 line-clamp-1">
                    {language === "ar" ? ad.title.ar : ad.title.en}
                  </h3>
                  {ad.description && (
                    <p className="text-sm md:text-base opacity-90 line-clamp-2 max-w-md">
                      {language === "ar"
                        ? ad.description.ar
                        : ad.description.en}
                    </p>
                  )}
                </div>

                {/* Call to Action */}
                <div className="hidden md:flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-white font-medium text-sm transition-all duration-300 group-hover:bg-white/30">
                  {t("ads.learnMore", "Learn More")}
                  <span
                    className={`ml-2 transition-transform duration-300 group-hover:translate-x-1 ${
                      language === "ar" ? "rotate-180" : ""
                    }`}
                  >
                    →
                  </span>
                </div>
              </div>

              {/* Shine Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>
          </Link>
        </div>
      </section>
    );
  }

  // 3. Placeholder State (No Ad, Not Loading)
  return (
    <section className="container mx-auto px-4 my-8">
      <div className="relative w-full h-32 md:h-40 lg:h-48 bg-gradient-to-r from-[hsl(var(--primary)/0.12)] via-[hsl(var(--accent)/0.12)] to-[hsl(var(--primary)/0.12)] rounded-xl border-2 border-dashed border-[hsl(var(--primary)/0.30)] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>

        {/* Featured Badge Placeholder */}
        <div className="absolute -top-3 left-4 flex items-center gap-1 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
          <Star size={12} />
          {t("ads.featured", "Featured")}
        </div>

        <div className="text-center z-10">
          <div className="text-[hsl(var(--muted-foreground))] text-sm md:text-base font-medium mb-2">
            {t("ads.featuredSpace", "Featured Ad Space")}
          </div>
          <div className="text-lg md:text-xl font-bold text-[hsl(var(--foreground))] mb-1">
            {t("ads.advertiseHere", "Advertise Here")}
          </div>
          <div className="text-xs text-[hsl(var(--muted-foreground))] opacity-75">
            {t("ads.premiumPlacement", "Premium Placement")}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedAd;
