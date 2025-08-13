// hooks/useAuth.js
import { clearAuthData, getCurrentUser, isSessionValid } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const useAuth = (requireAuth = false) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      setIsLoading(true);

      if (isSessionValid()) {
        const userData = getCurrentUser();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          if (requireAuth) {
            clearAuthData();
            router.push("/signin");
          }
        }
      } else {
        setIsAuthenticated(false);
        if (requireAuth) {
          clearAuthData();
          router.push("/signin");
        }
      }

      setIsLoading(false);
    };

    checkAuth();

    // التحقق من الجلسة كل دقيقة
    const interval = setInterval(checkAuth, 60000);

    return () => clearInterval(interval);
  }, [requireAuth, router]);

  const logout = () => {
    clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
    router.push("/signin");
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
  };
};
