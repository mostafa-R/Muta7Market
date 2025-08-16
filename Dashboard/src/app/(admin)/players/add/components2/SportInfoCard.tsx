import { Trophy } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormField } from "./FormField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sportsOptions } from "../types2/types";
import { get } from "lodash";
import { Label } from "@/components/ui/label";

interface SportsInfoCardProps {
  formik: any;
}

export const SportsInfoCard = ({ formik }: SportsInfoCardProps) => {
  return (
    <Card className="border-0 shadow-card bg-white text-right">
      <CardHeader>
        <CardTitle className="flex items-center justify-end gap-2">
          <span className="text-lg font-semibold text-gray-800">المعلومات الرياضية</span>
          <Trophy className="w-5 h-5 text-primary" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* اختيار الرياضة */}
          <div className="space-y-2">
            <Label htmlFor="game" className="block text-sm font-medium text-gray-700 text-right">
              الرياضة *
            </Label>
            <Select
              value={formik.values.game}
              onValueChange={(value) => {
                formik.setFieldValue("game", value);
                formik.setFieldTouched("game", true);
              }}
              dir="rtl"
            >
              <SelectTrigger className="text-right">
                <SelectValue placeholder="اختر رياضتك" />
              </SelectTrigger>
              <SelectContent className="text-right">
                {sportsOptions.map((sport) => (
                  <SelectItem key={sport.value} value={sport.value} className="text-right">
                    {sport.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {get(formik.touched, "game") && get(formik.errors, "game") && (
              <div className="text-red-500 text-xs mt-1 text-right">
                {get(formik.errors, "game")}
              </div>
            )}
          </div>

          {/* المركز/التخصص */}
          <FormField
            label="المركز/التخصص"
            name="position"
            placeholder="مثال: مهاجم، حارس مرمى، مدرب لياقة"
            formik={formik}
            dir="rtl"
            className="text-right placeholder:text-right"
          />

          {/* الحالة الحالية */}
          <div className="space-y-2">
            <Label htmlFor="status" className="block text-sm font-medium text-gray-700 text-right">
              الحالة الحالية *
            </Label>
            <Select
              value={formik.values.status}
              onValueChange={(value) => {
                formik.setFieldValue("status", value.toLowerCase());
                formik.setFieldTouched("status", true);
              }}
              dir="rtl"
            >
              <SelectTrigger className="text-right">
                <SelectValue placeholder="اختر حالتك" />
              </SelectTrigger>
              <SelectContent className="text-right">
                <SelectItem value="available" className="text-right">حر (بحث عن فريق)</SelectItem>
                <SelectItem value="contracted" className="text-right">متعاقد</SelectItem>
                <SelectItem value="transferred" className="text-right">منتقل مؤخرًا</SelectItem>
              </SelectContent>
            </Select>
            {get(formik.touched, "status") && get(formik.errors, "status") && (
              <div className="text-red-500 text-xs mt-1 text-right">
                {get(formik.errors, "status")}
              </div>
            )}
          </div>

          {/* سنوات الخبرة */}
          <FormField
            label="سنوات الخبرة"
            name="experience"
            type="number"
            placeholder="عدد سنوات ممارسة الرياضة"
            formik={formik}
            dir="rtl"
            className="text-right placeholder:text-right"
          />
        </div>
      </CardContent>
    </Card>
  );
};