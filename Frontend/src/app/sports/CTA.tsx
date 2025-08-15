import { useLanguage } from "@/contexts/LanguageContext";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

function CTA() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  return (
    <div className="bg-muted mt-4 rounded-3xl p-8 md:p-10 text-center border border-[hsl(var(--primary)/0.1)] shadow-lg">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))] mb-4 md:mb-6">
        {t("sports.cta.title")}
      </h2>
      <p className="text-base md:text-lg text-[hsl(var(--muted-foreground))] mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
        {t("sports.cta.description")}
      </p>
      <Link href="/register-profile">
        <button
          type="button"
          className="inline-flex items-center justify-center bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.9)] text-[hsl(var(--primary-foreground))] rounded-xl text-base md:text-lg px-8 py-4 md:px-10 md:py-5 hover:from-[hsl(var(--primary)/0.9)] hover:to-[hsl(var(--primary))] transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[hsl(var(--primary)/0.3)] font-semibold"
        >
          <Trophy
            className={`w-5 h-5 md:w-6 md:h-6 ${isRTL ? "ml-3" : "mr-3"}`}
          />
          {t("sports.cta.button")}
        </button>
      </Link>
    </div>
  );
}

export default CTA;
