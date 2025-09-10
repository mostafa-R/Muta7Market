"use client";

import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { toast } from "sonner";

import { Input } from "@/app/component/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/component/ui/tabs";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { GameIcon } from "@/icons";

import CreateSportForm from "./components/CreateSportForm";
import SportsTable from "./components/SportsTable";
import EditSportDialog from "./components/EditSportDialog";

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
      <PageBreadCrumb pageTitle="الألعاب الرياضية" items={breadcrumbItems} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 mb-6">
        <div className="flex items-center">
          <GameIcon className="h-8 w-8 text-primary mr-3" />
          <h1 className="text-2xl font-bold">إدارة الألعاب الرياضية</h1>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-6">
          <p className="font-medium">تعذر الاتصال بالخادم.</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <TabsList className="mb-0">
            <TabsTrigger value="list">قائمة الألعاب</TabsTrigger>
            <TabsTrigger value="create">إضافة لعبة جديدة</TabsTrigger>
          </TabsList>

        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800">
          <TabsContent value="list">
            <SportsTable
              sports={filteredSports}
              loading={loading}
              onEdit={(s) => {
                setSelectedSport(s);
                setEditOpen(true);
              }}
              onDelete={handleDelete} // uses SweetAlert + Sonner
            />
          </TabsContent>

          <TabsContent value="create">
            <div className="p-6">
              <CreateSportForm onSportCreated={handleSportCreated} />
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Edit dialog (on success triggers a Sonner toast above) */}
      <EditSportDialog
        sport={selectedSport}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSportUpdated={(updated) => {
          handleSportUpdated(updated); // shows toast.success
          setEditOpen(false);
        }}
      />
    </div>
  );
}
