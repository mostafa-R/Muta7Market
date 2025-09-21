"use client";

import { Badge } from "@/app/component/ui/badge";
import { Button } from "@/app/component/ui/button";
import { Input } from "@/app/component/ui/input";
import {
  Calendar,
  ChevronDown,
  Edit3,
  Eye,
  Filter,
  Hash,
  Image as ImageIcon,
  List,
  Loader2,
  RefreshCw,
  Search,
  SortAsc,
  SortDesc,
  Trash2,
  Users
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const RETRY_DELAY = 3000;
const MAX_RETRIES = 2;

const dualLabel = (val) => {
  if (!val) return "—";
  if (typeof val === "string") return `${val} / ${val}`;
  const ar = val?.name?.ar ?? val?.ar ?? "—";
  const en = val?.name?.en ?? val?.en ?? "—";
  return `${ar} / ${en}`;
};

const renderBadgesDual = (items = [], maxShow = 3) => {
  if (!Array.isArray(items) || items.length === 0) {
    return <span className="text-xs text-gray-400">لا يوجد</span>;
  }
  
  const shown = items.slice(0, maxShow);
  const rest = items.length - shown.length;

  return (
    <div className="flex flex-wrap gap-1 max-w-full">
      {shown.map((item, idx) => (
        <Badge 
          key={item?._id ?? idx} 
          variant="outline" 
          className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
        >
          {dualLabel(item)}
        </Badge>
      ))}
      {rest > 0 && (
        <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
          +{rest} أخرى
        </Badge>
      )}
    </div>
  );
};

const splitRoleTypes = (roleTypes = []) => {
  const result = { player: [], coach: [] };
  for (const roleType of roleTypes || []) {
    if (roleType?.jop === "player") result.player.push(roleType);
    else if (roleType?.jop === "coach") result.coach.push(roleType);
  }
  return result;
};

export default function SportsTable({ onEdit, onDelete }) {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

 
  const [pagination, setPagination] = useState({
    totalDocs: 0,
    totalPages: 1,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  
  const getToken = useCallback(() =>
    localStorage.getItem("token") || sessionStorage.getItem("accessToken"), []);


  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    if (search.trim()) params.set("search", search.trim());
    return params.toString();
  }, [page, limit, search, sortBy, sortOrder]);

  
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

      const response = await fetch(`${API_BASE_URL}/sports?${queryString}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || errorData?.error?.message || `خطأ في الخادم (${response.status})`;
        throw new Error(errorMessage);
      }

      const result = await response.json();

     
      if (result?.data?.sports) {
        setSports(result.data.sports);
        setPagination(result.data.pagination || pagination);
      } else if (Array.isArray(result)) {
        setSports(result);
        setPagination({
          totalDocs: result.length,
          totalPages: 1,
          currentPage: 1,
          hasNextPage: false,
          hasPrevPage: false,
        });
      } else if (result?.sports) {
        setSports(result.sports);
        setPagination(result.pagination || pagination);
      } else {
        setSports([]);
        setPagination({
          totalDocs: 0,
          totalPages: 1,
          currentPage: 1,
          hasNextPage: false,
          hasPrevPage: false,
        });
      }

      setError(null);
      setRetryCount(0);
      
      if (isRetry) {
        toast.success("تم تحميل البيانات بنجاح");
      }
    } catch (err) {
      console.error("Error fetching sports:", err);
      setError(err.message);
      
      if (retryCount < MAX_RETRIES && !isRetry) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchSports(true);
        }, RETRY_DELAY);
      } else {
        toast.error(`فشل جلب الألعاب: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [queryString, getToken, retryCount, pagination]);

  useEffect(() => {
    fetchSports();
  }, [queryString]);

  const handleSearch = useCallback((e) => {
    setSearch(e.target.value);
    setPage(1); 
  }, []);

  const handleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  }, [sortBy]);

  const handleLimitChange = useCallback((newLimit) => {
    setLimit(Number(newLimit));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  }, []);

  const formatDate = useCallback((isoString) => {
    try {
      return isoString ? new Date(isoString).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : "—";
    } catch {
      return "—";
    }
  }, []);

  
  const getSortIcon = useCallback((field) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? 
      <SortAsc className="w-4 h-4 text-blue-600" /> : 
      <SortDesc className="w-4 h-4 text-blue-600" />;
  }, [sortBy, sortOrder]);

  return (
    <div className="w-full space-y-6" dir="rtl">
      {/* Enhanced Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {/* Controls Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <List className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">جدول الألعاب الرياضية</h3>
                <p className="text-sm text-gray-600">
                  عرض وإدارة جميع الألعاب الرياضية ({pagination.totalDocs} لعبة)
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`${showFilters ? 'bg-blue-50 border-blue-200' : ''}`}
              >
                <Filter className="w-4 h-4 ml-2" />
                الفلاتر
                <ChevronDown className={`w-4 h-4 mr-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              
              <Button
                variant="outline"
                onClick={fetchSports}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 ml-2" />
                )}
                تحديث
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="p-6 bg-gray-50 border-b border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ابحث بالاسم..."
                  value={search}
                  onChange={handleSearch}
                  className="pr-10"
                />
              </div>

              {/* Sort Field */}
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
              >
                <option value="createdAt">تاريخ الإنشاء</option>
                <option value="updatedAt">تاريخ التحديث</option>
                <option value="name.ar">الاسم (عربي)</option>
                <option value="name.en">الاسم (إنجليزي)</option>
              </select>

              {/* Sort Order */}
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  setPage(1);
                }}
              >
                <option value="desc">تنازلي</option>
                <option value="asc">تصاعدي</option>
              </select>

              {/* Items per page */}
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={limit}
                onChange={(e) => handleLimitChange(e.target.value)}
              >
                <option value={5}>5 عناصر</option>
                <option value={10}>10 عناصر</option>
                <option value={25}>25 عنصر</option>
                <option value={50}>50 عنصر</option>
              </select>
            </div>

            {/* Active Filters & Clear */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                {search && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    البحث: {search}
                    <button onClick={() => setSearch("")} className="ml-1 hover:text-red-600">
                      ×
                    </button>
                  </Badge>
                )}
                {(sortBy !== "createdAt" || sortOrder !== "desc") && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    الترتيب: {sortBy === "createdAt" ? "تاريخ الإنشاء" : 
                              sortBy === "updatedAt" ? "تاريخ التحديث" :
                              sortBy === "name.ar" ? "الاسم (عربي)" : "الاسم (إنجليزي)"}
                    ({sortOrder === "desc" ? "تنازلي" : "تصاعدي"})
                  </Badge>
                )}
              </div>
              
              {(search || sortBy !== "createdAt" || sortOrder !== "desc") && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  مسح الفلاتر
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Connection Error Warning */}
        {error && (
          <div className="p-4 bg-yellow-50 border-b border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <RefreshCw className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-yellow-800 font-medium">تحذير الاتصال</p>
                <p className="text-yellow-700 text-sm">
                  تعذر الاتصال بالخادم. يتم عرض آخر البيانات المحفوظة.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSports}
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                <RefreshCw className="w-4 h-4 ml-1" />
                إعادة المحاولة
              </Button>
            </div>
          </div>
        )}

        {/* Enhanced Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-right">
                <th className="p-4 text-xs font-medium text-gray-600 uppercase tracking-wider w-16">
                  #
                </th>
                <th className="p-4 text-xs font-medium text-gray-600 uppercase tracking-wider w-20">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    أيقونة
                  </div>
                </th>
                <th className="p-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("name.ar")}
                    className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                  >
                    الاسم
                    {getSortIcon("name.ar")}
                  </button>
                </th>
                <th className="p-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    المراكز
                  </div>
                </th>
                <th className="p-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    أنواع الأدوار
                  </div>
                </th>
                <th className="p-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("createdAt")}
                    className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    تاريخ الإنشاء
                    {getSortIcon("createdAt")}
                  </button>
                </th>
                <th className="p-4 text-xs font-medium text-gray-600 uppercase tracking-wider w-32">
                  الإجراءات
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      <p className="text-sm text-gray-500">جاري تحميل البيانات...</p>
                    </div>
                  </td>
                </tr>
              ) : sports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <List className="w-12 h-12 text-gray-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-medium text-gray-900">لا توجد ألعاب رياضية</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {search ? `لا توجد نتائج للبحث "${search}"` : "لم يتم إنشاء أي ألعاب رياضية بعد"}
                        </p>
                      </div>
                      {search && (
                        <Button variant="outline" onClick={() => setSearch("")}>
                          مسح البحث
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                sports.map((sport, index) => {
                  const iconUrl = sport?.icon?.url;
                  const { player, coach } = splitRoleTypes(sport?.roleTypes);
                  const rowNumber = (pagination.currentPage - 1) * limit + (index + 1);

                  return (
                    <tr
                      key={sport?._id ?? index}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      {/* Row Number */}
                      <td className="p-4 text-sm text-gray-600 font-medium">
                        {rowNumber}
                      </td>

                      {/* Icon */}
                      <td className="p-4">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          {iconUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={iconUrl}
                              alt={sport?.name?.ar || "أيقونة اللعبة"}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`${iconUrl ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </td>

                      {/* Name */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900 leading-tight">
                            {sport?.name?.ar || "—"}
                          </p>
                          <p className="text-sm text-gray-500 leading-tight">
                            {sport?.name?.en || "—"}
                          </p>
                          {sport?.slug && (
                            <div className="flex items-center gap-1 mt-1">
                              <Hash className="w-3 h-3 text-gray-400" />
                              <code className="text-xs text-gray-400 font-mono">{sport.slug}</code>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Positions */}
                      <td className="p-4">
                        <div className="max-w-xs">
                          {sport?.positions?.length > 0 ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                                  {sport.positions.length} موقع
                                </Badge>
                              </div>
                              {renderBadgesDual(sport.positions)}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">لا توجد مراكز</span>
                          )}
                        </div>
                      </td>

                      {/* Role Types */}
                      <td className="p-4">
                        <div className="max-w-xs space-y-3">
                          {/* Player Roles */}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                                <Users className="w-3 h-3 ml-1" />
                                لاعب ({player.length})
                              </Badge>
                            </div>
                            {player.length > 0 ? renderBadgesDual(player, 2) : 
                              <span className="text-xs text-gray-400">لا يوجد</span>}
                          </div>
                          
                          {/* Coach Roles */}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                                <Users className="w-3 h-3 ml-1" />
                                مدرب ({coach.length})
                              </Badge>
                            </div>
                            {coach.length > 0 ? renderBadgesDual(coach, 2) : 
                              <span className="text-xs text-gray-400">لا يوجد</span>}
                          </div>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="p-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(sport.createdAt )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit?.(sport)}
                            className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                            title="تعديل اللعبة"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete?.(sport)}
                            className="hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
                            title="حذف اللعبة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Enhanced Pagination */}
        {!loading && sports.length > 0 && (
          <div className="bg-gray-50 border-t border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Results Info */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border">
                  <List className="w-4 h-4 text-gray-400" />
                  <span>
                    إجمالي النتائج: <span className="font-medium text-gray-900">{pagination.totalDocs}</span>
                  </span>
                </div>
                
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span>
                    عرض {((pagination.currentPage - 1) * limit) + 1} - {Math.min(pagination.currentPage * limit, pagination.totalDocs)} من {pagination.totalDocs}
                  </span>
                </div>
              </div>
              
              {/* Pagination Controls */}
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600">
                  صفحة <span className="font-medium text-gray-900">{pagination.currentPage}</span> من <span className="font-medium text-gray-900">{pagination.totalPages}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPrevPage}
                    onClick={() => setPage(1)}
                    title="الصفحة الأولى"
                  >
                    الأولى
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPrevPage}
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    title="الصفحة السابقة"
                  >
                    السابق
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNextPage}
                    onClick={() => setPage(prev => prev + 1)}
                    title="الصفحة التالية"
                  >
                    التالي
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNextPage}
                    onClick={() => setPage(pagination.totalPages)}
                    title="الصفحة الأخيرة"
                  >
                    الأخيرة
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}