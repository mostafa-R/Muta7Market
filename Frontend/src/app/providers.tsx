"use client";

import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import "@/utils/i18n";
import { initDynamicTranslations } from "@/utils/localizationHelper";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function Providers({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();

  // Reload translations when language changes
  useEffect(() => {
    if (language) {
      console.log(
        `🔄 Language changed to ${language}, reloading translations...`
      );
      initDynamicTranslations(language);
    }
  }, [language]);

  return (
    <LanguageProvider>
      {children}
      <DynamicToastContainer />
    </LanguageProvider>
  );
}

function DynamicToastContainer() {
  const { isRTL } = useLanguage();

  return (
    <ToastContainer
      position={isRTL ? "top-left" : "top-right"}
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={isRTL}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      limit={5}
      style={{ zIndex: 999999 }}
    />
  );
}
