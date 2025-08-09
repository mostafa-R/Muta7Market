"use client";

import { Menu, Transition } from "@headlessui/react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  FileText,
  LogOut,
  Menu as MenuIcon,
  Trophy,
  User,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { create } from "zustand";

// إدارة حالة تسجيل الدخول باستخدام Zustand
interface AuthState {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  checkAuth: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  setIsLoggedIn: (value) => set({ isLoggedIn: value }),
  checkAuth: () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    set({ isLoggedIn });
  },
}));

// واجهة لعناصر القائمة
interface NavItemType {
  name: string;
  path: string;
  icon: React.ElementType;
}

// واجهة لمكون القائمة المنسدلة
interface UserProfileDropdownProps {
  profileImage?: string;
  handleLogout: () => void;
  fullWidth?: boolean;
  className?: string;
}

interface User {
  profileImage?: string;
  name?: string;
  email?: string;
}

// مكون القائمة المنسدلة للمستخدم
const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({
  profileImage,
  handleLogout,
  fullWidth = false,
  className = "",
}) => {
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/profile`;
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(API_URL, {
          withCredentials: true,
        });
        setUser(response.data.data.user);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUser();
  }, []);

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
    <Menu as="div" className="relative inline-block text-center">
      <Menu.Button
        className={`flex items-center justify-center rounded-full w-12 h-12 border border-[hsl(var(--muted))] hover:border-[hsl(var(--border))] transition-colors duration-200 ${
          fullWidth ? "w-full" : ""
        } ${className}`}
        aria-label="فتح قائمة المستخدم"
      >
        {user?.profileImage ? (
          <img
            src={user.profileImage}
            alt="صورة المستخدم"
            className="w-12 h-12 rounded-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.src = "/images/default-avatar.png";
              e.target.alt = "صورة افتراضية";
            }}
          />
        ) : (
          <User className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
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

// مكون شعار المنصة
const NavLogo = () => {
  return (
    <Link href="/" className="flex items-center space-x-2 space-x-reverse">
      <div className="w-10 h-10 bg-[hsl(var(--primary))] rounded-lg flex items-center justify-center">
        <Trophy className="w-6 h-6 text-[hsl(var(--primary-foreground))]" />
      </div>
      <span className="text-xl font-bold mx-2">Muta7Market</span>
    </Link>
  );
};

// مكون عنصر القائمة
const NavItem = ({
  item,
  isActive,
}: {
  item: NavItemType;
  isActive: boolean;
}) => {
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
      <item.icon className="w-4 h-4 mr-2 ml-2" />
      <span>{item.name}</span>
    </Link>
  );
};

// مكون قائمة الهاتف المحمول
const MobileNavMenu = ({
  navItems,
  onClose,
  currentPath,
}: {
  navItems: NavItemType[];
  onClose: () => void;
  currentPath: string;
}) => {
  const { isLoggedIn, setIsLoggedIn } = useAuthStore();
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    localStorage.setItem("isLoggedIn", "false");
    setIsLoggedIn(false);
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`,
      {},
      {
        withCredentials: true,
      }
    );
    router.push("/signin");
  }, [router, setIsLoggedIn]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/50 z-50 flex justify-end"
      >
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] w-72 h-full p-6 flex flex-col space-y-4 shadow-card relative"
        >
          <button
            type="button"
            className="absolute top-4 left-4"
            onClick={onClose}
            aria-label="إغلاق القائمة"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="mt-8 flex flex-col space-y-4">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={onClose}
                  className={`flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition
                  ${
                    isActive
                      ? "text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)]"
                      : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.05)]"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
            <div className="pt-4 border-t border-[hsl(var(--border))]">
              <UserProfileDropdown
                userImage={isLoggedIn ? user.profileImage : undefined}
                handleLogout={handleLogout}
                fullWidth
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// مكون الـ Navbar الرئيسي
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { checkAuth, isLoggedIn, setIsLoggedIn } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const navItems = useMemo<NavItemType[]>(
    () => [
      { name: "الرئيسية", path: "/", icon: Trophy },
      { name: "استكشف", path: "/sports", icon: Users },
      { name: "اللاعبون", path: "/players", icon: Users },
      { name: "المدربون", path: "/coaches", icon: Users },
      { name: "تسجيل الملف", path: "/register-profile", icon: FileText },
    ],
    []
  );

  const handleLogout = useCallback(async () => {
    localStorage.setItem("isLoggedIn", "false");
    setIsLoggedIn(false);
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`,
      {},
      {
        withCredentials: true,
      }
    );
    router.push("/signin");
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
          <NavLogo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 space-x-reverse">
            {navItems.map((item) => (
              <NavItem
                key={item.path}
                item={item}
                isActive={pathname === item.path}
              />
            ))}
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            <UserProfileDropdown
              userImage={
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
