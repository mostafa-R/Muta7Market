import { DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/component/ui/card";
import { Input } from "@/app/component/ui/input";
import { Label } from "@/app/component/ui/label";

interface FinancialInfoCardProps {
  formik: any;
}

export const FinancialInfoCard = ({ formik }: FinancialInfoCardProps) => {
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
          <div className="space-y-2">
            <Label htmlFor="monthly-salary">
              الراتب الشهري المطلوب (بالريال)
            </Label>
            <Input
              id="monthly-salary"
              name="monthlySalary.amount"
              type="number"
              min="0"
              value={formik.values.monthlySalary.amount}
              onChange={(e) =>
                formik.setFieldValue(
                  "monthlySalary.amount",
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              onBlur={() =>
                formik.setFieldTouched("monthlySalary.amount", true)
              }
              placeholder="مثال: 5000"
            />
            {formik.touched["monthlySalary.amount"] &&
              formik.errors["monthlySalary.amount"] && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors["monthlySalary.amount"]}
                </div>
              )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="year-salary">قيمة العقد السنوي (بالريال)</Label>
            <Input
              id="year-salary"
              name="yearSalary"
              type="number"
              min="0"
              value={formik.values.yearSalary}
              onChange={(e) =>
                formik.setFieldValue(
                  "yearSalary",
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              onBlur={() => formik.setFieldTouched("yearSalary", true)}
              placeholder="مثال: 60000"
            />
            {formik.touched.yearSalary && formik.errors.yearSalary && (
              <div className="text-red-500 text-xs mt-1">
                {formik.errors.yearSalary}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contract-end-date">تاريخ نهاية العقد الحالي</Label>
            <Input
              id="contract-end-date"
              name="contractEndDate"
              type="date"
              value={formik.values.contractEndDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.contractEndDate &&
              formik.errors.contractEndDate && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.contractEndDate}
                </div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
