"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";

const AdBanner = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <section>
      <div className="w-full ">
        {/* Google Ads Container */}
        <div
          className="
            w-full 
            h-20 
            md:h-24 
            lg:h-28
            bg-gradient-to-r 
            from-[hsl(var(--primary)/0.08)] 
            to-[hsl(var(--accent)/0.08)] 
            rounded-lg 
            border 
            border-[hsl(var(--primary)/0.20)] 
            flex 
            items-center 
            justify-center
            relative
            overflow-hidden
          "
          id="google-ad-banner"
          data-ad-slot="your-ad-slot-id"
          data-ad-format="auto"
        >
          {/* Ad Content Placeholder */}
          <div className="text-center z-10">
            <div className="text-[hsl(var(--muted-foreground))] text-xs md:text-sm font-medium">
              {t("ads.adSpace")}
            </div>
            <div className="text-sm md:text-base font-semibold text-[hsl(var(--foreground))]">
              {t("ads.advertiseHere")}
            </div>
          </div>

          {/* Decorative Elements for Better Visual Appeal */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-2 left-2 w-2 h-2 bg-[hsl(var(--primary))] rounded-full"></div>
            <div className="absolute top-2 right-2 w-2 h-2 bg-[hsl(var(--accent))] rounded-full"></div>
            <div className="absolute bottom-2 left-2 w-2 h-2 bg-[hsl(var(--accent))] rounded-full"></div>
            <div className="absolute bottom-2 right-2 w-2 h-2 bg-[hsl(var(--primary))] rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdBanner;
