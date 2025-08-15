"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const StartJourneySection = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <section className="py-16 bg-[hsl(var(--muted))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[hsl(var(--primary))] rounded-3xl p-8 md:p-12 text-center text-[hsl(var(--primary-foreground))] shadow-card">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("home.startJourney")}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            {t("home.startJourneyDescription")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register-profile">
              <button
                type="button"
                className="flex items-center justify-center gap-2 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] text-lg rounded-xl px-8 py-4 font-semibold shadow-card hover:shadow-lg transition"
                style={{ minWidth: 170 }}
              >
                <Star className="w-5 h-5 ml-2" />
                {t("user.registerAsPlayer")}
              </button>
            </Link>
            <Link href="/sports">
              <button
                type="button"
                className="flex items-center justify-center gap-2 border border-white/30 text-white bg-white/10 text-lg rounded-xl px-8 py-4 font-semibold hover:bg-white/20 transition"
                style={{ minWidth: 170 }}
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                {t("home.exploreAllSports")}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StartJourneySection;
