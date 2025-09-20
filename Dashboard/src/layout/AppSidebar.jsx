"use client";
import { ChartBarIcon, Medal, Users, Volleyball } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSidebar } from "../context/SidebarContext.jsx";
import {
  AdIcon,
  ChevronDownIcon,
  GameIcon,
  GlobeIcon,
  GridIcon,
  HorizontaLDots,
  PageIcon,
  PlugInIcon,
  SettingsIcon,
  UserCircleIcon
} from "../icons/index";

const navItems = [
  {
    icon: <GridIcon />,
    name: "لوحة التحكم",
    subItems: [{ name: "الرئيسية", path: "/", pro: false }],
  },
  {
    icon: <UserCircleIcon />,
    name: "ملف المستخدم",
    path: "/profile",
  },
  {
    name: "المستخدمون",
   
     icon: <Users />,
    subItems: [
      { name: "جدول المستخدمين", path: "/user/table", pro: false },
      { name: "إضافة مستخدم جديد", path: "/user/add", pro: false },
    ],
  },
  {
    name: "اللاعبون",
    icon: <Volleyball />,
    subItems: [{ name: "جدول اللاعبين", path: "/players/table", pro: false },
      { name: "إضافة لاعب جديد", path: "/players/create-with-player", pro: false },
    ],
  },
  {
    name: "المدربون",
    icon: <Medal />,
    subItems: [{ name: "جدول المدربين", path: "/coaches/table", pro: false }],
  },
  {
    name: "المدفوعات",
    icon: <PageIcon />,
    subItems: [
      // { name: "إحصائيات", path: "/blank", pro: false },
      { name: "جدول المدفوعات", path: "/payment", pro: false },
    ],
  },
  {
    name: "الإعدادات العامة",
    icon: <SettingsIcon />,
    path: "/settings",
  },
  {
    name: "الألعاب الرياضية",
    icon: <GameIcon />,
    path: "/sports",
  },
  {
    name: "الإعلانات",
    icon: <AdIcon />,
    path: "/advertisements",
  },
  {
    name: "الإحصائيات",
    icon: <ChartBarIcon />,
    path: "/analytics",
  },
  {
    name: "إدارة اللغات",
    icon: <GlobeIcon />,
    path: "/localization",
  },
];

const othersItems = [
  {
    icon: <PlugInIcon />,
    name: "المصادقة",
    subItems: [{ name: "تسجيل الدخول", path: "/signin", pro: false }],
  },
];

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});

  const isActive = useCallback((path) => path === pathname, [pathname]);

  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType,
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const renderMenuItems = (navItems, menuType) => (
    <ul className="flex flex-col gap-2" dir="rtl">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group relative rounded-xl p-3 flex items-center gap-3 w-full text-right ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active bg-gradient-to-r from-[#1e293b] to-[#334155] text-white shadow-lg dark:from-[#1e293b] dark:to-[#334155] transform scale-[1.02]"
                  : "menu-item-inactive hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 text-gray-600 dark:text-gray-300 hover:shadow-md hover:transform hover:scale-[1.01]"
              } transition-all duration-500 ease-out ${
                !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
              }`}
            >
              <span
                className={`${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active text-white transform scale-110"
                    : "menu-item-icon-inactive text-gray-600 dark:text-gray-400 group-hover:text-[#1e293b] dark:group-hover:text-gray-200 group-hover:scale-110"
                } transition-all duration-500 ease-out`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text font-medium transition-all duration-300">
                  {nav.name}
                </span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`mr-auto w-5 h-5 transition-all duration-300 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-white"
                      : "text-gray-400 group-hover:text-[#1e293b] dark:group-hover:text-gray-200"
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group relative rounded-xl p-3 flex items-center gap-3 text-right ${
                  isActive(nav.path)
                    ? "menu-item-active bg-gradient-to-r from-[#1e293b] to-[#334155] text-white shadow-lg dark:from-[#1e293b] dark:to-[#334155] transform scale-[1.02]"
                    : "menu-item-inactive hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 text-gray-600 dark:text-gray-300 hover:shadow-md hover:transform hover:scale-[1.01]"
                } transition-all duration-500 ease-out`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active text-white transform scale-110"
                      : "menu-item-icon-inactive text-gray-600 dark:text-gray-400 group-hover:text-[#1e293b] dark:group-hover:text-gray-200 group-hover:scale-110"
                  } transition-all duration-500 ease-out`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text font-medium transition-all duration-300">
                    {nav.name}
                  </span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-700 ease-out"
              style={{
                height:
                  openSubmenu?.type === menuType &&
                  openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-3 space-y-2 mr-9 relative" dir="rtl">
                <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-[#1e293b]/20 via-[#1e293b]/40 to-[#1e293b]/20 dark:from-gray-500/20 dark:via-gray-500/40 dark:to-gray-500/20"></div>
                {nav.subItems.map((subItem, subIndex) => (
                  <li key={subItem.name} className="relative transform transition-all duration-500" style={{ animationDelay: `${subIndex * 50}ms` }}>
                    <div className="absolute right-0 top-1/2 w-4 h-px bg-gradient-to-l from-[#1e293b]/40 to-transparent dark:from-gray-500/40"></div>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item relative pr-6 py-2 group block ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active bg-gradient-to-l from-[#1e293b]/10 to-transparent text-[#1e293b] dark:from-white/10 dark:text-white border-r-3 border-[#1e293b] dark:border-white shadow-md"
                          : "menu-dropdown-item-inactive hover:bg-gradient-to-l hover:from-[#1e293b]/5 hover:to-transparent hover:text-[#1e293b] dark:hover:from-white/5 dark:hover:text-white hover:border-r-3 hover:border-[#1e293b]/30 dark:hover:border-white/30 hover:shadow-sm"
                      } transition-all duration-500 ease-out rounded-l-xl border-r-3 border-transparent transform hover:translate-x-1`}
                    >
                      <span className="font-medium">{subItem.name}</span>
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active bg-green-500 text-white"
                                : "menu-dropdown-badge-inactive bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            } menu-dropdown-badge px-2 py-1 text-xs rounded-full font-semibold transition-all duration-300`}
                          >
                            جديد
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active bg-yellow-500 text-white"
                                : "menu-dropdown-badge-inactive bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                            } menu-dropdown-badge px-2 py-1 text-xs rounded-full font-semibold transition-all duration-300`}
                          >
                            احترافي
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-6 right-0 bg-white dark:bg-[#1e293b] border-l border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 h-screen transition-all duration-500 ease-in-out z-50 shadow-2xl backdrop-blur-sm
        ${isExpanded || isMobileOpen ? "w-[300px]" : isHovered ? "w-[300px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      dir="rtl"
    >
      {/* Logo Section */}
      <div
        className={`py-8 flex items-center transition-all duration-500 ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/" className="group">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1e293b] to-[#334155] dark:from-white dark:to-gray-100 rounded-xl flex items-center justify-center text-white dark:text-[#1e293b] font-bold shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500 transform hover:rotate-3">
                م
              </div>
              <h1 className="text-2xl font-bold text-[#1e293b] dark:text-white transition-all duration-500 transform group-hover:scale-105 bg-gradient-to-r from-[#1e293b] to-[#334155] bg-clip-text text-transparent dark:from-white dark:to-gray-300">
                Muta7Market
              </h1>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-[#1e293b] to-[#334155] dark:from-white dark:to-gray-100 rounded-xl flex items-center justify-center text-white dark:text-[#1e293b] font-bold shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500 transform hover:rotate-3">
              م
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Section */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-6">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-500 dark:text-gray-400 font-semibold tracking-wider ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  <span className="relative">
                    القائمة
                    <div className="absolute -bottom-1 right-0 w-full h-px bg-gray-300 dark:bg-gray-600"></div>
                  </span>
                ) : (
                  <HorizontaLDots className="text-[#1e293b] dark:text-gray-300" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-500 dark:text-gray-400 font-semibold tracking-wider ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
              </h2>
            </div>
          </div>
        </nav>
      </div>

      {/* Bottom Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700"></div>
    </aside>
  );
};

export default AppSidebar;