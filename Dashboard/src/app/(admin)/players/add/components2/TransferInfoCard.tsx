// components/TransferInfoCard.tsx
import { FiFileText } from "react-icons/fi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormField } from "./FormField";
import { get } from "lodash";

interface TransferInfoCardProps {
  formik: any;
}

export const TransferInfoCard = ({ formik }: TransferInfoCardProps) => {
  return (
    <Card className="border-0 shadow-card bg-white text-right">
      <CardHeader>
        <CardTitle className="flex items-center justify-end gap-2">
          <span className="text-lg font-semibold text-gray-800">معلومات الانتقال (اختياري)</span>
          <FiFileText className="w-5 h-5 text-primary" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="اسم النادي المنتقل إليه"
            name="transferredTo.club"
            placeholder="اسم النادي المنتقل إليه"
            formik={formik}
            dir="rtl"
            className="text-right placeholder:text-right"
          />
          <FormField
            label="تاريخ الانتقال"
            name="transferredTo.date"
            type="date"
            formik={formik}
            dir="rtl"
            className="text-right [&::-webkit-calendar-picker-indicator]:filter invert(1) [&::-webkit-datetime-edit]:text-right"
          />
          <FormField
            label="قيمة الانتقال (بالريال)"
            name="transferredTo.amount"
            type="number"
            placeholder="مثال: 500000"
            formik={formik}
            dir="rtl"
            className="text-right placeholder:text-right"
          />
        </div>
      </CardContent>
    </Card>
  );
};