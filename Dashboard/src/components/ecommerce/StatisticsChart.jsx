"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function UserStatsLineChart() {
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, inactive: 0 },
    players: { total: 0, active: 0, inactive: 0, confirmed: 0 },
    coaches: { total: 0, active: 0, inactive: 0, confirmed: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');

  // دالة لجلب البيانات من الباك اند
  const fetchStatsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
     
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        method: "GET",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Stats data response:", result);
      
      if (result.success && result.data) {
        setStats(result.data);
      } else {
        throw new Error(result.message || "Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching stats data:", err);
      setError(err.message);
      
      // بيانات تجريبية للعرض عند وجود خطأ
      setStats({
        users: { total: 1542, active: 1245, inactive: 297 },
        players: { total: 876, active: 654, inactive: 222, confirmed: 500 },
        coaches: { total: 42, active: 35, inactive: 7, confirmed: 30 }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchStatsData();
  }, []);

  const chartOptions = {
    chart: {
      height: 380,
      type: 'line',
      zoom: {
        enabled: false
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
      dropShadow: {
        enabled: true,
        top: 2,
        left: 2,
        blur: 4,
        opacity: 0.2
      },
      fontFamily: 'Tajawal, sans-serif'
    },
    colors: ['#ebdc0aff', '#e96107ff', '#e00eafff', '#e00e0eff', 'rgba(18, 223, 42, 1)ff', '#030117ff'],
    stroke: {
      curve: 'smooth',
      width: 3,
      lineCap: 'round'
    },
    markers: {
      size: 5,
      strokeWidth: 2,
      strokeColors: '#fff',
      hover: {
        size: 7
      }
    },
    xaxis: {
      categories: ['المستخدمين النشطين', 'المستخدمين غير النشطين', 'اللاعبين النشطين', 
                   'اللاعبين غير النشطين', 'المدربين النشطين', 'المدربين غير النشطين'],
      labels: {
        style: {
          fontSize: '11px',
          fontWeight: 500,
          fontFamily: 'Tajawal, sans-serif',
          colors: '#6B7280'
        }
      },
      axisBorder: {
        show: true,
        color: '#E5E7EB'
      },
      axisTicks: {
        show: true,
        color: '#E5E7EB'
      }
    },
    yaxis: {
      title: {
        text: 'العدد',
        style: {
          fontSize: '11px',
          fontWeight: 500,
          fontFamily: 'Tajawal, sans-serif',
          color: '#374151'
        }
      },
      labels: {
        style: {
          fontSize: '10px',
          fontFamily: 'Tajawal, sans-serif',
          colors: '#6B7280'
        },
        formatter: function(val) {
          return Math.round(val).toLocaleString();
        }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      fontSize: '11px',
      fontWeight: 500,
      fontFamily: 'Tajawal, sans-serif',
      markers: {
        width: 12,
        height: 12,
        radius: 6,
        offsetX: -5,
        offsetY: 1
      },
      itemMargin: {
        horizontal: 12,
        vertical: 6
      }
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '12px',
        fontFamily: 'Tajawal, sans-serif'
      },
      y: {
        formatter: function(val) {
          return val.toLocaleString();
        }
      }
    },
    grid: {
      borderColor: '#F3F4F6',
      strokeDashArray: 3,
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 10
      }
    },
    dataLabels: {
      enabled: false
    },
    responsive: [{
      breakpoint: 1000,
      options: {
        legend: {
          position: 'bottom',
          horizontalAlign: 'center'
        }
      }
    }]
  };

  const chartSeries = [
    {
      name: 'المستخدمين النشطين',
      data: [stats.users.active, 0, 0, 0, 0, 0]
    },
    {
      name: 'المستخدمين غير النشطين',
      data: [0, stats.users.inactive, 0, 0, 0, 0]
    },
    {
      name: 'اللاعبين النشطين',
      data: [0, 0, stats.players.active, 0, 0, 0]
    },
    {
      name: 'اللاعبين غير النشطين',
      data: [0, 0, 0, stats.players.inactive, 0, 0]
    },
    {
      name: 'المدربين النشطين',
      data: [0, 0, 0, 0, stats.coaches.active, 0]
    },
    {
      name: 'المدربين غير النشطين',
      data: [0, 0, 0, 0, 0, stats.coaches.inactive]
    }
  ];

  if (!isMounted) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-slate-600 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-slate-600 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-300 dark:bg-slate-600 rounded"></div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
           Active&InActive
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e293b]"></div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">جلب البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
           Active && InActive
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-center p-4">
          <div className="text-yellow-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">خطأ في تحميل البيانات</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={fetchStatsData}
            className="px-4 py-2 bg-[#1e293b] text-white rounded-lg hover:bg-slate-800 transition-colors text-sm"
          >
            محاولة مرة أخرى
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
         Active&InActive
        </h3>
      </div>

      <div className="max-w-full overflow-x-auto">
        <ReactApexChart
          options={chartOptions}
          series={chartSeries}
          type="line"
          height={380}
        />
      </div>

      <div className="mt-6 flex justify-end">
        <button 
          onClick={fetchStatsData}
          className="flex items-center text-sm text-[#1e293b] hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          تحديث البيانات
        </button>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
        
        .apexcharts-tooltip {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          border-radius: 10px;
          border: 1px solid rgba(229, 231, 235, 0.8);
          backdrop-filter: blur(8px);
          background: rgba(255, 255, 255, 0.95) !important;
        }
        .dark .apexcharts-tooltip {
          background: rgba(15, 23, 42, 0.95) !important;
          border-color: rgba(30, 41, 59, 0.8);
          color: white;
        }
        .apexcharts-legend-text {
          font-family: 'Tajawal', sans-serif !important;
          font-weight: 500;
          font-size: 11px !important;
        }
        .apexcharts-xaxis-label {
          font-size: 11px !important;
        }
        .apexcharts-yaxis-label {
          font-size: 10px !important;
        }
      `}</style>
    </div>
  );
}
