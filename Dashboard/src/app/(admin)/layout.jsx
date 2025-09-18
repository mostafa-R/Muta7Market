"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar.jsx";
import Backdrop from "@/layout/Backdrop";
import ProtectedLayout from "@/layout/ProtectedLayout";

export default function AdminLayout({ children }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state (RTL)
  const mainContentMargin = isMobileOpen
    ? "mr-0"
    : isExpanded || isHovered
    ? "lg:mr-[300px]"
    : "lg:mr-[90px]";

  return (
    <ProtectedLayout requiredRole="admin">
      <div className="min-h-screen xl:flex" dir="rtl">
        {/* Sidebar and Backdrop */}
        <AppSidebar />
        <Backdrop />
        {/* Main Content Area */}
        <div
          className={`flex-1 transition-all duration-500 ease-in-out ${mainContentMargin} min-w-0`}
        >
          {/* Header */}
          <AppHeader />
          {/* Page Content */}
          <div className="p-4 mx-auto w-full md:p-6">
            <div className="w-full overflow-hidden">
              {children}
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}