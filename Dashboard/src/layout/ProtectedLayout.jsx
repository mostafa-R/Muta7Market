// src/layout/ProtectedLayout.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedLayout({ children, requiredRole }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [allowRender, setAllowRender] = useState(false);

  useEffect(() => {
  if (!isLoading) {
    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      router.replace(`/signin?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // تحقق أكثر صرامة من الصلاحيات
    if (requiredRole && !['admin', 'super_admin'].includes(user?.role)) {
      router.replace('/signin?error=admin_required');
      return;
    }

    setAllowRender(true);
  }
}, [isAuthenticated, isLoading, user, router, requiredRole]);

  // ⏳ شاشة تحميل وقت التوجيه أو التحقق
  if (!allowRender) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // 🎉 عرض المحتوى بعد التحقق
  return <>{children}</>;
}
