"use client";

import { useTranslation } from "react-i18next";

const SimpleHero = () => {
  const { t } = useTranslation();

  return (
    <section className="relative pt-12 text-white mb-10 overflow-hidden">
      {/* Hero Background Image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.7) 100%),
            url('https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2090&auto=format&fit=crop')
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      />

      {/* Additional transparent layer for visual enhancement */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 drop-shadow-2xl">
            {t("hero.title")}
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed max-w-3xl mx-auto drop-shadow-lg">
            {t("hero.description")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default SimpleHero;
