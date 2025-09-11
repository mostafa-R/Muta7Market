"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSidebar } from "../context/SidebarContext.jsx";
import {
    AdIcon,
    ChevronDownIcon,
    DocumentIcon,
    GameIcon,
    GlobeIcon,
    GridIcon,
    HorizontaLDots,
    PageIcon,
    PlugInIcon,
    SettingsIcon,
    TagIcon,
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
    icon: <UserCircleIcon />,
    subItems: [
      { name: "جدول المستخدمين", path: "/user/table", pro: false },
      { name: "إضافة مستخدم جديد", path: "/user/add", pro: false },
    ],
  },
  {
    name: "اللاعبون",
    icon: <UserCircleIcon />,
    subItems: [{ name: "جدول اللاعبين", path: "/players/table", pro: false },
      { name: "إضافة لاعب جديد", path: "/players/create-with-player", pro: false },
    ],
  },
  {
    name: "المدربون",
    icon: <UserCircleIcon />,
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
    name: "الشروط والسياسات",
    icon: <DocumentIcon />,
    path: "/legal",
  },
  {
    name: "العروض الترويجية",
    icon: <TagIcon />,
    path: "/promotions",
  },
  {
    name: "الإعلانات",
    icon: <AdIcon />,
    path: "/advertisements",
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
              className={`menu-item group relative rounded-lg p-3 flex items-center gap-3 w-full text-right ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active bg-[#1e293b] text-white shadow-sm dark:bg-[#1e293b]"
                  : "menu-item-inactive hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              } transition-all duration-300 ${
                !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
              }`}
            >
              <span
                className={`${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active text-white"
                    : "menu-item-icon-inactive text-gray-600 dark:text-gray-400 group-hover:text-[#1e293b] dark:group-hover:text-gray-200"
                } transition-all duration-300`}
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
                className={`menu-item group relative rounded-lg p-3 flex items-center gap-3 text-right ${
                  isActive(nav.path)
                    ? "menu-item-active bg-[#1e293b] text-white shadow-sm dark:bg-[#1e293b]"
                    : "menu-item-inactive hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                } transition-all duration-300`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active text-white"
                      : "menu-item-icon-inactive text-gray-600 dark:text-gray-400 group-hover:text-[#1e293b] dark:group-hover:text-gray-200"
                  } transition-all duration-300`}
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
              className="overflow-hidden transition-all duration-500 ease-out"
              style={{
                height:
                  openSubmenu?.type === menuType &&
                  openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-3 space-y-1 mr-9 relative" dir="rtl">
                <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"></div>
                {nav.subItems.map((subItem, subIndex) => (
                  <li key={subItem.name} className="relative">
                    <div className="absolute right-0 top-1/2 w-3 h-px bg-gray-300 dark:bg-gray-600"></div>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item relative pr-4 group ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active bg-gray-100 text-[#1e293b] dark:bg-gray-700 dark:text-white border-r-2 border-[#1e293b] dark:border-gray-300"
                          : "menu-dropdown-item-inactive hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#1e293b] dark:hover:text-white hover:border-r-2 hover:border-gray-300 dark:hover:border-gray-400"
                      } transition-all duration-300 rounded-l-lg border-r-2 border-transparent`}
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
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-6 left-0 bg-white dark:bg-[#1e293b] border-r border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 h-screen transition-all duration-300 ease-in-out z-50 shadow-sm
        ${isExpanded || isMobileOpen ? "w-[300px]" : isHovered ? "w-[300px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      dir="rtl"
    >
      {/* Logo Section */}
      <div
        className={`py-8 flex items-center ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/" className="group">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#1e293b] dark:bg:white rounded-lg flex items-center justify-center text-white dark:text-[#1e293b] font-bold shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                م
              </div>
              <h1 className="text-2xl font-bold text-[#1e293b] dark:text-white">
                Muta7Market
              </h1>
            </div>
          ) : (
            <div className="w-8 h-8 bg-[#1e293b] dark:bg:white rounded-lg flex items-center justify-center text-white dark:text-[#1e293b] font-bold shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
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