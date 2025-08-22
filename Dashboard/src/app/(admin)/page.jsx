import ProtectedLayout from "@/layout/ProtectedLayout";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics.jsx";
import StatisticsChart from "@/components/ecommerce/StatisticsChart.jsx";
import RecentOrders from "@/components/ecommerce/RecentOrders.jsx";

export const metadata = {
  title: "Muta7Market",
};

export default function Ecommerce() {
  return (
       <ProtectedLayout requiredRole="admin">
      <div className="space-y-6">
        {/* EcommerceMetrics تاخد العرض كامل */}
        <div className="w-full">
          <EcommerceMetrics />
        </div>

        {/* باقي المكونات */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12">
            <StatisticsChart />
          </div>

          <div className="w-full col-span-12">
            <RecentOrders />
          </div>
        </div>
      </div>
       </ProtectedLayout>
  );
}