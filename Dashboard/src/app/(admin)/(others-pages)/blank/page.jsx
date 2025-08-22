import  {PaymentMetrics}  from "@/components/payment/PaymentMetrics.jsx";
import MonthlySalesChart from "@/components/payment/MonthlySalesChart";
export const metadata = {
  title: "Muta7Market",
};

export default function Payment() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Metrics Section */}
      <div className="col-span-12 space-y-6">
        <PaymentMetrics/>
      </div>

      {/* Monthly Sales Chart Full Width */}
      <div className="col-span-12">
        <MonthlySalesChart />
      </div>
    </div>
  );
}
