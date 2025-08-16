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
import { sportsOptions } from "../types/types";
import { get } from "lodash";
import { Label } from "@/components/ui/label";

interface SportsInfoCardProps {
  formik: any;
}

export const SportsInfoCard = ({ formik }: SportsInfoCardProps) => {
  return (
    <Card className="border-0 shadow-card bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-primary" />
          <span>المعلومات الرياضية</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* اختيار الرياضة */}
          <div className="space-y-2">
            <Label htmlFor="game">الرياضة *</Label>
            <Select
              value={formik.values.game}
              onValueChange={(value) => {
                formik.setFieldValue("game", value);
                formik.setFieldTouched("game", true);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر رياضتك" />
              </SelectTrigger>
              <SelectContent>
                {sportsOptions.map((sport) => (
                  <SelectItem key={sport.value} value={sport.value}>
                    {sport.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {get(formik.touched, "game") && get(formik.errors, "game") && (
              <div className="text-red-500 text-xs mt-1">
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
          />

          {/* الحالة الحالية */}
          <div className="space-y-2">
            <Label htmlFor="status">الحالة الحالية *</Label>
            <Select
              value={formik.values.status}
              onValueChange={(value) => {
                formik.setFieldValue("status", value.toLowerCase());
                formik.setFieldTouched("status", true);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر حالتك" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">حر (بحث عن فريق)</SelectItem>
                <SelectItem value="contracted">متعاقد</SelectItem>
                <SelectItem value="transferred">منتقل مؤخرًا</SelectItem>
              </SelectContent>
            </Select>
            {get(formik.touched, "status") && get(formik.errors, "status") && (
              <div className="text-red-500 text-xs mt-1">
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
          />
        </div>
      </CardContent>
    </Card>
  );
};
