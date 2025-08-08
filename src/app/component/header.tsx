"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, Menu, Trophy, User, Users, X } from "lucide-react";
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

// مكون زر الملف الشخصي
const ProfileButton = ({
  className = "",
  fullWidth = false,
}: {
  className?: string;
  fullWidth?: boolean;
}) => {
  const { isLoggedIn, setIsLoggedIn } = useAuthStore();
  const router = useRouter();

  const handleLogout = useCallback(() => {
    localStorage.setItem("isLoggedIn", "false");
    setIsLoggedIn(false);
    router.push("/signin");
  }, [router, setIsLoggedIn]);

  return isLoggedIn ? (
    <button
      type="button"
      onClick={handleLogout}
      className={`border border-[hsl(var(--border))] rounded px-4 py-2 text-sm flex items-center hover:bg-[hsl(var(--primary)/0.08)] transition focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      aria-label="تسجيل الخروج"
    >
      <User className="w-4 h-4 ml-2" />
      تسجيل الخروج
    </button>
  ) : (
    <Link
      href="/signin"
      className={`border border-[hsl(var(--border))] rounded px-4 py-2 text-sm flex items-center hover:bg-[hsl(var(--primary)/0.08)] transition focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      aria-label="تسجيل الدخول"
    >
      <User className="w-4 h-4 ml-2" />
      تسجيل الدخول
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
              <ProfileButton fullWidth />
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
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth(); // التحقق من حالة تسجيل الدخول عند تحميل المكون
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

  // تحميل مسبق للروابط
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
            <ProfileButton />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="p-2 rounded hover:bg-[hsl(var(--primary)/0.05)]"
              onClick={() => setIsOpen(true)}
              aria-label="فتح القائمة"
            >
              <Menu className="h-6 w-6" />
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
