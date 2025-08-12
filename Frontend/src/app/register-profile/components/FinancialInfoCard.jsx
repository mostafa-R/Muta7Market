// components/FinancialInfoCard.jsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/component/ui/card";
import { DollarSign } from "lucide-react";
import { FormField } from "./FormField";

export const FinancialInfoCard = ({ formik }) => {
  return (
    <Card className="border-0 shadow-card bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <DollarSign className="w-5 h-5 text-primary mr-2 ml-2" />
          <span>المعلومات المالية (اختيارية)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="الراتب الشهري المطلوب (بالريال)"
            name="monthlySalary.amount"
            type="number"
            placeholder="مثال: 5000"
            formik={formik}
          />
          <FormField
            label="قيمة العقد السنوي (بالريال)"
            name="yearSalary.amount"
            type="number"
            placeholder="مثال: 60000"
            formik={formik}
          />
          <FormField
            label="تاريخ نهاية العقد الحالي"
            name="contractEndDate"
            type="date"
            formik={formik}
          />
        </div>
      </CardContent>
    </Card>
  );
};
