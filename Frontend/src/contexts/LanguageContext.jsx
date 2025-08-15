"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const LanguageContext = createContext({
  language: "en",
  changeLanguage: (lng) => {},
  isRTL: false,
  dir: "ltr",
});

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  // Using null initial state to detect first render and prevent hydration mismatch
  const [currentLanguage, setCurrentLanguage] = useState(null);
  const [isRTL, setIsRTL] = useState(null);

  // Apply RTL-specific CSS when language is Arabic
  useEffect(() => {
    // This only runs client-side to prevent hydration issues

    // Apply RTL styles when needed
    const applyRTLStyles = (isRtl) => {
      // Update document direction
      document.documentElement.dir = isRtl ? "rtl" : "ltr";

      // Add or remove RTL class for additional styling
      if (isRtl) {
        document.documentElement.classList.add("rtl");
      } else {
        document.documentElement.classList.remove("rtl");
      }

      // Update toast container direction
      if (toast.container) {
        toast.container.style.direction = isRtl ? "rtl" : "ltr";
      }

      // Add data attributes for easier CSS targeting
      document.documentElement.setAttribute(
        "data-direction",
        isRtl ? "rtl" : "ltr"
      );
      document.documentElement.setAttribute(
        "data-language",
        isRtl ? "ar" : "en"
      );
    };

    // Get language from localStorage or use default
    try {
      const savedLanguage = localStorage.getItem("language") || "en";
      setCurrentLanguage(savedLanguage);
      const isRtl = savedLanguage === "ar";
      setIsRTL(isRtl);

      i18n.changeLanguage(savedLanguage);
      document.documentElement.lang = savedLanguage;

      applyRTLStyles(isRtl);
    } catch (error) {
      // Fallback to English if localStorage fails
      console.error("Error loading language:", error);
      setCurrentLanguage("en");
      setIsRTL(false);
      i18n.changeLanguage("en");
      document.documentElement.lang = "en";
      applyRTLStyles(false);
    }
  }, [i18n]);

  const changeLanguage = (lng) => {
    try {
      setCurrentLanguage(lng);
      const isRtl = lng === "ar";
      setIsRTL(isRtl);

      i18n.changeLanguage(lng);
      localStorage.setItem("language", lng);
      document.documentElement.lang = lng;
      document.documentElement.dir = isRtl ? "rtl" : "ltr";

      // Update RTL class
      if (isRtl) {
        document.documentElement.classList.add("rtl");
      } else {
        document.documentElement.classList.remove("rtl");
      }

      // Update data attributes
      document.documentElement.setAttribute(
        "data-direction",
        isRtl ? "rtl" : "ltr"
      );
      document.documentElement.setAttribute("data-language", lng);

      // Update toast container direction
      if (toast.container) {
        toast.container.style.direction = isRtl ? "rtl" : "ltr";
      }

      // Force update toasts
      toast.update();
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };

  // Default values for SSR and initial render (prevent hydration mismatch)
  const contextValue = {
    language: currentLanguage === null ? "en" : currentLanguage,
    changeLanguage,
    isRTL: isRTL === null ? false : isRTL,
    dir: isRTL === null ? "ltr" : isRTL ? "rtl" : "ltr",
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
