import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

// Initial empty resources - will be populated dynamically from the backend
const initialResources = {
  en: {
    common: {},
    dynamic: {},
  },
  ar: {
    common: {},
    dynamic: {},
  },
};

const isServer = typeof window === "undefined";

if (isServer) {
  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      lng: "ar", // Always default to Arabic
      fallbackLng: "ar",
      resources: initialResources,
      interpolation: { escapeValue: false },
      supportedLngs: ["ar", "en"],
      initImmediate: false,
      ns: ["common", "dynamic"],
      defaultNS: "common",
    });
  }
} else {
  if (!i18n.isInitialized) {
    i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        lng: "ar", // Force Arabic as default
        fallbackLng: "ar",
        supportedLngs: ["ar", "en"],
        debug: false,
        detection: {
          order: ["localStorage", "navigator"],
          caches: ["localStorage"],
          lookupLocalStorage: "language", // Match the key in LanguageContext
        },
        resources: initialResources,
        ns: ["common", "dynamic"],
        defaultNS: "common",
        interpolation: {
          escapeValue: false,
        },
      });
  }
}

export default i18n;
