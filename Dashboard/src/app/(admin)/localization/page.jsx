"use client";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import LocalizationManagement from "./components/LocalizationManagement";

const LocalizationPage = () => {
  return (
    <div dir="rtl">
      <PageBreadCrumb
        title="إدارة الترجمات"
        links={[
          { name: "لوحة التحكم", href: "/admin" },
          { name: "إدارة الترجمات", href: "/admin/localization" },
        ]}
      />

      <div className="grid grid-cols-12 gap-6 mt-3">
        <div className="col-span-12">
          <LocalizationManagement />
        </div>
      </div>
    </div>
  );
};

export default LocalizationPage;
