"use client";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import { useEffect, useRef, useState } from "react";

export default function AppHeader() {
  const { user, logout } = useAuth();
  const { isExpanded, toggleSidebar, isMobileOpen, toggleMobile } = useSidebar();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:bg-[#1e293b]/95 dark:border-gray-700 transition-all duration-300">
      <div className="relative flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Left Side - Logo and Menu Controls */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobile}
            className="lg:hidden relative group p-2 rounded-lg text-gray-500 hover:text-[#1e293b] dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1e293b]/20 transition-all duration-300"
          >
            <span className="sr-only">Open sidebar</span>
            <svg
              className="h-6 w-6 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>

          {/* Desktop Sidebar Toggle */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:block relative group p-2 rounded-lg text-gray-500 hover:text-[#1e293b] dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1e293b]/20 transition-all duration-300"
          >
            <span className="sr-only">Toggle sidebar</span>
            <svg
              className="h-5 w-5 transition-all duration-300"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              {isExpanded ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              )}
            </svg>
          </button>

          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#1e293b] rounded-lg flex items-center justify-center text-white font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
              M
            </div>
            <h1 className="text-xl font-bold text-[#1e293b] dark:text-white">
              Muta7Market
            </h1>
          </div>
        </div>

        {/* Right Side - User Menu */}
        <div className="flex items-center">

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="group flex items-center space-x-3 max-w-xs text-sm rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1e293b]/20 transition-all duration-300 p-2 border border-gray-200 dark:border-gray-600 hover:border-[#1e293b]/30 dark:hover:border-gray-500 shadow-sm hover:shadow-md"
            >
              <span className="sr-only">Open user menu</span>
              <div className="relative">
                <div className="h-8 w-8 rounded-lg bg-[#1e293b] flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                  <span className="text-sm font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                {/* Online Status Indicator */}
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full shadow-sm"></div>
              </div>
              
              {/* User Info (hidden on small screens) */}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#1e293b] dark:group-hover:text-white transition-colors duration-300">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role || 'Admin'}
                </p>
              </div>

              {/* Dropdown Arrow */}
              <svg
                className={`h-4 w-4 text-gray-400 group-hover:text-[#1e293b] dark:group-hover:text-white transition-all duration-300 ${
                  dropdownOpen ? 'rotate-180' : 'rotate-0'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            <div className={`origin-top-left absolute left-0 mt-3 w-52 rounded-lg shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black/5 focus:outline-none dark:ring-gray-700 border border-gray-200 dark:border-gray-600 overflow-hidden transition-all duration-200 transform z-50 ${
              dropdownOpen 
                ? 'scale-100 opacity-100 translate-y-0' 
                : 'scale-95 opacity-0 translate-y-1 pointer-events-none'
            }`}>
                {/* User Info Header */}
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-lg bg-[#1e293b] flex items-center justify-center shadow-sm">
                      <span className="text-lg font-bold text-white">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {user?.name || 'User Name'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email || 'user@example.com'}
                      </p>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 mt-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full ml-1"></span>
                        Online
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      window.location.href = '/profile';
                      setDropdownOpen(false);
                    }}
                    className="group flex w-full items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-all duration-300"
                  >
                    <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-[#1e293b] dark:group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <span className="group-hover:text-[#1e293b] dark:group-hover:text-white transition-colors duration-300">Profile</span>
                  </button>

                  {/* Divider */}
                  <div className="my-2 border-t border-gray-200 dark:border-gray-600"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="group flex w-full items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-all duration-300"
                  >
                    <svg className="w-5 h-5 mr-3 text-red-400 group-hover:text-red-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    <span className="font-medium">Sign out</span>
                  </button>
                </div>
              </div>
          </div>
        </div>
      </div>
    </header>
  );
}