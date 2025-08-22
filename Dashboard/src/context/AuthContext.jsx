// context/AuthContext.jsx
"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // دالة جديدة للتحقق من صلاحية الأدمن
  const isAdmin = () => {
    return user?.role === 'admin' || user?.role === 'super_admin';
  };

  // فحص الـ authentication عند بدء التطبيق
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      // فحص الـ token من localStorage و sessionStorage
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const userData = localStorage.getItem('userData');

      console.log('Checking auth status:', { token: !!token, userData: !!userData });

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log('User authenticated:', parsedUser);
        
        // إضافة الـ token للكوكيز إذا لم يكن موجود
        if (!document.cookie.includes('accessToken=')) {
          document.cookie = `accessToken=${token}; path=/; SameSite=Strict`;
        }
      } else {
        console.log('No valid auth data found');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData, token, remember = false) => {
    console.log('Login called:', { userData, token: !!token, remember });
    
    try {
      // حفظ البيانات
      if (remember) {
        localStorage.setItem('accessToken', token);
      } else {
        sessionStorage.setItem('accessToken', token);
      }
      
      localStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      
      // إضافة الـ token للكوكيز للـ middleware
      const maxAge = remember ? 'max-age=2592000;' : '';
      document.cookie = `accessToken=${token}; path=/; ${maxAge} SameSite=Strict`;
      
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const logout = () => {
    console.log('Logout called');
    clearAuthData();
    setUser(null);
    router.push('/signin');
  };

  const clearAuthData = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('accessToken');
    
    // مسح الكوكيز
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  };

  const checkAuth = () => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const hasAuth = !!token && !!user;
    console.log('CheckAuth result:', hasAuth, { token: !!token, user: !!user });
    return hasAuth;
  };

  // قيمة الكون텍ست مع إضافة دالة isAdmin
  const value = {
    user,
    isLoading,
    isAuthenticated,
    isAdmin, // <-- الدالة المضافة
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook لاستخدام الـ AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}