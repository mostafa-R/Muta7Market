"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "@/app/component/ui/badge";
import { Button } from "@/app/component/ui/button";
import { Input } from "@/app/component/ui/input";
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
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder="ابحث بالاسم..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-64"
          />
          <Button onClick={fetchSports}>بحث</Button>
          <Button
            variant="secondary"
            onClick={() => {
              setSearch("");
              setPage(1);
            }}
          >
            مسح
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm">الترتيب:</label>
          <select
            className="border rounded px-2 py-1 text-sm bg-transparent"
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
            className="border rounded px-2 py-1 text-sm bg-transparent"
            value={sortOrder}
            onChange={(e) => {
              setPage(1);
              setSortOrder(e.target.value);
            }}
          >
            <option value="asc">تصاعدي</option>
            <option value="desc">تنازلي</option>
          </select>

          <label className="text-sm">الصفحة:</label>
          <select
            className="border rounded px-2 py-1 text-sm bg-transparent"
            value={limit}
            onChange={(e) => {
              setPage(1);
              setLimit(Number(e.target.value));
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>

          <Button variant="outline" onClick={fetchSports}>
            تحديث
          </Button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse table-fixed">
          {/* make Positions + Role Types ≈ 80% */}
          <colgroup>
            <col className="w-10" />
            <col className="w-14" />
            <col className="w-[15%]" />
            <col className="w-[40%]" />
            <col className="w-[40%]" />
            <col className="w-[10%]" />
            <col className="w-[7rem]" />
          </colgroup>

          <thead className="bg-gray-50 dark:bg-slate-800">
            <tr className="text-right">
              <th className="p-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                #
              </th>
              <th className="p-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                أيقونة
              </th>
              <th className="p-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                الاسم
              </th>
              <th className="p-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                المراكز (عربي / إنجليزي)
              </th>
              <th className="p-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                أنواع الأدوار (لاعب / مدرب) — عربي / إنجليزي
              </th>
              <th className="p-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                تاريخ الإنشاء
              </th>
              <th className="p-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                الإجراءات
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-6 text-center text-sm text-muted-foreground"
                >
                  جاري التحميل...
                </td>
              </tr>
            ) : sports.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-6 text-center text-sm text-muted-foreground"
                >
                  لا توجد بيانات لعرضها
                </td>
              </tr>
            ) : (
              sports.map((sport, i) => {
                const iconUrl = sport?.icon?.url;
                const { player, coach } = splitRoleTypes(sport?.roleTypes);

                return (
                  <tr
                    key={sport?._id ?? i}
                    className="border-b border-gray-100 dark:border-gray-800 align-top"
                  >
                    <td className="p-3 text-sm">
                      {(pagination.currentPage - 1) * limit + (i + 1)}
                    </td>

                    <td className="p-3">
                      {iconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={iconUrl}
                          alt="icon"
                          className="h-10 w-10 object-contain rounded"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Name: AR on top, EN below */}
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {sport?.name?.ar ?? "—"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {sport?.name?.en ?? "—"}
                        </span>
                      </div>
                    </td>

                    {/* Positions (40%) */}
                    <td className="p-3">
                      <div className="max-w-full min-w-0">
                        {renderBadgesDual(sport?.positions)}
                      </div>
                    </td>

                    {/* Role Types (40%) */}
                    <td className="p-3">
                      <div className="flex flex-col gap-1 max-w-full min-w-0">
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] text-muted-foreground mt-1">
                            لاعب
                          </span>
                          {renderBadgesDual(player)}
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] text-muted-foreground mt-1">
                            مدرب
                          </span>
                          {renderBadgesDual(coach)}
                        </div>
                      </div>
                    </td>

                    <td className="p-3 text-sm">{formatDate(sport?.createdAt)}</td>

                    {/* Actions stacked */}
                    <td className="p-3">
                      <div className="flex flex-col gap-2 items-stretch">
                        <Button
                          variant="secondary"
                          onClick={() => onEdit?.(sport)}
                          className="h-8 w-full"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => onDelete?.(sport)}
                          className="h-8 w-full"
                        >
                          Delete
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
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          إجمالي: {pagination.totalDocs} • صفحة {pagination.currentPage} من{" "}
          {pagination.totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            السابق
          </Button>
          <Button
            variant="outline"
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
          >
            التالي
          </Button>
        </div>
      </div>
    </div>
  );
}
