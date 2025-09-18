"use client"
import AnalyticsOverview from '@/components/analytics/AnalyticsOverview';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import { Card, CardContent } from '@/components/ui/card';

const breadcrumbItems = [
  { title: 'لوحة التحكم', link: '/' },
  { title: 'تحليلات الموقع', link: '/analytics' },
];

// لا يمكن تصدير metadata من مكون يستخدم "use client"
// يجب نقل metadata إلى ملف منفصل مثل layout.js أو metadata.js

const AnalyticsPage = () => {
  return (
    <>
      <PageBreadCrumb items={breadcrumbItems} />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">تحليلات الموقع الرئيسي</h2>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            تعرض هذه الصفحة بيانات تحليلية للموقع الرئيسي (Frontend) المأخوذة من Google Analytics.
            البيانات المعروضة تشمل عدد الزيارات، مشاهدات الصفحات، متوسط مدة الجلسة، ومصادر الزيارات.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            <strong>ملاحظة:</strong> لوحة التحكم نفسها (Dashboard) غير مُتتبعة بواسطة Google Analytics لضمان خصوصية المسؤولين.
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <AnalyticsOverview />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AnalyticsPage;