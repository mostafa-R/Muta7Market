"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { isRTL, dir } = useLanguage();
  const { t } = useTranslation();
  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-[calc(100vh-120px)] bg-background p-6 overflow-hidden"
      dir={dir}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/10 -z-10"></div>

      {/* Floating shapes for decoration */}
      <div
        className={`absolute top-10 ${
          isRTL ? "right-6" : "left-6"
        } w-16 h-16 bg-primary/10 rounded-full blur-xl`}
      ></div>
      <div
        className={`absolute bottom-16 ${
          isRTL ? "left-10" : "right-10"
        } w-24 h-24 bg-accent/20 rounded-full blur-2xl`}
      ></div>
      <div
        className={`absolute top-1/4 ${
          isRTL ? "left-1/5" : "right-1/5"
        } w-12 h-12 bg-secondary/15 rounded-full blur-lg`}
      ></div>

      <div className="relative z-10 mx-auto w-full max-w-2xl text-center">
        {/* 404 Number */}
        <div className="relative mb-8">
          <h1 className="text-6xl md:text-8xl font-black text-primary/20 leading-none select-none">
            404
          </h1>
          <div className=" inset-0 flex items-center justify-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground px-4">
              {t("notFound.title")}
            </h2>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-6 space-y-3">
          <h3 className="text-lg md:text-xl font-semibold text-foreground px-4">
            {t("notFound.subtitle")}
          </h3>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed px-4">
            {t("notFound.description")}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-3 text-sm font-medium shadow-sm hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            {t("notFound.backToHome")}
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background text-foreground px-6 py-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-all duration-300"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {t("notFound.goBack")}
          </button>
        </div>

        {/* Additional helpful info */}
        <div className="mt-8 p-3 bg-muted/50 rounded-lg max-w-md mx-auto">
          <p className="text-xs text-muted-foreground">
            {t("notFound.helpText")}
          </p>
        </div>
      </div>
    </div>
  );
}
