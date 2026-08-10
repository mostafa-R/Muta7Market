"use client";

import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import "@/utils/i18n";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function Providers({ children }: { children: React.ReactNode }) {
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
