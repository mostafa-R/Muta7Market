"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Menu, Transition } from "@headlessui/react";
import axios from "axios";
import {
  FileText,
  Home,
  Loader2,
  LogOut,
  Menu as MenuIcon,
  Search,
  Trophy,
  User,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { create } from "zustand";
import LanguageSwitcher from "./LanguageSwitcher";

// Zustand auth store
const useAuthStore = create((set, get) => ({
  isLoggedIn: false,
  user: null,
  setIsLoggedIn: (value) => set({ isLoggedIn: value }),
  setUser: (user) => set({ user }),
  checkAuth: () => {
    const isLoggedIn =
      typeof window !== "undefined" &&
      localStorage.getItem("isLoggedIn") === "true";
    const user =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "null")
        : null;
    set({ isLoggedIn, user });
  },
  // Add listener for profile updates
  initListener: () => {
    if (typeof window !== "undefined") {
      // Listen for profile updates
      const handleUserUpdate = (event) => {
        if (event.detail?.user) {
          set({ user: event.detail.user });
        } else {
          // Fallback: reload from localStorage
          get().checkAuth();
        }
      };

      // Listen for storage changes (updates from other tabs)
      const handleStorageChange = (event) => {
        if (event.key === "user" || event.key === "isLoggedIn") {
          get().checkAuth();
        }
      };

      window.addEventListener("userProfileUpdated", handleUserUpdate);
      window.addEventListener("storage", handleStorageChange);

      // Return cleanup function
      return () => {
        window.removeEventListener("userProfileUpdated", handleUserUpdate);
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  },
}));

// Navigation store for loading states and header visibility
const useNavigationStore = create((set) => ({
  isLoading: false,
  currentPath: "",
  progress: 0,
  isHeaderVisible: true,
  setLoading: (loading) =>
    set({ isLoading: loading, progress: loading ? 0 : 100 }),
  setCurrentPath: (path) => set({ currentPath: path }),
  setProgress: (progress) => set({ progress }),
  setHeaderVisible: (visible) => set({ isHeaderVisible: visible }),
}));

// Progress Bar Component
const ProgressBar = () => {
  const { isLoading, progress } = useNavigationStore();

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[70] h-1 bg-gray-200">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

const UserProfileDropdown = ({
  handleLogout,
  fullWidth = false,
  className = "",
  isMobile = false,
}) => {
  const { t } = useTranslation();
  const { isLoggedIn, user } = useAuthStore();
  const { isLoading } = useNavigationStore();
  const router = useRouter();

  if (!isLoggedIn) {
    return (
      <button
        type="button"
        onClick={() => router.push("/signin")}
        disabled={isLoading}
        className={`
          ${fullWidth ? "w-full justify-center" : ""}
          ${
            isMobile
              ? "w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              : "border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          }
          flex items-center gap-2
          ${className}
        `}
        aria-label={t("navbar.signin")}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <User className="w-4 h-4" />
        )}
        {isLoading ? t("common.loading") : t("navbar.signin")}
      </button>
    );
  }

  const getProfileImageUrl = () => {
    if (!user?.profileImage) return null;
    if (typeof user.profileImage === "object" && user.profileImage.url) {
      return user.profileImage.url;
    }
    if (
      typeof user.profileImage === "string" &&
      user.profileImage.trim() !== ""
    ) {
      return user.profileImage;
    }
    return null;
  };

  const profileImageUrl = getProfileImageUrl();

  if (isMobile) {
    return (
      <div className="w-full space-y-3">
        {/* User Info Card */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            {profileImageUrl ? (
              <Image
                src={profileImageUrl}
                alt={user?.name || t("user.profileImage")}
                width={60}
                height={60}
                className="rounded-full border-2 border-white shadow-md"
                unoptimized
              />
            ) : (
              <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center shadow-md">
                <User className="w-8 h-8 text-white" />
              </div>
            )}
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {user?.name || t("user.defaultName")}
              </p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <Link
          href="/profile"
          className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 hover:shadow-md"
        >
          <UserCircle className="w-5 h-5 text-blue-600" />
          <span className="font-medium">{t("user.profile")}</span>
        </Link>

        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
          <span className="font-medium">
            {isLoading ? t("common.loading") : t("user.signout")}
          </span>
        </button>
      </div>
    );
  }

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        className="flex items-center justify-center rounded-full w-10 h-10 lg:w-11 lg:h-11 border-2 border-gray-200 hover:border-gray-300 transition-all hover:shadow-md"
        aria-label={t("user.openMenu")}
        disabled={isLoading}
      >
        {profileImageUrl ? (
          <Image
            src={profileImageUrl}
            alt={user?.name || t("user.profileImage")}
            width={44}
            height={44}
            className="w-full h-full rounded-full object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-left rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
          {/* User Info */}
          {user && (
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-600 truncate mt-0.5">
                {user.email}
              </p>
            </div>
          )}

          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/profile"
                  className={`${
                    active ? "bg-gray-100" : ""
                  } flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:shadow-sm`}
                >
                  <UserCircle className="w-4 h-4" />
                  {t("user.profile")}
                </Link>
              )}
            </Menu.Item>

            <div className="border-t my-1"></div>

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className={`${
                    active ? "bg-red-50" : ""
                  } flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  {isLoading ? t("common.loading") : t("user.signout")}
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

// Global Loading Overlay Component
const LoadingOverlay = () => {
  const { isLoading } = useNavigationStore();
  const { t } = useTranslation();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-white/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <p className="text-gray-700 font-medium">{t("common.loading")}</p>
        <p className="text-sm text-gray-500">{t("common.pleaseWait")}</p>
      </div>
    </div>
  );
};

// Navigation Link Component with loading state
const NavLink = ({ item, isActive, onClick, isMobile = false }) => {
  const { isLoading, currentPath } = useNavigationStore();
  const isCurrentLoading = isLoading && currentPath === item.path;
  const Icon = item.icon;

  const baseClasses = `
    flex items-center gap-3 transition-all duration-200
    ${
      isMobile
        ? "px-4 py-3 rounded-xl"
        : "px-4 py-2 rounded-lg text-sm font-medium"
    }
  `;

  const activeClasses = isActive
    ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 font-semibold shadow-sm"
    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50";

  const loadingClasses = isCurrentLoading ? "opacity-75 cursor-wait" : "";

  return (
    <Link
      href={item.path}
      onClick={onClick}
      className={`${baseClasses} ${activeClasses} ${loadingClasses}`}
      aria-disabled={isCurrentLoading}
    >
      {isCurrentLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Icon
          className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-500"}`}
        />
      )}
      <span className="text-base">{item.name}</span>
      {isActive && !isCurrentLoading && (
        <div className="mr-auto w-1 h-6 bg-blue-600 rounded-full" />
      )}
      {isCurrentLoading && (
        <div className="mr-auto w-1 h-6 bg-blue-400 rounded-full animate-pulse" />
      )}
    </Link>
  );
};

const MobileNavMenu = ({ navItems, onClose, currentPath }) => {
  const { t } = useTranslation();
  const { isLoggedIn, setIsLoggedIn, user } = useAuthStore();
  const { setLoading, setCurrentPath, setProgress, setHeaderVisible } =
    useNavigationStore();
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      setLoading(true);
      localStorage.clear();
      setIsLoggedIn(false);

      await axios
        .post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`,
          {},
          { withCredentials: true }
        )
        .catch(() => {});

      router.push("/signin");
      onClose();
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/signin");
    } finally {
      setLoading(false);
    }
  }, [router, setIsLoggedIn, onClose, setLoading]);

  const handleNavigation = useCallback(
    (path) => {
      if (path === currentPath) return;

      setLoading(true);
      setCurrentPath(path);
      setHeaderVisible(false);
      onClose();

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      setTimeout(() => {
        clearInterval(progressInterval);
        setProgress(100);
        setTimeout(() => {
          setLoading(false);
          setCurrentPath("");
        }, 200);
      }, 800);
    },
    [
      setLoading,
      setCurrentPath,
      currentPath,
      onClose,
      setProgress,
      setHeaderVisible,
    ]
  );

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-50"
        }`}
        onClick={handleClose}
      />

      {/* Sidebar */}
      <div
        className={`
        fixed right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl
        transform transition-transform duration-300 ease-out
        ${isClosing ? "translate-x-full" : "translate-x-0"}
      `}
      >
        {/* Header */}
        <div className="bg-[hsl(var(--primary))] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-bold text-lg">
                {t("brand.name")}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label={t("common.closeMenu")}
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-80px)] overflow-y-auto">
          {/* Navigation Items */}
          <div className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;

              return (
                <NavLink
                  key={item.path}
                  item={item}
                  isActive={isActive}
                  onClick={() => handleNavigation(item.path)}
                  isMobile={true}
                />
              );
            })}
          </div>

          {/* User Section */}
          <div className="p-4 border-t bg-gray-50">
            <div className="mb-4">
              <LanguageSwitcher isMobile={true} />
            </div>
            <UserProfileDropdown handleLogout={handleLogout} isMobile={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Navbar Component
const Navbar = () => {
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { checkAuth, isLoggedIn, setIsLoggedIn, setUser, initListener } =
    useAuthStore();
  const {
    setLoading,
    setCurrentPath,
    setProgress,
    isHeaderVisible,
    setHeaderVisible,
  } = useNavigationStore();

  useEffect(() => {
    checkAuth();

    // Initialize listener for profile updates
    const cleanup = initListener();

    return cleanup; // Cleanup listeners when component unmounts
  }, [checkAuth, initListener]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setHeaderVisible(true);
      }
    };

    let startY = 0;
    let currentY = 0;

    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (window.innerWidth >= 1024) return;

      currentY = e.touches[0].clientY;
      const deltaY = startY - currentY;

      if (deltaY < -50 && window.scrollY < 100) {
        setHeaderVisible(true);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [setHeaderVisible]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);

      if (window.innerWidth < 1024) {
        if (window.scrollY < 50) {
          setHeaderVisible(true);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setHeaderVisible]);

  const navItems = useMemo(
    () => [
      { name: t("navbar.home"), path: "/", icon: Home },
      { name: t("navbar.explore"), path: "/sports", icon: Search },
      { name: t("navbar.players"), path: "/players", icon: Users },
      { name: t("navbar.coaches"), path: "/coaches", icon: Users },
      ...(isLoggedIn
        ? [
            {
              name: t("navbar.registerProfile"),
              path: "/register-profile",
              icon: FileText,
            },
          ]
        : []),
    ],
    [isLoggedIn, t]
  );

  const handleLogout = useCallback(async () => {
    try {
      setLoading(true);
      localStorage.clear();
      setIsLoggedIn(false);
      setUser(null);

      await axios
        .post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`,
          {},
          { withCredentials: true }
        )
        .catch(() => {});

      router.push("/signin");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/signin");
    } finally {
      setLoading(false);
    }
  }, [router, setIsLoggedIn, setUser, setLoading]);

  const handleNavigation = useCallback(
    (path) => {
      if (path === pathname) return;

      setLoading(true);
      setCurrentPath(path);

      if (window.innerWidth < 1024) {
        setHeaderVisible(false);
      }

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      setTimeout(() => {
        clearInterval(progressInterval);
        setProgress(100);
        setTimeout(() => {
          setLoading(false);
          setCurrentPath("");
        }, 200);
      }, 800);
    },
    [setLoading, setCurrentPath, pathname, setProgress, setHeaderVisible]
  );

  return (
    <>
      <nav
        className={`
        sticky top-0 z-40 bg-white backdrop-blur-lg transition-all duration-300
        ${
          scrolled
            ? "shadow-md border-b border-gray-200"
            : "border-b border-gray-100"
        }
        ${!isHeaderVisible ? "transform -translate-y-full" : ""}
      `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-[hsl(var(--primary))] rounded-lg flex items-center justify-center group-hover:shadow-lg transition-all">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-[hsl(var(--primary))] bg-clip-text text-transparent">
                {t("brand.name")}
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.path;

                return (
                  <NavLink
                    key={item.path}
                    item={item}
                    isActive={isActive}
                    onClick={() => handleNavigation(item.path)}
                  />
                );
              })}
            </div>

            <div className="hidden lg:flex items-center gap-4">
              <LanguageSwitcher />
              <UserProfileDropdown handleLogout={handleLogout} />
            </div>

            <button
              type="button"
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(true)}
              aria-label={t("common.openMenu")}
            >
              <MenuIcon className="h-6 w-6 text-gray-700" />
            </button>
          </div>
        </div>
      </nav>

      {isOpen && (
        <MobileNavMenu
          navItems={navItems}
          onClose={() => setIsOpen(false)}
          currentPath={pathname}
        />
      )}

      <LoadingOverlay />
      <ProgressBar />
    </>
  );
};

export default Navbar;
