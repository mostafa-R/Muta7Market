"use client";
import React, { useEffect, useState } from "react";

const RevenueIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PlayersCoachesRevenueIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const UsersRevenueIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IsPromotedIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export const PaymentMetrics = () => {
  const [financialStats, setFinancialStats] = useState({
    playersCoachesRevenue: 0,
    usersRevenue: 0,
    totalRevenue: 0,
    isPromoted: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
      
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/dashboard/financial`, {
        method: "GET",
        credentials: "include",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setFinancialStats({
          playersCoachesRevenue: result.data.playersCoachesRevenue || 0,
          usersRevenue: result.data.usersRevenue || 0,
          totalRevenue: result.data.totalRevenue || 0,
          isPromoted: result.data.isPromoted || 0
        });
      } else {
        throw new Error(result.message || "Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching financial data:", err.message);
      // Set fallback values instead of keeping previous state
      setFinancialStats({
        playersCoachesRevenue: 0,
        usersRevenue: 0,
        totalRevenue: 0,
        isPromoted: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  // Enhanced Loading Skeleton
  const LoadingSkeleton = () => (
    <div>
      <div className="flex items-center justify-center w-12 h-12 bg-[#1e293b] rounded-xl mb-4">
        <div className="w-6 h-6 bg-gray-300 rounded-lg dark:bg-gray-600"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
      </div>
    </div>
  );

  // Enhanced Card Component
  const MetricCard = ({ 
    icon, 
    title, 
    amount,
    currency = "SAR",
    index
  }) => {
    
    return (
      <div 
        className="relative rounded-xl bg-white dark:bg-slate-800 p-5 border border-gray-100 dark:border-slate-700 shadow-sm"
        style={{
          animation: `slideUp 0.6s ease-out ${index * 150}ms both`
        }}
      >
        <div className="relative z-10">
          {/* Icon Section */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#1e293b] shadow-sm">
              {React.cloneElement(icon, { 
                className: "text-white w-6 h-6" 
              })}
            </div>
          </div>

          {/* Title */}
          <div className="mb-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              {title}
            </span>
          </div>
          
          {/* Main Counter */}
          <div>
            <div className="flex items-baseline gap-2">
              <h4 className="font-bold text-2xl text-gray-800 dark:text-white">
                {amount.toLocaleString()}
              </h4>
              {currency && (
                <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
                  {currency}
                </span>
              )}
            </div>
          </div>
        </div>
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
      
      <div className="relative w-full overflow-hidden bg-gray-50 dark:bg-gray-900 py-6">
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 max-w-7xl mx-auto">
          {loading ? (
            // Enhanced Loading State
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-xl bg-white dark:bg-slate-800 p-5 border border-gray-100 dark:border-slate-700">
                <LoadingSkeleton />
              </div>
            ))
          ) : (
            <>
              {/* Players & Coaches Combined Revenue Metric */}
              <MetricCard 
                icon={<PlayersCoachesRevenueIcon /> } 
                title="إيراد اللاعبين والمدربين"
                amount={financialStats.playersCoachesRevenue}
                currency="ريال"
                index={0}
              />

              {/* Users Revenue Metric */}
              <MetricCard 
                icon={<UsersRevenueIcon />}
                title="إيراد المستخدمين"
                amount={financialStats.usersRevenue}
                currency="ريال"
                index={1}
              />

              {/* Total Revenue Metric */}
              <MetricCard 
                icon={<RevenueIcon />}
                
                title="إجمالي الإيرادات"
                amount={financialStats.totalRevenue}
                currency="ريال"
                index={2}
              />

              {/* IsPromoted Metric */}
              <MetricCard 
                icon={<IsPromotedIcon />}
                title="تمت ترقيتهم"
                amount={financialStats.isPromoted}
                currency=""
                index={3}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};