// components/TransferInfoCard.jsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/component/ui/card";
import { FiFileText } from "react-icons/fi";
import { FormField } from "./FormField";

export const TransferInfoCard = ({ formik }) => {
  return (
    <Card className="border-0 shadow-card bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <FiFileText className="w-5 h-5 text-primary mr-2 ml-2" />
          <span>معلومات الانتقال (اختياري)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="اسم النادي المنتقل إليه"
            name="transferredTo.club"
            placeholder="اسم النادي المنتقل إليه"
            formik={formik}
          />
          <FormField
            label="تاريخ الانتقال"
            name="transferredTo.date"
            type="date"
            formik={formik}
          />
          <FormField
            label="قيمة الانتقال (بالريال)"
            name="transferredTo.amount"
            type="number"
            placeholder="قيمة الانتقال"
            formik={formik}
          />
        </div>
      </CardContent>
    </Card>
  );
};
