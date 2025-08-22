"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";

export default function AppHeader() {
  const { user, logout } = useAuth();
  const { isExpanded, toggleSidebar, isMobileOpen, toggleMobile } = useSidebar();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm border-b border-gray-200 dark:bg-[#1e293b] dark:border-gray-700 transition-all duration-300">
      
      <div className="relative flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
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
              className={`h-5 w-5 transition-all duration-300 ${
                isExpanded ? 'rotate-90' : 'rotate-0'
              }`}
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

        {/* Right Side - Controls and User Menu */}
        <div className="flex items-center space-x-3">

          {/* Dark Mode Toggle */}
          {/* <button
            className="relative group p-2 rounded-lg text-gray-500 hover:text-[#1e293b] dark:text-gray-300 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1e293b]/20 transition-all duration-300"
            onClick={() => {
              document.documentElement.classList.toggle('dark');
            }}
          >
            <svg
              className="h-5 w-5 transition-all duration-300 dark:hidden"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
              />
            </svg>
            <svg
              className="h-5 w-5 transition-all duration-300 hidden dark:block"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
              />
            </svg>
          </button> */}

          {/* User Dropdown */}
          <div className="relative">
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
              
              {/* User Info (hidden on mobile) */}
              <div className="hidden md:block text-left">
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
            {dropdownOpen && (
              <div className="origin-top-right absolute right-0 mt-3 w-64 rounded-lg shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black/5 focus:outline-none dark:ring-gray-700 border border-gray-200 dark:border-gray-600 overflow-hidden transition-all duration-300 transform scale-100 opacity-100">
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
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
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
            )}
          </div>
        </div>
      </div>
    </header>
  );
}