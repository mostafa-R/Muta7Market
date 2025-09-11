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
  const [currentLanguage, setCurrentLanguage] = useState(null);
  const [isRTL, setIsRTL] = useState(null);

  useEffect(() => {
    const applyRTLStyles = (isRtl) => {
      document.documentElement.dir = isRtl ? "rtl" : "ltr";

      if (isRtl) {
        document.documentElement.classList.add("rtl");
      } else {
        document.documentElement.classList.remove("rtl");
      }

      if (toast.container) {
        toast.container.style.direction = isRtl ? "rtl" : "ltr";
      }

      document.documentElement.setAttribute(
        "data-direction",
        isRtl ? "rtl" : "ltr"
      );
      document.documentElement.setAttribute(
        "data-language",
        isRtl ? "ar" : "en"
      );
    };

    try {
      // Default to Arabic if no saved language
      const savedLanguage = localStorage.getItem("language") || "ar";
      setCurrentLanguage(savedLanguage);
      const isRtl = savedLanguage === "ar";
      setIsRTL(isRtl);

      // Force Arabic as default if no language is set
      if (!i18n.language || i18n.language === "cimode") {
        i18n.changeLanguage("ar");
      } else if (typeof i18n?.changeLanguage === "function") {
        i18n.changeLanguage(savedLanguage);
      }

      document.documentElement.lang = savedLanguage;
      applyRTLStyles(isRtl);

      // Import translations for this language immediately
      if (typeof window !== "undefined") {
        import("@/utils/localizationHelper").then((module) => {
          module.initDynamicTranslations(savedLanguage);
        });
      }
    } catch (error) {
      console.error("Error loading language:", error);
      setCurrentLanguage("ar");
      setIsRTL(true);
      if (typeof i18n?.changeLanguage === "function") {
        i18n.changeLanguage("ar");
      }
      document.documentElement.lang = "ar";
      applyRTLStyles(true);
    }
  }, []);

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

      if (isRtl) {
        document.documentElement.classList.add("rtl");
      } else {
        document.documentElement.classList.remove("rtl");
      }

      document.documentElement.setAttribute(
        "data-direction",
        isRtl ? "rtl" : "ltr"
      );
      document.documentElement.setAttribute("data-language", lng);

      if (toast.container) {
        toast.container.style.direction = isRtl ? "rtl" : "ltr";
      }

      toast.update();
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };

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
