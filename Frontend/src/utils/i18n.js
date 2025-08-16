import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

const isServer = typeof window === "undefined";

if (isServer) {
  // Server-side: initialize minimally with inline resources to avoid network
  // requests and ensure useTranslation has an instance during prerender.
  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      lng: "en",
      fallbackLng: "en",
      resources: { en: { common: {} }, ar: { common: {} } },
      interpolation: { escapeValue: false },
      supportedLngs: ["en", "ar"],
      initImmediate: false,
    });
  }
} else {
  // Client-side: full setup with backend & language detection
  if (!i18n.isInitialized) {
    i18n
      .use(HttpBackend)
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        fallbackLng: "en",
        supportedLngs: ["en", "ar"],
        debug: false,
        detection: {
          order: ["localStorage", "navigator"],
          caches: ["localStorage"],
        },
        backend: {
          loadPath: "/locales/{{lng}}/common.json",
        },
        ns: ["common"],
        defaultNS: "common",
        interpolation: {
          escapeValue: false,
        },
      });
  }
}

export default i18n;
