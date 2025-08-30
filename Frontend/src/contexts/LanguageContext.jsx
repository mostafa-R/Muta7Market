"use client";

import i18n from "@/utils/i18n";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

const LanguageContext = createContext({
  language: "ar",
  changeLanguage: (lng) => {},
  isRTL: true,
  dir: "rtl",
});

export const LanguageProvider = ({ children }) => {
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

    // Get language from localStorage or use default (Arabic)
    try {
      const savedLanguage = localStorage.getItem("language") || "ar";
      setCurrentLanguage(savedLanguage);
      const isRtl = savedLanguage === "ar";
      setIsRTL(isRtl);

      if (typeof i18n?.changeLanguage === "function") {
        i18n.changeLanguage(savedLanguage);
      }
      document.documentElement.lang = savedLanguage;

      applyRTLStyles(isRtl);
    } catch (error) {
      // Fallback to Arabic if localStorage fails
      console.error("Error loading language:", error);
      setCurrentLanguage("ar");
      setIsRTL(true);
      if (typeof i18n?.changeLanguage === "function") {
        i18n.changeLanguage("ar");
      }
      document.documentElement.lang = "ar";
      applyRTLStyles(true);
    }
  }, [i18n]);

  const changeLanguage = (lng) => {
    try {
      setCurrentLanguage(lng);
      const isRtl = lng === "ar";
      setIsRTL(isRtl);

      if (typeof i18n?.changeLanguage === "function") {
        i18n.changeLanguage(lng);
      }
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
    language: currentLanguage === null ? "ar" : currentLanguage,
    changeLanguage,
    isRTL: isRTL === null ? true : isRTL,
    dir: isRTL === null ? "rtl" : isRTL ? "rtl" : "ltr",
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
