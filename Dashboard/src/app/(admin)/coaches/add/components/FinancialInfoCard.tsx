// components/FinancialInfoCard.tsx
import { DollarSign } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormField } from "./FormField";

interface FinancialInfoCardProps {
  formik: any;
}

export const FinancialInfoCard = ({ formik }: FinancialInfoCardProps) => {
  return (
    <Card className="border-0 shadow-card bg-white text-right">
      <CardHeader>
        <CardTitle className="flex items-center justify-end gap-2">
          <span className="text-lg font-semibold text-gray-800">المعلومات المالية (اختيارية)</span>
          <DollarSign className="w-5 h-5 text-primary" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="الراتب الشهري المطلوب (بالدولار)"
            name="monthlySalary.amount"
            type="number"
            placeholder="مثال: 5000"
            formik={formik}
            dir="rtl"
            className="text-right"
          />
          <FormField
            label="قيمة العقد السنوي (بالدولار)"
            name="yearSalary"
            type="number"
            placeholder="مثال: 6000"
            formik={formik}
            dir="rtl"
            className="text-right"
          />
          <FormField
  label="تاريخ نهاية العقد الحالي"
  name="contractEndDate"
  type="date"
  formik={formik}
  dir="rtl"
  className="text-right [&::-webkit-calendar-picker-indicator]:filter invert(1)"
/>
        </div>
      </CardContent>
    </Card>
  );
};