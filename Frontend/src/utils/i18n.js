import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

const isServer = typeof window === "undefined";

if (isServer) {
  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      lng: "ar",
      fallbackLng: "ar",
      resources: { en: { common: {} }, ar: { common: {} } },
      interpolation: { escapeValue: false },
      supportedLngs: ["ar", "en"],
      initImmediate: false,
    });
  }
} else {
  if (!i18n.isInitialized) {
    i18n
      .use(HttpBackend)
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        fallbackLng: "ar",
        supportedLngs: ["ar", "en"],
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
