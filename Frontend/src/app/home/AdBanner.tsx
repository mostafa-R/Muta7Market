"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";

const AdBanner = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  return (
    <section className="py-8 ">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="
            bg-gradient-to-r
            from-[hsl(var(--primary)/0.10)]
            to-[hsl(var(--accent)/0.10)]
            rounded-2xl
            p-8
            text-center
            border
            border-[hsl(var(--primary)/0.20)]
          "
        >
          <div className="text-[hsl(var(--muted-foreground))] text-sm mb-2">
            {t("ads.adSpace")}
          </div>
          <div className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
            {t("ads.advertiseHere")}
          </div>
          <div className="text-[hsl(var(--muted-foreground))] text-sm">
            {t("ads.contactUs")}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdBanner;
