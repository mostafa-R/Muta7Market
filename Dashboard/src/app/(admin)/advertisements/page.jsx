"use client";

import { Card } from "@/app/component/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/component/ui/tabs";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Pagination from "@/components/tables/Pagination";

import AdvertisementFilters from "./components/AdvertisementFilters";
import AdvertisementsTable from "./components/AdvertisementsTable";
import CreateAdvertisementForm from "./components/CreateAdvertisementForm";
import { useAdvertisements } from "./hooks/useAdvertisements.js";
import { toast } from "sonner";

export default function AdvertisementsPage() {
  const {
    advertisements,
    pagination,
    loading,
    filters,
    currentPage,
    handleFilterChange,
    handlePageChange,
    refreshAdvertisements,
  } = useAdvertisements();
  


  const handleAdvertisementAction = (message) => {
    refreshAdvertisements();

    toast.success(message);
  };

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
            <AdvertisementFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />

            <AdvertisementsTable
              advertisements={advertisements}
              loading={loading}
              onDelete={() => handleAdvertisementAction("تم حذف الإعلان بنجاح")}
              onEdit={() => handleAdvertisementAction("تم تحديث الإعلان بنجاح")}
            />
            {pagination.totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card className="p-5">
            <CreateAdvertisementForm onSuccess={() => handleAdvertisementAction("تم إنشاء الإعلان بنجاح")} />
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
