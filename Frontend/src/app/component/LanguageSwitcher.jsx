"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Menu, Transition } from "@headlessui/react";
import { Globe } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher({ isMobile = false }) {
  const { t } = useTranslation();
  const { language, changeLanguage, isRTL, dir } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by mounting only on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  const languages = [
    { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
    { code: "ar", name: "العربية", nativeName: "العربية", flag: "🇦🇪" },
  ];

  const handleLanguageChange = (lng) => {
    changeLanguage(lng);
  };

  if (!mounted) {
    // Return a placeholder with the same dimensions to prevent layout shift
    return isMobile ? (
      <div className="w-full h-[100px]" aria-hidden="true" />
    ) : (
      <div className="w-[90px] h-[40px]" aria-hidden="true" />
    );
  }

  // Mobile version
  if (isMobile) {
    return (
      <div className="w-full space-y-2">
        <p className="text-sm font-medium text-gray-700 rtl-text-right">
          {t("language.select")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {languages.map((lng) => (
            <button
              key={lng.code}
              onClick={() => handleLanguageChange(lng.code)}
              className={`
                flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                ${
                  language === lng.code
                    ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 font-semibold border border-blue-200"
                    : "border border-gray-200 hover:bg-gray-50"
                }
                transition-all
              `}
            >
              <span className="mr-1">{lng.flag}</span>
              {lng.nativeName}
            </button>
          ))}
        </div>

        <div className="mt-2 text-xs text-gray-500 text-center">
          {isRTL ? (
            <span className="ar-only">
              سيتم تغيير اتجاه الموقع للغة المختارة
            </span>
          ) : (
            <span className="en-only">
              Interface direction will change based on selected language
            </span>
          )}
        </div>
      </div>
    );
  }

  // Desktop version
  return (
    <Menu as="div" className="relative">
      <div>
        <Menu.Button
          className={`
            flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium 
            hover:bg-gray-50 transition border border-gray-300 min-w-[90px]
            ${language === "ar" ? "font-arabic" : ""}
          `}
          aria-label={t("language.select")}
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">
            {language === "ar" ? "العربية 🇦🇪" : "English 🇺🇸"}
          </span>
          <span className="inline sm:hidden">
            {language === "ar" ? "🇦🇪" : "🇺🇸"}
          </span>
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={`
            absolute mt-2 w-40 origin-top rounded-lg bg-white shadow-lg 
            ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden
            ${isRTL ? "right-0" : "left-0"}
          `}
        >
          <div className="py-1">
            {languages.map((lng) => (
              <Menu.Item key={lng.code}>
                {({ active }) => (
                  <button
                    onClick={() => handleLanguageChange(lng.code)}
                    className={`
                      ${active ? "bg-gray-100" : ""}
                      ${
                        language === lng.code
                          ? "font-medium text-blue-600"
                          : "text-gray-700"
                      }
                      flex items-center w-full px-4 py-2 text-sm transition-colors
                      ${lng.code === "ar" ? "font-arabic justify-between" : ""}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span>{lng.flag}</span>
                      <span>{lng.nativeName}</span>
                    </div>
                    {language === lng.code && (
                      <span className="ml-auto text-blue-600">✓</span>
                    )}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
