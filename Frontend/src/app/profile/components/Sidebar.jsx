"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCallback, useState } from "react";
import { FaCalendar, FaFileAlt, FaLock, FaUser } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const Sidebar = ({
  activeSection,
  setActiveSection,
  isSidebarOpen,
  setIsSidebarOpen,
  t,
}) => {
  const { language } = useLanguage();
  const [isNavigating, setIsNavigating] = useState(false);

  const menuItems = [
    { id: "profile", label: t("profile.sidebarTitles.profile"), icon: FaUser },
    { id: "edit", label: t("profile.sidebarTitles.edit"), icon: FaLock },
    {
      id: "payments",
      label: t("profile.sidebarTitles.payments"),
      icon: FaCalendar,
    },
    {
      id: "playerProfile",
      label: t("profile.sidebarTitles.playerProfile"),
      icon: FaFileAlt,
    },
  ];

  const handleItemClick = useCallback(
    async (sectionId) => {
      if (activeSection === sectionId) {
        setIsSidebarOpen(false);
        return;
      }

      setIsNavigating(true);
      setActiveSection(sectionId);
      setIsSidebarOpen(false);

      setTimeout(() => {
        setIsNavigating(false);

        const mainContent = document.querySelector("#main-content");
        if (mainContent) {
          mainContent.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 300);
    },
    [activeSection, setActiveSection, setIsSidebarOpen]
  );

  const handleKeyDown = useCallback(
    (event, sectionId) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleItemClick(sectionId);
      }
    },
    [handleItemClick]
  );

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 right-0 h-full lg:h-screen
          w-72 lg:w-64 xl:w-80
          bg-white shadow-xl lg:shadow-lg
          transform transition-all duration-300 ease-in-out
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "translate-x-full lg:translate-x-0"
          }
          z-50 lg:z-30
          overflow-y-auto
          border-l border-gray-100
        `}
        dir={language === "ar" ? "rtl" : "ltr"}
        role="navigation"
        aria-label={t("profile.sidebarNavigation")}
      >
        <div className="p-6">
          {/* Mobile header */}
          <div className="flex justify-between items-center mb-8 lg:hidden">
            <h2 className="text-2xl font-bold text-gray-800">
              {t("common.menu")}
            </h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={t("common.closeMenu")}
            >
              <IoMdClose size={24} />
            </button>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-xl xl:text-2xl font-bold text-gray-800">
              {t("profile.dashboard")}
            </h2>
          </div>

          {/* Navigation */}
          <nav className="space-y-2" role="menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              const isDisabled = isNavigating;

              return (
                <button
                  key={item.id}
                  onClick={() => !isDisabled && handleItemClick(item.id)}
                  onKeyDown={(e) => handleKeyDown(e, item.id)}
                  disabled={isDisabled}
                  className={`
                    w-full text-right py-3 px-4 rounded-xl
                    flex items-center gap-3
                    text-sm lg:text-base
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${
                      isActive
                        ? "bg-[#00183D] text-white shadow-md transform scale-[1.02]"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm active:scale-[0.98]"
                    }
                    ${isDisabled ? "pointer-events-none" : ""}
                  `}
                  role="menuitem"
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`${item.label} ${
                    isActive ? t("common.currentSection") : ""
                  }`}
                >
                  <Icon
                    className={`text-lg transition-transform duration-200 ${
                      isActive ? "scale-110" : ""
                    }`}
                  />
                  <span className="font-medium">{item.label}</span>

                  {/* Loading indicator */}
                  {isNavigating && isActive && (
                    <div className="ml-auto">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}

                  {/* Active indicator */}
                  {isActive && !isNavigating && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Navigation hint for mobile */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl lg:hidden">
            <p className="text-sm text-blue-700 text-center">
              {t("profile.tapToNavigate")}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
