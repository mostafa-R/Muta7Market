"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const PopupAd = ({ ad }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 3000); // Show popup after 3 seconds

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  if (!isOpen || !ad) {
    return null;
  }

  const adMedia =
    isMobile && ad?.media?.mobile?.url ? ad.media.mobile : ad?.media?.desktop;
  const adUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/advertisements/click/${ad._id}`;

  const handleClose = (e) => {
    // Prevent closing when clicking on the ad content itself
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleClose}
    >
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md mx-auto overflow-hidden">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-2 right-2 z-10 p-1.5 bg-gray-200/50 hover:bg-gray-300/70 rounded-full text-gray-800 dark:text-gray-200 transition-colors"
          aria-label={t("ads.closeAd", "Close Ad")}
        >
          <X size={20} />
        </button>

        {adMedia?.url ? (
          <Link
            href={adUrl}
            target={ad.link?.target || "_blank"}
            rel="noopener noreferrer sponsored"
            className="block group"
          >
            <div className="relative w-full aspect-video">
              <Image
                src={adMedia.url}
                alt={
                  language === "ar"
                    ? ad.title.ar
                    : ad.title.en || "Advertisement"
                }
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                {t("ads.adLabel", "Ad")}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {language === "ar" ? ad.title.ar : ad.title.en}
              </h3>
              {ad.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {language === "ar" ? ad.description.ar : ad.description.en}
                </p>
              )}
            </div>
          </Link>
        ) : (
          <div className="p-8 text-center">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              {language === "ar" ? ad.title.ar : ad.title.en}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {t("ads.noMedia", "Advertisement content not available.")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PopupAd;
