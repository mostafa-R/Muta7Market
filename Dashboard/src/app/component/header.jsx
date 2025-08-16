"use client";

import { Menu, Transition } from "@headlessui/react";
import axios from "axios";
import {
  FileText,
  LogOut,
  Menu as MenuIcon,
  Trophy,
  User,
  Users,
  X,
  Home,
  Search,
  UserCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { create } from "zustand";

// Zustand auth store
const useAuthStore = create((set) => ({
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
}));

// User Profile Dropdown - محسن للموبايل
const UserProfileDropdown = ({
  handleLogout,
  fullWidth = false,
  className = "",
  isMobile = false,
}) => {
  const { isLoggedIn, user } = useAuthStore();
  const router = useRouter();

  if (!isLoggedIn) {
    return (
      <button
        type="button"
        onClick={() => router.push("/signin")}
        className={`
          ${fullWidth ? "w-full justify-center" : ""}
          ${isMobile 
            ? "w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all"
            : "border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition"
          }
          flex items-center gap-2
          ${className}
        `}
        aria-label="تسجيل الدخول"
      >
        <User className="w-4 h-4" />
        تسجيل الدخول
      </button>
    );
  }

  const getProfileImageUrl = () => {
    if (!user?.profileImage) return null;
    if (typeof user.profileImage === 'object' && user.profileImage.url) {
      return user.profileImage.url;
    }
    if (typeof user.profileImage === 'string' && user.profileImage.trim() !== '') {
      return user.profileImage;
    }
    return null;
  };

  const profileImageUrl = getProfileImageUrl();

  // للموبايل - عرض مختلف
  if (isMobile) {
    return (
      <div className="w-full space-y-3">
        {/* User Info Card */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            {profileImageUrl ? (
              <Image
                src={profileImageUrl}
                alt={user?.name || "صورة المستخدم"}
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
              <p className="font-semibold text-gray-900">{user?.name || "المستخدم"}</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <Link
          href="/profile"
          className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
        >
          <UserCircle className="w-5 h-5 text-blue-600" />
          <span className="font-medium">الملف الشخصي</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors border border-red-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">تسجيل الخروج</span>
        </button>
      </div>
    );
  }

  // للديسكتوب - القائمة المنسدلة
  return (
    <Menu as="div" className="relative">
      <Menu.Button
        className="flex items-center justify-center rounded-full w-10 h-10 lg:w-11 lg:h-11 border-2 border-gray-200 hover:border-gray-300 transition-all hover:shadow-md"
        aria-label="فتح قائمة المستخدم"
      >
        {profileImageUrl ? (
          <Image
            src={profileImageUrl}
            alt={user?.name || "صورة المستخدم"}
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
                  } flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors`}
                >
                  <UserCircle className="w-4 h-4" />
                  الملف الشخصي
                </Link>
              )}
            </Menu.Item>

            <div className="border-t my-1"></div>

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleLogout}
                  className={`${
                    active ? "bg-red-50" : ""
                  } flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 transition-colors`}
                >
                  <LogOut className="w-4 h-4" />
                  تسجيل الخروج
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

// Mobile Nav Menu - محسن بالكامل
const MobileNavMenu = ({ navItems, onClose, currentPath }) => {
  const { isLoggedIn, setIsLoggedIn, user } = useAuthStore();
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      localStorage.clear();
      setIsLoggedIn(false);
      
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`,
        {},
        { withCredentials: true }
      ).catch(() => {});
      
      router.push("/signin");
      onClose();
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/signin");
    }
  }, [router, setIsLoggedIn, onClose]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  useEffect(() => {
    // منع السكرول عند فتح القائمة
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
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
              <span className="text-white font-bold text-lg">Muta7Market</span>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="إغلاق القائمة"
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
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={handleClose}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 font-semibold shadow-sm"
                        : "hover:bg-gray-50 text-gray-700"
                    }
                  `}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-blue-600" : "text-gray-500"
                    }`}
                  />
                  <span className="text-base">{item.name}</span>
                  {isActive && (
                    <div className="mr-auto w-1 h-6 bg-blue-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Section */}
          <div className="p-4 border-t bg-gray-50">
            <UserProfileDropdown handleLogout={handleLogout} isMobile={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Navbar Component
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { checkAuth, isLoggedIn, setIsLoggedIn, setUser } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // تأثير السكرول
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = useMemo(
    () => [
      { name: "الرئيسية", path: "/", icon: Home },
      { name: "استكشف", path: "/sports", icon: Search },
      { name: "اللاعبون", path: "/players", icon: Users },
      { name: "المدربون", path: "/coaches", icon: Users },
      ...(isLoggedIn
        ? [{ name: "تسجيل الملف", path: "/register-profile", icon: FileText }]
        : []),
    ],
    [isLoggedIn]
  );

  const handleLogout = useCallback(async () => {
    try {
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
    }
  }, [router, setIsLoggedIn, setUser]);

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
                Muta7Market
              </span>
            </Link>

            {/* Desktop Navigation - مخفي على الموبايل */}
            <div className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${
                        isActive
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Desktop User Controls - مخفي على الموبايل */}
            <div className="hidden lg:flex items-center gap-4">
              <UserProfileDropdown handleLogout={handleLogout} />
            </div>

            {/* Mobile Menu Button - يظهر فقط على الموبايل */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(true)}
              aria-label="فتح القائمة"
            >
              <MenuIcon className="h-6 w-6 text-gray-700" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <MobileNavMenu
          navItems={navItems}
          onClose={() => setIsOpen(false)}
          currentPath={pathname}
        />
      )}
    </>
  );
};

export default Navbar;
