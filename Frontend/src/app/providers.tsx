"use client";

import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import i18n configuration - needs to be after the "use client" directive
import "@/utils/i18n";

export function Providers({ children }: { children: React.ReactNode }) {
  // This enables client-side control of toast RTL/LTR
  const handleLanguageChange = () => {
    // Logic will be handled by the LanguageProvider
  };

  useEffect(() => {
    // Apply any global side effects needed for language switching
    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <LanguageProvider>
      {children}
      <DynamicToastContainer />
    </LanguageProvider>
  );
}

// Separate component to access language context
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
    />
  );
}
