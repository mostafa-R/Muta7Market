"use client";
  import { BoxIconLine, GroupIcon } from "@/icons";
import React, { useEffect, useState } from "react";

  // Coach/Trainer Icon Component
  const CoachIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  );

  export const EcommerceMetrics = () => {
    const [stats, setStats] = useState({
      users: { total: 0, active: 0, inactive: 0 },
      players: { total: 0, active: 0, inactive: 0, Confirmed: 0},
      coaches: { total: 0, active: 0, inactive: 0, Confirmed: 0 },
      recent: { users: [], players: [], coaches: [] }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    
    const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');

     // Function to fetch dashboard stats
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL|| "http://localhost:5000/api/v1";
        
        const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
          method: "GET",
          credentials: "include",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        console.log("Response status:", response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log("Response data:", result);
        
        if (result.success && result.data) {
          setStats(result.data);
        } else {
          throw new Error(result.message || "Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError(err.message);
        
        // بيانات تجريبية للعرض عند وجود خطأ
        setStats({
          users: { total: 1542, active: 1245, inactive: 297 },
          players: { total: 876, active: 654, inactive: 222, Confirmed:500 },
          coaches: { total: 42, active: 35, inactive: 7,Confirmed:500 },
          recent: { users: [], players: [], coaches: [] }
        });
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchDashboardStats();
    }, []);

    // Enhanced Loading Skeleton
    const LoadingSkeleton = () => (
      <div>
        <div className="flex items-center justify-center w-16 h-16 bg-[#1e293b] rounded-3xl">
          <div className="w-8 h-8 bg-gray-300 rounded-xl dark:bg-gray-700"></div>
        </div>
        <div className="mt-6 space-y-4">
          <div className="h-4 bg-gradient-to-r from-slate-200 via-gray-200 to-slate-200 rounded-lg dark:from-slate-800 dark:via-gray-800 dark:to-slate-800 w-20"></div>
          <div className="h-10 bg-gradient-to-r from-slate-200 via-gray-200 to-slate-200 rounded-lg dark:from-slate-800 dark:via-gray-800 dark:to-slate-800 w-28"></div>
          <div className="flex space-x-3">
            <div className="h-6 bg-gradient-to-r from-teal-200 to-teal-300 rounded-full w-16"></div>
            <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full w-20"></div>
          </div>
          <div className="h-3 bg-[#1e293b] rounded-full w-full"></div>
        </div>
      </div>
    );

    // Enhanced Card Component
    const MetricCard = ({ 
      icon, 
      title, 
      total, 
      active, 
      inactive,
      Confirmed, 
      index
    }) => {
      const activePercentage = total > 0 ? Math.round((active / total) * 100) : 0;
      
      // تحديد الألوان بناءً على نوع البطاقة
      let colors = {};
      if (title.includes("Players")) {
        colors = {
          gradientFrom: "from-blue-500",
          gradientTo: "to-indigo-600",
          accentColor: "text-blue-600",
          bgGradient: "bg-[#1e293b]",
          progressBg: "bg-blue-100 dark:bg-blue-900/20",
          progressBorder: "border-blue-200 dark:border-blue-800/30",
          dotColor: "bg-blue-500",
          textColor: "text-blue-700 dark:text-blue-300",
          lightText: "text-blue-600/70 dark:text-blue-400/70"
        };
      } else if (title.includes("Users")) {
        colors = {
          gradientFrom: "from-emerald-500",
          gradientTo: "to-teal-600",
          accentColor: "text-emerald-600",
          bgGradient: "bg-[#1e293b]",
          progressBg: "bg-emerald-100 dark:bg-emerald-900/20",
          progressBorder: "border-emerald-200 dark:border-emerald-800/30",
          dotColor: "bg-emerald-500",
          textColor: "text-emerald-700 dark:text-emerald-300",
          lightText: "text-emerald-600/70 dark:text-emerald-400/70"
        };
      } else {
        colors = {
          gradientFrom: "from-violet-500",
          gradientTo: "to-purple-600",
          accentColor: "text-violet-600",
          bgGradient: "bg-[#1e293b]",
          progressBg: "bg-violet-100 dark:bg-violet-900/20",
          progressBorder: "border-violet-200 dark:border-violet-800/30",
          dotColor: "bg-violet-500",
          textColor: "text-violet-700 dark:text-violet-300",
          lightText: "text-violet-600/70 dark:text-violet-400/70"
        };
      }
      
      return (
        <div 
          className="relative rounded-2xl bg-white dark:bg-slate-900 p-7 border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm"
          style={{
            animation: `slideUp 0.6s ease-out ${index * 150}ms both`
          }}
        >
          <div className="relative z-10">
            {/* Icon Section */}
            <div className="flex items-center justify-between mb-6">
              <div className={`flex items-center justify-center w-16 h-16 rounded-2xl ${colors.bgGradient} shadow-md`}>
                {React.cloneElement(icon, { 
                  className: "text-white size-7" 
                })}
              </div>
            </div>

            {/* Title */}
            <div className="mb-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                {title}
              </span>
            </div>
            
            {/* Main Counter */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <h4 className="font-bold text-4xl text-gray-800 dark:text-gray-100">
                  {total.toLocaleString()}
                </h4>
                <span className="text-md font-medium text-gray-400 dark:text-gray-500">
                  total
                </span>
              </div>
            </div>

            {/* Enhanced Status Section */}
            <div className="space-y-4">
              {/* Status Pills */}
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${colors.progressBg} border ${colors.progressBorder}`}>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 ${colors.dotColor} rounded-full`}></div>
                    <span className={`text-sm font-semibold ${colors.textColor}`}>
                      {active.toLocaleString()}
                    </span>
                  </div>
                  <span className={`text-xs ${colors.lightText}`}>Active</span>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                      {inactive.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Inactive</span>
                </div>


              
              </div>

              {/* Enhanced Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Activity Rate</span>
                  <span className={`text-sm font-bold ${colors.accentColor}`}>
                    {activePercentage}%
                  </span>
                </div>
                <div className="relative h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="absolute h-full bg-[#1e293b] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${activePercentage}%` }}
                  >
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 rounded-2xl opacity-[0.03] pointer-events-none bg-gradient-to-br from-gray-800 via-gray-600 to-gray-800"></div>
        </div>
      );
    };

    return (
      <>
        <style jsx>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}</style>
        
        <div className="relative w-full overflow-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-900 py-8">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-10 dark:opacity-5"></div>
          
          {/* Error Message */}
          {error && (
            <div className="relative z-20 mx-auto max-w-6xl px-4 mb-6">
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-bold">Connection Error</p>
                  <p>Showing demo data. {error}</p>
                </div>
                <button 
                  onClick={fetchDashboardStats}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 max-w-6xl mx-auto">
            {loading ? (
              // Enhanced Loading State
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-2xl bg-white/80 dark:bg-slate-900/80 p-7 border border-gray-100 dark:border-slate-800 backdrop-blur-sm">
                  <LoadingSkeleton />
                </div>
              ))
            ) : (
              <>
              {/* Users Metric */}
              <MetricCard 
                  icon={<BoxIconLine />}
                  title="Total Users"
                  total={stats.users.total}
                  active={stats.users.active}
                  inactive={stats.users.inactive}
                  index={1}
                />

                {/* Players Metric */}
                <MetricCard 
                  icon={<GroupIcon />}
                  title="Total Players"
                  total={stats.players.total}
                  active={stats.players.active}
                  inactive={stats.players.inactive}
                  Confirmed={stats.players.Confirmed}
                  index={0}
                />

                {/* Coaches Metric */}
                <MetricCard 
                  icon={<CoachIcon />}
                  title="Total Coaches"
                  total={stats.coaches?.total || 0}
                  active={stats.coaches?.active || 0}
                  inactive={stats.coaches?.inactive || 0}
                  Confirmed={stats.coaches?.Confirmed|| 0}
                  index={2}
                />
              </>
            )}
          </div>
        </div>
      </>
    );
  };  
