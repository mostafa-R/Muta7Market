import { FiFileText } from "react-icons/fi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/component/ui/card";
import { Input } from "@/app/component/ui/input";
import { Label } from "@/app/component/ui/label";

interface TransferInfoCardProps {
  formik: any;
}

export const TransferInfoCard = ({ formik }: TransferInfoCardProps) => {
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
          <div className="space-y-2">
            <Label htmlFor="transfer-club">اسم النادي المنتقل إليه</Label>
            <Input
              id="transfer-club"
              name="transferredTo.club"
              placeholder="اسم النادي المنتقل إليه"
              value={formik.values.transferredTo.club}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched["transferredTo.club"] &&
              formik.errors["transferredTo.club"] && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors["transferredTo.club"]}
                </div>
              )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="transfer-date">تاريخ الانتقال</Label>
            <Input
              id="transfer-date"
              name="transferredTo.date"
              type="date"
              value={formik.values.transferredTo.date}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched["transferredTo.date"] &&
              formik.errors["transferredTo.date"] && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors["transferredTo.date"]}
                </div>
              )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="transfer-amount">قيمة الانتقال (بالريال)</Label>
            <Input
              id="transfer-amount"
              name="transferredTo.amount"
              type="number"
              placeholder="قيمة الانتقال"
              value={formik.values.transferredTo.amount}
              onChange={(e) =>
                formik.setFieldValue(
                  "transferredTo.amount",
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              onBlur={() =>
                formik.setFieldTouched("transferredTo.amount", true)
              }
            />
            {formik.touched["transferredTo.amount"] &&
              formik.errors["transferredTo.amount"] && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors["transferredTo.amount"]}
                </div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
