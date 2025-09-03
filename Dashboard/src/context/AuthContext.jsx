"use client";
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const isAuthenticated = !!user;

  const isAdmin = () => {
    return user?.role === 'admin' || user?.role === 'super_admin';
  };
        
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const userData = localStorage.getItem('userData');

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

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
    try {
      if (remember) {
        localStorage.setItem('accessToken', token);
      } else {
        sessionStorage.setItem('accessToken', token);
      }
      
      localStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      
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
    

    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  };

  const checkAuth = () => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const hasAuth = !!token && !!user;
    console.log('CheckAuth result:', hasAuth, { token: !!token, user: !!user });
    return hasAuth;
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
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


export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}