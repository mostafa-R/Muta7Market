"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import CTA from "./CTA";
import SportCard from "./SportCard";

const SportsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-[hsl(var(--muted))]">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-4">
            {t("sports.pageTitle")}
          </h1>
          <p className="text-xl text-[hsl(var(--muted-foreground))] max-w-3xl mx-auto mb-8">
            {t("sports.pageDescription")}
          </p>
          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search
              className={`absolute ${
                isRTL ? "right-3" : "left-3"
              } top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] w-5 h-5`}
            />
            <input
              type="text"
              placeholder={t("sports.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${
                isRTL ? "pr-10 text-right" : "pl-10 text-left"
              } w-full py-2 px-4 rounded-lg border border-[hsl(var(--border))] bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition`}
            />
          </div>
        </div>

        <SportCard searchTerm={searchTerm} />

        {/* CTA Section */}
        <CTA />
      </div>
    </div>
  );
};

export default SportsPage;
