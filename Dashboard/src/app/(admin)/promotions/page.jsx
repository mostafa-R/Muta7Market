"use client";
import { Card } from "@/app/component/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/component/ui/tabs";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import CreatePromotionForm from "./components/CreatePromotionForm";
import PromotionsTable from "./components/PromotionsTable";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/promotions");
      setPromotions(response.data.data || []);
    } catch (error) {
      setPromotions([]); // تأكد من أن promotions يبقى array حتى لو فشل API call
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب العروض الترويجية",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handlePromotionCreated = () => {
    fetchPromotions();
    toast({
      title: "تم بنجاح",
      description: "تم إنشاء العرض الترويجي بنجاح",
    });
  };

  const handlePromotionDeleted = () => {
    fetchPromotions();
    toast({
      title: "تم بنجاح",
      description: "تم حذف العرض الترويجي بنجاح",
    });
  };

  const handlePromotionUpdated = () => {
    fetchPromotions();
    toast({
      title: "تم بنجاح",
      description: "تم تحديث العرض الترويجي بنجاح",
    });
  };

  const filteredPromotions = (promotions || []).filter((promotion) => {
    const matchesSearch = 
      promotion?.name?.ar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promotion?.name?.en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promotion?.code?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "active" && promotion.isActive) ||
      (statusFilter === "inactive" && !promotion.isActive);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <PageBreadCrumb
        items={[
          { title: "الرئيسية", link: "/" },
          { title: "العروض الترويجية", link: "/promotions" },
        ]}
        title="إدارة العروض الترويجية"
      />

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="list">قائمة العروض الترويجية</TabsTrigger>
          <TabsTrigger value="create">إنشاء عرض ترويجي جديد</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card className="p-5">
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="بحث عن عرض ترويجي..."
                  className="w-full p-2 border rounded-md"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
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

            <PromotionsTable
              promotions={filteredPromotions}
              loading={loading}
              onDelete={handlePromotionDeleted}
              onUpdate={handlePromotionUpdated}
            />
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card className="p-5">
            <CreatePromotionForm onSuccess={handlePromotionCreated} />
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}