"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User, Trophy, Users, FileText, Search, X } from "lucide-react";

// شعار المنصة
const NavLogo = () => (
  <Link href="/" className="flex items-center space-x-2 space-x-reverse">
    <div className="w-10 h-10 bg-[hsl(var(--primary))] rounded-lg flex items-center justify-center">
      <Trophy className="w-6 h-6 text-[hsl(var(--primary-foreground))]" />
    </div>
    <span className="text-xl font-bold mx-2">Muta7market</span>
  </Link>
);

// عنصر في القائمة
type NavItemType = {
  name: string;
  path: string;
  icon: React.ElementType;
};

const NavItem = ({
  item,
  isActive,
}: {
  item: NavItemType;
  isActive: boolean;
}) => {
  const Icon = item.icon;
  return (
    <Link
      href={item.path}
      className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md text-sm font-medium transition
      ${isActive
        ? "text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)]"
        : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.05)]"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{item.name}</span>
    </Link>
  );
};

const ProfileButton = ({
  className = "",
  fullWidth = false,
}: {
  className?: string;
  fullWidth?: boolean;
}) => (
  <button
    type="button"
    className={
      "border border-[hsl(var(--border))] rounded px-4 py-2 text-sm flex items-center hover:bg-[hsl(var(--primary)/0.08)] transition " +
      (fullWidth ? "w-full " : "") +
      className
    }
  >
    <User className="w-4 h-4 ml-2" />
    تسجيل الدخول
  </button>
);

const MobileNavMenu = ({
  navItems,
  onClose,
  currentPath,
}: {
  navItems: NavItemType[];
  onClose: () => void;
  currentPath: string;
}) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
    <div className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] w-72 h-full p-6 flex flex-col space-y-4 shadow-card relative">
      <button
        type="button"
        className="absolute top-4 left-4"
        onClick={onClose}
        aria-label="Close menu"
      >
        <X className="w-6 h-6" />
      </button>
      <div className="mt-8 flex flex-col space-y-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onClose}
              className={`flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition
              ${isActive
                ? "text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)]"
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.05)]"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
        <div className="pt-4 border-t border-[hsl(var(--border))]">
          <ProfileButton fullWidth />
        </div>
      </div>
    </div>
  </div>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems: NavItemType[] = [
    { name: "الرئيسية", path: "/", icon: Trophy },
    { name: "استكشاف الألعاب", path: "/sports", icon: Search },
    { name: "اللاعبين", path: "/players", icon: Users },
    { name: "المدربين", path: "/coaches", icon: Users },
    { name: "سجل بياناتك", path: "/register-profile", icon: FileText },
  ];

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

          {/* Profile Button (Desktop) */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            <ProfileButton />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="p-2 rounded hover:bg-[hsl(var(--primary)/0.05)]"
              onClick={() => setIsOpen(true)}
              aria-label="Open menu"
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
          onClose={() => setIsOpen(false)}
          currentPath={pathname}
        />
      )}
    </nav>
  );
};

export default Navbar;
