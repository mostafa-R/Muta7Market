"use client";

import {
  BarChart3,
  CheckCircle,
  Gamepad2,
  List,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  TrendingUp,
  Zap
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/component/ui/tabs";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { GameIcon } from "@/icons";

import CreateSportForm from "./components/CreateSportForm";
import EditSportDialog from "./components/EditSportDialog";
import SportsTable from "./components/SportsTable";

// Production constants
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";
const RETRY_DELAY = 3000;
const MAX_RETRIES = 2;

export default function SportsPage() {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [retryCount, setRetryCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState(null);

  // Get authentication token
  const getToken = useCallback(() =>
    localStorage.getItem("token") || sessionStorage.getItem("accessToken"), []);

  // Calculate sports analytics
  const sportsAnalytics = useMemo(() => {
    const totalSports = sports.length;
    const sportsWithPositions = sports.filter(sport => sport?.positions?.length > 0).length;
    const sportsWithRoles = sports.filter(sport => sport?.roleTypes?.length > 0).length;
    const averagePositions = totalSports > 0 
      ? Math.round(sports.reduce((acc, sport) => acc + (sport?.positions?.length || 0), 0) / totalSports)
      : 0;
    
    return {
      totalSports,
      sportsWithPositions,
      sportsWithRoles,
      averagePositions,
      completionRate: totalSports > 0 ? Math.round(((sportsWithPositions + sportsWithRoles) / (totalSports * 2)) * 100) : 0
    };
  }, [sports]);

  // Enhanced fetch with retry logic
  const fetchSports = useCallback(async (isRetry = false) => {
    try {
      if (!isRetry) {
        setLoading(true);
        setError(null);
      }

      const token = getToken();
      if (!token) {
        throw new Error("لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.");
      }

      const res = await fetch(`${API_BASE_URL}/sports`, {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage = errorData?.message || errorData?.error?.message || `خطأ في الخادم (${res.status})`;
        throw new Error(errorMessage);
      }

      const json = await res.json();
      const list = json?.data?.sports ?? json?.sports ?? (Array.isArray(json) ? json : []);
      
      setSports(Array.isArray(list) ? list : []);
      setError(null);
      setRetryCount(0);
      setLastUpdated(new Date());
      
      if (isRetry) {
        toast.success("تم تحميل البيانات بنجاح");
      }
    } catch (err) {
      console.error("Error fetching sports:", err);
      setError(err.message);
      
      if (retryCount < MAX_RETRIES && !isRetry) {
        // Auto retry
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchSports(true);
        }, RETRY_DELAY);
      } else {
        toast.error(`فشل تحميل البيانات: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [getToken, retryCount]);

  // Load data on mount
  useEffect(() => {
    fetchSports();
  }, [fetchSports]);

  // Handlers
  const handleTabChange = useCallback((value) => {
    setActiveTab(value);
    
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', 'sports_tab_change', {
        tab_name: value,
        previous_tab: activeTab
      });
    }
  }, [activeTab]);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSportCreated = useCallback((created) => {
    setSports((prev) => [created, ...prev]);
    setActiveTab("list");
    toast.success("تم إضافة اللعبة الرياضية بنجاح");
    setLastUpdated(new Date());
  }, []);

  const handleSportUpdated = useCallback((updated) => {
    setSports((prev) => prev.map((sport) => (sport._id === updated._id ? updated : sport)));
    setEditOpen(false);
    toast.success("تم تحديث اللعبة الرياضية بنجاح");
    setLastUpdated(new Date());
  }, []);

  const handleEdit = useCallback((sport) => {
    setSelectedSport(sport);
    setEditOpen(true);
  }, []);

  const handleDelete = useCallback(async (sport) => {
    if (!sport?._id) return;

    const result = await Swal.fire({
      title: "تأكيد الحذف",
      text: `هل تريد حذف "${sport?.name?.ar || sport?.name?.en || ""}"؟`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      reverseButtons: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      customClass: {
        popup: 'swal2-rtl'
      }
    });

    if (!result.isConfirmed) return;

    const deletePromise = (async () => {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/sports/${sport._id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        const msg = json?.message || json?.error?.message || `HTTP ${res.status}`;
        throw new Error(msg);
      }
      
      return sport._id;
    })();

    try {
      const deletedId = await toast.promise(deletePromise, {
        loading: "جاري الحذف...",
        success: "تم حذف اللعبة الرياضية بنجاح",
        error: (e) => `فشل الحذف: ${e.message}`,
      });
      
      setSports((prev) => prev.filter((x) => x._id !== deletedId));
      setLastUpdated(new Date());
    } catch {
      // Error already handled by toast.promise
    }
  }, [getToken]);

  const handleRetry = useCallback(() => {
    setRetryCount(0);
    fetchSports();
  }, [fetchSports]);

  // Filtered sports for search
  const filteredSports = useMemo(() => {
    const query = (searchTerm || "").toLowerCase().trim();
    if (!query) return sports;
    
    return sports.filter((sport) => {
      const ar = sport?.name?.ar?.toLowerCase?.() || "";
      const en = sport?.name?.en?.toLowerCase?.() || "";
      const slug = sport?.slug?.toLowerCase?.() || "";
      return ar.includes(query) || en.includes(query) || slug.includes(query);
    });
  }, [sports, searchTerm]);

  const breadcrumbItems = [
    { title: "الرئيسية", href: "/admin" },
    { title: "الألعاب الرياضية", href: "/admin/sports" },
  ];

  // Loading state
  if (loading && sports.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <PageBreadCrumb pageTitle="الألعاب الرياضية" items={breadcrumbItems} />
        
        <div className="bg-[#1e293b] rounded-xl p-6 text-white">
          <div className="flex items-center gap-3">
            <Loader2 className="w-7 h-7 animate-spin" />
            <div>
              <h1 className="text-2xl font-bold">إدارة الألعاب الرياضية</h1>
              <p className="text-blue-100">جاري تحميل البيانات...</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">جاري تحميل الألعاب الرياضية...</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-20 rounded-lg"></div>
                  <div className="bg-gray-200 h-4 rounded mt-2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state (only if no data loaded)
  if (error && sports.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <PageBreadCrumb pageTitle="الألعاب الرياضية" items={breadcrumbItems} />
        
        <div className="bg-[#1e293b] rounded-xl p-6 text-white">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-7 h-7 text-red-400" />
            <div>
              <h1 className="text-2xl font-bold">خطأ في تحميل الألعاب الرياضية</h1>
              <p className="text-blue-100">تعذر الاتصال بالخادم</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-red-200">
          <div className="p-8 text-center">
            <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Gamepad2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">حدث خطأ</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={handleRetry}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                إعادة المحاولة
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                إعادة تحميل الصفحة
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <PageBreadCrumb pageTitle="الألعاب الرياضية" items={breadcrumbItems} />

      {/* Page Header with Analytics */}
      <div className="bg-[#1e293b] rounded-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-full">
              <GameIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">إدارة الألعاب الرياضية</h1>
              <p className="text-blue-100 mt-1">إضافة وتعديل الألعاب الرياضية في النظام</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="text-center">
              <div className="flex items-center gap-2 text-green-400">
                <Zap className="w-5 h-5" />
                <span className="text-xl font-bold">{sportsAnalytics.totalSports}</span>
              </div>
              <p className="text-blue-200">إجمالي الألعاب</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 text-purple-400">
                <BarChart3 className="w-5 h-5" />
                <span className="text-xl font-bold">{sportsAnalytics.completionRate}%</span>
              </div>
              <p className="text-blue-200">معدل الاكتمال</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 text-yellow-400">
                <TrendingUp className="w-5 h-5" />
                <span className="text-xl font-bold">{sportsAnalytics.averagePositions}</span>
              </div>
              <p className="text-blue-200">متوسط المراكز</p>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Warning */}
      {error && sports.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-yellow-200">
          <div className="p-4 bg-yellow-50 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <RefreshCw className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-900">تحذير الاتصال</h3>
                <p className="text-yellow-700 text-sm mb-2">
                  تعذر الاتصال بالخادم. يتم عرض آخر نسخة محفوظة من البيانات.
                </p>
                <button
                  onClick={handleRetry}
                  className="text-xs bg-yellow-200 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-300 transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  إعادة المحاولة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sports Overview Dashboard */}
      {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">نظرة عامة على الألعاب الرياضية</h3>
          </div>
          <p className="text-gray-600 text-sm">إحصائيات وحالة البيانات الحالية</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">{sportsAnalytics.totalSports}</div>
              <p className="text-sm text-blue-700">إجمالي الألعاب</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">{sportsAnalytics.sportsWithPositions}</div>
              <p className="text-sm text-green-700">ألعاب بمراكز</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">{sportsAnalytics.sportsWithRoles}</div>
              <p className="text-sm text-purple-700">ألعاب بأدوار</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {lastUpdated ? new Date(lastUpdated).toLocaleDateString('ar-SA') : 'غير محدد'}
              </div>
              <p className="text-sm text-orange-700">آخر تحديث</p>
            </div>
          </div>
          
          {sportsAnalytics.completionRate < 100 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">نصيحة:</p>
                  <p>أضف المراكز والأدوار لجميع الألعاب للحصول على أفضل تجربة للمستخدمين.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div> */}

      {/* Enhanced Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="border-b border-gray-200 px-6 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <List className="w-5 h-5 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">إدارة الألعاب</h3>
              </div>
              
              {/* Quick Search */}
              {activeTab === "list" && (
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="بحث سريع..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-64 pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <TabsList className="mb-0 bg-gray-100 p-1 rounded-lg w-full justify-start">
              <TabsTrigger 
                value="list" 
                className="data-[state=active]:bg-white rounded-md transition-all flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                قائمة الألعاب
                {sportsAnalytics.totalSports > 0 && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    {sportsAnalytics.totalSports}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="create" 
                className="data-[state=active]:bg-white rounded-md transition-all flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                إضافة لعبة جديدة
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="list" className="focus-visible:outline-none focus-visible:ring-0">
            {searchTerm && (
              <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center justify-between">
                <span className="text-sm text-blue-700 flex items-center">
                  <Search className="h-4 w-4 mr-2" />
                  نتائج البحث عن: <span className="font-bold mx-1">"{searchTerm}"</span>
                  <span className="text-blue-600">({filteredSports.length} نتيجة)</span>
                </span>
                <button 
                  onClick={() => setSearchTerm("")}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  مسح البحث ×
                </button>
              </div>
            )}
            
            <SportsTable
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </TabsContent>

          <TabsContent value="create" className="focus-visible:outline-none focus-visible:ring-0">
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Plus className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">إضافة لعبة رياضية جديدة</h3>
                </div>
                <p className="text-gray-600 text-sm">املأ المعلومات أدناه لإضافة لعبة رياضية جديدة للنظام</p>
              </div>
              
              <CreateSportForm onSportCreated={handleSportCreated} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

   

      {/* Edit Dialog */}
      <EditSportDialog
        sport={selectedSport}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSportUpdated={handleSportUpdated}
      />
    </div>
  );
}