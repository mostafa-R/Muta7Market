"use client";

import i18n from "@/utils/i18n";
import {
  hydrateTranslationsSync,
  initDynamicTranslations,
} from "@/utils/localizationHelper";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { toast } from "react-toastify";

const LanguageContext = createContext({
  language: "ar",
  changeLanguage: (lng) => {},
  isRTL: true,
  dir: "rtl",
  isReady: false,
});

// Avoid the SSR useLayoutEffect warning: layout effects only matter on the client
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const applyRTLStyles = (isRtl) => {
  if (typeof document === "undefined") return;

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

const hasLanguageResources = (lng) => {
  try {
    const bundle = i18n.getResourceBundle(lng, "common");
    return !!(bundle && Object.keys(bundle).length > 0);
  } catch {
    return false;
  }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(null);
  const [isRTL, setIsRTL] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // Runs synchronously before first paint: restore the saved language and
  // hydrate cached translations so t() returns real text on first render.
  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedLanguage = localStorage.getItem("language") || "ar";
      const isRtl = savedLanguage === "ar";

      setCurrentLanguage(savedLanguage);
      setIsRTL(isRtl);
      document.documentElement.lang = savedLanguage;
      applyRTLStyles(isRtl);

      const loaded = hydrateTranslationsSync(savedLanguage);
      // Also hydrate the other language so switching later is instant
      hydrateTranslationsSync(savedLanguage === "ar" ? "en" : "ar");

      if (typeof i18n?.changeLanguage === "function") {
        i18n.changeLanguage(savedLanguage);
      }

      if (loaded) {
        setIsReady(true);
      }
    } catch (error) {
      console.error("Error restoring language:", error);
    }
  }, []);

  // Fetch fresh translations from the backend (cached translations render
  // immediately; the UI stays gated until data is available).
  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      try {
        const savedLanguage = localStorage.getItem("language") || "ar";

        if (typeof i18n?.changeLanguage === "function") {
          i18n.changeLanguage(savedLanguage);
        }

        await initDynamicTranslations(savedLanguage);

        if (!cancelled) {
          setIsReady(true);
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
        if (!cancelled) {
          setIsReady(true);
        }
      }
    };

    boot();

    return () => {
      cancelled = true;
    };
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
      applyRTLStyles(isRtl);

      // Restore the target language from cache when available so there is no
      // flash of keys while the backend request is in flight.
      const fromCache = hydrateTranslationsSync(lng);
      if (!fromCache && !hasLanguageResources(lng)) {
        setIsReady(false);
        initDynamicTranslations(lng).finally(() => {
          setIsReady(true);
        });
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
    isReady,
  };

  if (!isReady) {
    return (
      <LanguageContext.Provider value={contextValue}>
        <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">M7</span>
              </div>
            </div>
            <p className="text-gray-600 font-medium">متاح ماركت</p>
          </div>
        </div>
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
