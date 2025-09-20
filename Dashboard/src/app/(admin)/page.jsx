import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics.jsx";
import RecentOrders from "@/components/ecommerce/RecentOrders.jsx";
import StatisticsChart from "@/components/ecommerce/StatisticsChart.jsx";

export const metadata = {
  title: "Muta7Market",
};

export default function Ecommerce() {
  return (
       <>
      <div className="space-y-6">
     
        <div className="w-full">
          <EcommerceMetrics />
        </div>
        
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12">
            <StatisticsChart />
          </div>

          <div className="w-full col-span-12">
            <RecentOrders />
          </div>
        </div>
      </div>
       </>
  );
}


