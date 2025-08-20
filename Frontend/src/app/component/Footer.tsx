"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === "ar";

  return (
    <footer className="bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="text-center md:text-start">
            <div className="flex items-center justify-center md:justify-start space-x-2 space-x-reverse mb-4">
              <div className="w-8 h-8 bg-[hsl(var(--primary))] rounded-lg flex items-center justify-center mr-3 ml-3">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">{t("brand.name")}</span>
            </div>
            <p className="text-[hsl(var(--muted-foreground))] text-sm">
              {t("footer.description")}
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-start">
            <h3 className="font-semibold mb-4">
              {isRTL ? "روابط سريعة" : "Quick Links"}
            </h3>
            <div className="space-y-2">
              <div>
                <Link
                  href="/"
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors text-sm"
                >
                  {t("navbar.home")}
                </Link>
              </div>
              <div>
                <Link
                  href="/players"
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors text-sm"
                >
                  {t("navbar.players")}
                </Link>
              </div>
              <div>
                <Link
                  href="/coaches"
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors text-sm"
                >
                  {t("navbar.coaches")}
                </Link>
              </div>
              <div>
                <Link
                  href="/sports"
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors text-sm"
                >
                  {t("navbar.sports")}
                </Link>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="text-center md:text-start">
            <h3 className="font-semibold mb-4">
              {isRTL ? "الخدمات" : "Services"}
            </h3>
            <div className="space-y-2">
              <div>
                <Link
                  href="/info"
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors text-sm"
                >
                  {isRTL ? "من نحن" : "About Us"}
                </Link>
              </div>
              <div>
                <a
                  href="mailto:info@muta7market.com"
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors text-sm"
                >
                  {isRTL ? "تواصل معنا" : "Contact Us"}
                </a>
              </div>
            </div>
          </div>

          {/* Legal */}
          <div className="text-center md:text-start">
            <h3 className="font-semibold mb-4">{isRTL ? "قانوني" : "Legal"}</h3>
            <div className="space-y-2">
              <div>
                <Link
                  href="/privacy-terms"
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors text-sm"
                >
                  {t("common.privacyAndTerms")}
                </Link>
              </div>
              <div>
                <Link
                  href="/privacy-terms#privacy"
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors text-sm"
                >
                  {t("common.privacyPolicy")}
                </Link>
              </div>
              <div>
                <Link
                  href="/privacy-terms#terms"
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors text-sm"
                >
                  {t("common.termsAndConditions")}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[hsl(var(--border))] pt-8 text-center">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-[hsl(var(--muted-foreground))] text-sm">
              © {new Date().getFullYear()} {t("brand.name")}.{" "}
              {isRTL ? "جميع الحقوق محفوظة" : "All rights reserved"}.
            </p>
            <div className="flex items-center space-x-4 space-x-reverse">
              <a
                href="mailto:info@muta7market.com"
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors text-sm"
              >
                info@muta7market.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
