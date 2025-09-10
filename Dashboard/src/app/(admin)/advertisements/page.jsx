"use client";
import { Card } from "@/app/component/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/component/ui/tabs";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import AdvertisementsTable from "./components/AdvertisementsTable";
import CreateAdvertisementForm from "./components/CreateAdvertisementForm";

export default function AdvertisementsPage() {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  
  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const response = await api.get("/advertisements/admin");
      setAdvertisements(response.data.data);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب الإعلانات",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const handleAdvertisementCreated = () => {
    fetchAdvertisements();
    toast({
      title: "تم بنجاح",
      description: "تم إنشاء الإعلان بنجاح",
    });
  };

  const handleAdvertisementDeleted = () => {
    fetchAdvertisements();
    toast({
      title: "تم بنجاح",
      description: "تم حذف الإعلان بنجاح",
    });
  };

  const handleAdvertisementUpdated = () => {
    fetchAdvertisements();
    toast({
      title: "تم بنجاح",
      description: "تم تحديث الإعلان بنجاح",
    });
  };

  const filteredAdvertisements = advertisements.filter((ad) => {
    const matchesSearch = 
      ad.title.ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.title.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ad.advertiser?.name && ad.advertiser.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = typeFilter === "all" || ad.type === typeFilter;
    const matchesPosition = positionFilter === "all" || ad.position === positionFilter;
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "active" && ad.isActive) ||
      (statusFilter === "inactive" && !ad.isActive);
    
    return matchesSearch && matchesType && matchesPosition && matchesStatus;
  });

  return (
    <>
      <PageBreadCrumb
        items={[
          { title: "الرئيسية", link: "/" },
          { title: "الإعلانات", link: "/advertisements" },
        ]}
        title="إدارة الإعلانات"
      />

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="list">قائمة الإعلانات</TabsTrigger>
          <TabsTrigger value="create">إنشاء إعلان جديد</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card className="p-5">
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="بحث عن إعلان..."
                  className="w-full p-2 border rounded-md"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-auto">
                <select
                  className="w-full p-2 border rounded-md"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">جميع الأنواع</option>
                  <option value="banner">بانر</option>
                  <option value="popup">نافذة منبثقة</option>
                  <option value="sidebar">شريط جانبي</option>
                  <option value="native">إعلان مدمج</option>
                </select>
                <select
                  className="w-full p-2 border rounded-md"
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                >
                  <option value="all">جميع المواقع</option>
                  <option value="home">الصفحة الرئيسية</option>
                  <option value="search">صفحة البحث</option>
                  <option value="profile">صفحة الملف الشخصي</option>
                  <option value="listing">صفحة القوائم</option>
                </select>
                <select
                  className="w-full p-2 border rounded-md"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>
            </div>

            <AdvertisementsTable
              advertisements={filteredAdvertisements}
              loading={loading}
              onDelete={handleAdvertisementDeleted}
              onUpdate={handleAdvertisementUpdated}
            />
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card className="p-5">
            <CreateAdvertisementForm onSuccess={handleAdvertisementCreated} />
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
