"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  return (
    <footer className="bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 space-x-reverse mb-4">
            <div className="w-8 h-8 bg-[hsl(var(--primary))] rounded-lg flex items-center justify-center mr-3 ml-3">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">{t("brand.slogan")}</span>
          </div>
          <p className="text-[hsl(var(--muted-foreground))]">
            {t("footer.description")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
