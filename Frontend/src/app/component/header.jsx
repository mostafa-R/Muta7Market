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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { create } from "zustand";

// Zustand auth store (JS)
const useAuthStore = create((set) => ({
  isLoggedIn: false,
  setIsLoggedIn: (value) => set({ isLoggedIn: value }),
  checkAuth: () => {
    const isLoggedIn =
      typeof window !== "undefined" &&
      localStorage.getItem("isLoggedIn") === "true";
    set({ isLoggedIn });
  },
}));

// User Profile Dropdown (JSX)
const UserProfileDropdown = ({
  profileImage,
  handleLogout,
  fullWidth = false,
  className = "",
}) => {
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();
  const [user, setUser] = useState({});


  
  // const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/profile`;
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setUser(JSON.parse(localStorage.getItem("user")));
      } catch (error) {
        console.error(error);
      }
    };
    if (isLoggedIn) fetchUser();
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <button
        type="button"
        onClick={() => router.push("/signin")}
        className={`border border-[hsl(var(--border))] rounded px-4 py-2 text-sm flex items-center hover:bg-[hsl(var(--primary)/0.08)] transition focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] ${
          fullWidth ? "w-full" : ""
        } ${className}`}
        aria-label="تسجيل الدخول"
      >
        <User className="w-4 h-4 ml-2" />
        تسجيل الدخول
      </button>
    );
  }

  

  return (
    <Menu as="div" className="relative inline-block text-center bg-primary">
   

<Menu.Button
  className={`flex items-center justify-center rounded-full w-12 h-12 border border-[hsl(var(--muted))] hover:border-[hsl(var(--border))] transition-colors duration-200 ${
    fullWidth ? "w-full" : ""
  } ${className}`}
  aria-label="فتح قائمة المستخدم"
>
  {user?.profileImage && user.profileImage.trim() !== "" ? (
    <Image
      src={user.profileImage}
      alt="صورة المستخدم"
      width={48}
      height={48}
      className="w-12 h-12 rounded-full object-cover"
      unoptimized
    />
  ) : (
    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
      <User className="w-6 h-6 text-gray-500" />
    </div>
  )}
</Menu.Button>


      <Transition
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 mt-2 w-45 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-muted ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/profile"
                  className={`${
                    active ? "bg-[hsl(var(--primary)/0.1)]" : ""
                  } flex items-center px-4 py-2 text-sm text-gray-700`}
                >
                  <User className="w-4 h-4 ml-2" />
                  الملف الشخصي
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`${
                    active ? "bg-[hsl(var(--primary)/0.1)]" : ""
                  } flex items-center w-full px-4 py-2 text-sm text-gray-700 text-right`}
                >
                  <LogOut className="w-4 h-4 ml-2" />
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

// Single nav item
const NavItem = ({ item, isActive }) => {
  const Icon = item.icon;
  return (
    <Link
      href={item.path}
      className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md text-sm font-medium transition 
      ${
        isActive
          ? "text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)]"
          : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.05)]"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="w-4 h-4 mr-2 ml-2" />
      <span>{item.name}</span>
    </Link>
  );
};

// Mobile nav menu (no framer-motion)
const MobileNavMenu = ({ navItems, onClose, currentPath }) => {
  const { isLoggedIn, setIsLoggedIn } = useAuthStore();
  const router = useRouter();
  const [user, setUser] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
       
        setUser(JSON.parse(localStorage.getItem("user")));
      } catch (error) {
        console.error(error);
      }
    };
    if (isLoggedIn) fetchUser();
  }, [isLoggedIn]);

  const handleLogout = useCallback(async () => {
    localStorage.setItem("isLoggedIn", "false");
    setIsLoggedIn(false);
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
      { withCredentials: true }
    );
    router.push("/signin");
  }, [router, setIsLoggedIn]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0  z-50 flex justify-end">
      <div className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] w-72 h-full p-6 flex flex-col space-y-4 shadow-card relative">
        <button
          type="button"
          className="absolute top-4 left-4"
          onClick={onClose}
          aria-label="إغلاق القائمة"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="mt-8 flex flex-col space-y-4 text-[hsl(var(--muted-foreground))] bg-[#ffffff]">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={`flex items-center  space-x-3 px-4 py-3 rounded-lg transition
                ${
                  isActive
                    ? "text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)]"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.05)]"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
          <div className="pt-4 border-t border-[hsl(var(--border))]">
            <UserProfileDropdown
              profileImage={isLoggedIn ? user.profileImage : undefined}
              handleLogout={handleLogout}
              fullWidth
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Navbar
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { checkAuth, isLoggedIn, setIsLoggedIn } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const navItems = useMemo(
    () => [
      { name: "الرئيسية", path: "/", icon: Trophy },
      { name: "استكشف", path: "/sports", icon: Users },
      { name: "اللاعبون", path: "/players", icon: Users },
      { name: "المدربون", path: "/coaches", icon: Users },
      ...(!isLoggedIn
        ? []
        : [{ name: "تسجيل الملف", path: "/register-profile", icon: FileText }]),
    ],
    [isLoggedIn]
  );

  const handleLogout = useCallback(async () => {
    try {
      localStorage.setItem("isLoggedIn", "false");
      const token = localStorage.getItem("token");
      setIsLoggedIn(false);

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`,
        {}, // مفيش بيانات في البودي
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      localStorage.clear();

      router.push("/signin");
    } catch (err) {
      console.error("Logout error:", err.response?.data || err.message);
    }
  }, [router, setIsLoggedIn]);

  useEffect(() => {
    navItems.forEach((item) => {
      router.prefetch(item.path);
    });
  }, [navItems, router]);

  const handleClose = useCallback(() => setIsOpen(false), []);

  return (
    <nav className="bg-[hsl(var(--card)/0.8)] text-[hsl(var(--card-foreground))] backdrop-blur-lg border-b border-[hsl(var(--border))] sticky top-0 z-50 transition-smooth">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="flex items-center space-x-2 space-x-reverse"
          >
            <div className="w-10 h-10 bg-[hsl(var(--primary))] rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-[hsl(var(--primary-foreground))]" />
            </div>
            <span className="text-xl font-bold mx-2">Muta7Market</span>
          </Link>

          {/* Desktop Navigation */}
          {/* <div className="hidden md:flex items-center space-x-8 space-x-reverse">
            {navItems.map((item) => (
              <NavItem
                key={item.path}
                item={item}
                isActive={pathname === item.path}
              />
            ))}
          </div> */}

          <div className="hidden md:flex items-center space-x-8 ">
            {navItems.map((item) => (
              <NavItem
                key={item.path}
                item={item}
                isActive={pathname === item.path}
                hidden={item.name === "تسجيل الملف" && isLoggedIn}
              />
            ))}
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            <UserProfileDropdown
              profileImage={
                isLoggedIn ? "https://example.com/user.jpg" : undefined
              }
              handleLogout={handleLogout}
            />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="p-2 rounded hover:bg-[hsl(var(--primary)/0.05)]"
              onClick={() => setIsOpen(true)}
              aria-label="فتح القائمة"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isOpen && (
        <MobileNavMenu
          navItems={navItems}
          onClose={handleClose}
          currentPath={pathname}
        />
      )}
    </nav>
  );
};

export default Navbar;
