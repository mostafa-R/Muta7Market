"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/component/ui/tabs";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { GameIcon } from "@/icons";

import CreateSportForm from "./components/CreateSportForm";
import EditSportDialog from "./components/EditSportDialog";
import SportsTable from "./components/SportsTable";

export default function SportsPage() {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab,  setActiveTab]  = useState("list");

  // edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState(null);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";
  const getToken = () =>
    localStorage.getItem("token") || sessionStorage.getItem("accessToken");

  /* ------------------ fetch list ------------------ */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/sports`, {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = json?.message || json?.error?.message || `HTTP ${res.status}`;
          throw new Error(msg);
        }

        const list =
          json?.data?.sports ?? json?.sports ?? (Array.isArray(json) ? json : []);
        setSports(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error(err);
        setError(err.message);
        toast.error(`فشل تحميل البيانات: ${err.message}`);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------ handlers ------------------ */
  const handleTabChange = (v) => setActiveTab(v);
  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handleSportCreated = (created) => {
    setSports((s) => [created, ...s]);
    setActiveTab("list");
    toast.success("تم إضافة اللعبة الرياضية بنجاح");
  };

  // 🔔 toast on update (triggered by EditSportDialog callback)
  const handleSportUpdated = (updated) => {
    setSports((s) => s.map((x) => (x._id === updated._id ? updated : x)));
    toast.success("تم تحديث اللعبة الرياضية بنجاح");
  };

  // 🔔 toast + SweetAlert confirm on delete
  const handleDelete = async (sport) => {
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
    });

    if (!result.isConfirmed) return;

    const deletePromise = (async () => {
      const res = await fetch(`${API_BASE_URL}/sports/${sport._id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: "application/json",
        },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = json?.message || json?.error?.message || `HTTP ${res.status}`;
        throw new Error(msg);
      }
      return sport._id;
    })();

    try {
      const deletedId = await toast.promise(deletePromise, {
        loading: "جارِ الحذف...",
        success: "تم حذف اللعبة الرياضية بنجاح",
        error: (e) => `فشل الحذف: ${e.message}`,
      });
      setSports((prev) => prev.filter((x) => x._id !== deletedId));
    } catch {
      // toast.promise already showed the error
    }
  };

  const filteredSports = useMemo(() => {
    const q = (searchTerm || "").toLowerCase();
    if (!q) return sports;
    return sports.filter((sport) => {
      const ar = sport?.name?.ar?.toLowerCase?.() || "";
      const en = sport?.name?.en?.toLowerCase?.() || "";
      const slug = sport?.slug?.toLowerCase?.() || "";
      return ar.includes(q) || en.includes(q) || slug.includes(q);
    });
  }, [sports, searchTerm]);

  const breadcrumbItems = [
    { title: "الرئيسية", href: "/admin" },
    { title: "الألعاب الرياضية", href: "/admin/sports" },
  ];

  /* ------------------ UI ------------------ */
  return (
    <div className="p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <PageBreadCrumb pageTitle="الألعاب الرياضية" items={breadcrumbItems} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 mb-8">
          <div className="flex items-center">
            <div className="bg-primary/10 p-3 rounded-full mr-4">
              <GameIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">إدارة الألعاب الرياضية</h1>
              <p className="text-sm text-gray-500 mt-1">إضافة وتعديل الألعاب الرياضية في النظام</p>
            </div>
          </div>
          
          {!error && !loading && (
            <div className="bg-gray-50 dark:bg-slate-800/50 p-2 px-4 rounded-lg">
              <p className="text-sm font-medium">إجمالي الألعاب: <span className="text-primary font-bold">{sports.length}</span></p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-yellow-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="font-medium">تعذر الاتصال بالخادم.</p>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="border-b border-gray-200 dark:border-slate-800 px-6 pt-4">
              <TabsList className="mb-0 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                <TabsTrigger value="list" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 rounded-md transition-all">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  قائمة الألعاب
                </TabsTrigger>
                <TabsTrigger value="create" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 rounded-md transition-all">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  إضافة لعبة جديدة
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="list" className="focus-visible:outline-none focus-visible:ring-0">
              {searchTerm && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800/30 px-6 py-2 flex items-center">
                  <span className="text-sm text-blue-700 dark:text-blue-300 flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    نتائج البحث عن: <span className="font-bold mx-1">{searchTerm}</span>
                    <button 
                      onClick={() => setSearchTerm("")}
                      className="mr-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                </div>
              )}
              <SportsTable
                sports={filteredSports}
                loading={loading}
                onEdit={(s) => {
                  setSelectedSport(s);
                  setEditOpen(true);
                }}
                onDelete={handleDelete}
              />
            </TabsContent>

            <TabsContent value="create" className="focus-visible:outline-none focus-visible:ring-0">
              <div className="p-6">
                <CreateSportForm onSportCreated={handleSportCreated} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit dialog */}
      <EditSportDialog
        sport={selectedSport}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSportUpdated={(updated) => {
          handleSportUpdated(updated);
          setEditOpen(false);
        }}
      />
    </div>
  );
}
