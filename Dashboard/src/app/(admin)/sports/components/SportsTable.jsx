"use client";

import { Badge } from "@/app/component/ui/badge";
import { Button } from "@/app/component/ui/button";
import { Input } from "@/app/component/ui/input";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

/* ----------------- helpers ----------------- */
const dualLabel = (val) => {
  if (!val) return "—";
  if (typeof val === "string") return `${val} / ${val}`;
  const ar = val?.name?.ar ?? val?.ar ?? "—";
  const en = val?.name?.en ?? val?.en ?? "—";
  return `${ar} / ${en}`;
};

const renderBadgesDual = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  const shown = items.slice(0, 3);
  const rest = items.length - shown.length;

  return (
    <div className="flex flex-wrap gap-1 max-w-full">
      {shown.map((item, idx) => (
        <Badge key={item?._id ?? idx} variant="outline" className="text-xs">
          {dualLabel(item)}
        </Badge>
      ))}
      {rest > 0 && <span className="text-xs text-muted-foreground">+{rest}</span>}
    </div>
  );
};

const splitRoleTypes = (roleTypes = []) => {
  const out = { player: [], coach: [] };
  for (const rt of roleTypes || []) {
    if (rt?.jop === "player") out.player.push(rt);
    else if (rt?.jop === "coach") out.coach.push(rt);
  }
  return out;
};

/* ----------------- component ----------------- */
export default function SportsTable({ onEdit, onDelete }) {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("asc");

  const [pagination, setPagination] = useState({
    totalDocs: 0,
    totalPages: 1,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    if (search.trim()) params.set("search", search.trim());
    return params.toString();
  }, [page, limit, search, sortBy, sortOrder]);

  const fetchSports = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("accessToken");
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_BASE_URL ;

      const res = await fetch(`${API_BASE_URL}/sports?${queryString}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          json?.message || json?.error?.message || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      if (json?.data?.sports) {
        setSports(json.data.sports);
        setPagination(json.data.pagination || pagination);
      } else if (Array.isArray(json)) {
        setSports(json);
        setPagination({
          totalDocs: json.length,
          totalPages: 1,
          currentPage: 1,
          hasNextPage: false,
          hasPrevPage: false,
        });
      } else if (json?.sports) {
        setSports(json.sports);
        setPagination(json.pagination || pagination);
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
    } catch (e) {
      console.error(e);
      toast.error(`فشل جلب الألعاب: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  const formatDate = (iso) => {
    try {
      return iso ? new Date(iso).toLocaleDateString() : "—";
    } catch {
      return "—";
    }
  };

  return (
    <div className="w-full space-y-4" dir="rtl">
      {/* controls */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input
                placeholder="ابحث بالاسم..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                className="w-64 pr-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={fetchSports}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                بحث
              </Button>
              {/* <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="border-gray-300"
              >
                <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                مسح
              </Button> */}
              
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 rounded-md p-1.5 px-3">
              <label className="text-sm text-gray-600 dark:text-gray-300">الترتيب:</label>
              <select
                className="bg-transparent text-sm focus:outline-none"
                value={sortBy}
                onChange={(e) => {
                  setPage(1);
                  setSortBy(e.target.value);
                }}
              >
                <option value="createdAt">تاريخ الإنشاء</option>
                <option value="updatedAt">تاريخ التحديث</option>
                <option value="name.en">الاسم (EN)</option>
                <option value="name.ar">الاسم (AR)</option>
              </select>

              <select
                className="bg-transparent text-sm focus:outline-none mr-2 border-r border-gray-300 dark:border-gray-600 pr-2"
                value={sortOrder}
                onChange={(e) => {
                  setPage(1);
                  setSortOrder(e.target.value);
                }}
              >
                <option value="asc">تصاعدي</option>
                <option value="desc">تنازلي</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 rounded-md p-1.5 px-3">
              <label className="text-sm text-gray-600 dark:text-gray-300">عرض:</label>
              <select
                className="bg-transparent text-sm focus:outline-none"
                value={limit}
                onChange={(e) => {
                  setPage(1);
                  setLimit(Number(e.target.value));
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <Button variant="outline" onClick={fetchSports} size="sm" className="border-gray-300">
              <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              تحديث
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <colgroup>
            <col className="w-10" />
            <col className="w-14" />
            <col className="w-[15%]" />
            <col className="w-[40%]" />
            <col className="w-[40%]" />
            <col className="w-[10%]" />
            <col className="w-[7rem]" />
          </colgroup>

          <thead className="bg-gray-50 dark:bg-slate-800 sticky top-0 z-10">
            <tr className="text-right">
              <th className="p-3 text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                #
              </th>
              <th className="p-3 text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                أيقونة
              </th>
              <th className="p-3 text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                الاسم
              </th>
              <th className="p-3 text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                المراكز (عربي / إنجليزي)
              </th>
              <th className="p-3 text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                أنواع الأدوار (لاعب / مدرب)
              </th>
              <th className="p-3 text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                تاريخ الإنشاء
              </th>
              <th className="p-3 text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-10 text-center"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">جاري تحميل البيانات...</p>
                  </div>
                </td>
              </tr>
            ) : sports.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-10 text-center"
                >
                  <div className="flex flex-col items-center justify-center">
                    <svg className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-500 dark:text-gray-400">لا توجد بيانات لعرضها</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">يمكنك إضافة لعبة جديدة من خلال تبويب "إضافة لعبة جديدة"</p>
                  </div>
                </td>
              </tr>
            ) : (
              sports.map((sport, i) => {
                const iconUrl = sport?.icon?.url;
                const { player, coach } = splitRoleTypes(sport?.roleTypes);

                return (
                  <tr
                    key={sport?._id ?? i}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="p-3 text-sm text-gray-600 dark:text-gray-300">
                      {(pagination.currentPage - 1) * limit + (i + 1)}
                    </td>

                    <td className="p-3">
                      {iconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={iconUrl}
                          alt="icon"
                          className="h-10 w-10 object-contain rounded bg-gray-50 dark:bg-slate-800 p-1"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </td>

                    {/* Name: AR on top, EN below */}
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {sport?.name?.ar ?? "—"}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {sport?.name?.en ?? "—"}
                        </span>
                      </div>
                    </td>

                    {/* Positions */}
                    <td className="p-3">
                      <div className="max-w-full min-w-0">
                        {renderBadgesDual(sport?.positions)}
                      </div>
                    </td>

                    {/* Role Types */}
                    <td className="p-3">
                      <div className="flex flex-col gap-2 max-w-full min-w-0">
                        <div className="flex items-start gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            لاعب
                          </span>
                          {renderBadgesDual(player)}
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            مدرب
                          </span>
                          {renderBadgesDual(coach)}
                        </div>
                      </div>
                    </td>

                    <td className="p-3 text-sm text-gray-600 dark:text-gray-300">{formatDate(sport?.createdAt)}</td>

                    {/* Actions */}
                    <td className="p-3">
                      <div className="flex flex-col gap-2 items-stretch">
                        <Button
                          variant="outline"
                          onClick={() => onEdit?.(sport)}
                          className="h-8 w-full border-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-primary"
                        >
                          <svg className="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          تعديل
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => onDelete?.(sport)}
                          className="h-8 w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                        >
                          <svg className="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          حذف
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

      {/* pagination footer */}
      <div className="bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-gray-800 p-4 rounded-b-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <div className="flex items-center bg-white dark:bg-slate-800 rounded-md px-3 py-1 shadow-sm">
              <svg className="h-4 w-4 text-gray-400 dark:text-gray-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>إجمالي السجلات: <span className="font-medium text-gray-900 dark:text-gray-100">{pagination.totalDocs}</span></span>
            </div>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              صفحة <span className="font-medium text-gray-900 dark:text-gray-100">{pagination.currentPage}</span> من <span className="font-medium text-gray-900 dark:text-gray-100">{pagination.totalPages}</span>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage(1)}
                className="border-gray-300 dark:border-gray-700"
                title="الصفحة الأولى"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="border-gray-300 dark:border-gray-700"
              >
                <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                السابق
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className="border-gray-300 dark:border-gray-700"
              >
                التالي
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage(pagination.totalPages)}
                className="border-gray-300 dark:border-gray-700"
                title="الصفحة الأخيرة"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
