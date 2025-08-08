import { Trophy } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/component/ui/card";
import { Input } from "@/app/component/ui/input";
import { Label } from "@/app/component/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/component/ui/select";
import { sportsOptions } from "../types/constants";

interface SportsInfoCardProps {
  formik: any;
}

export const SportsInfoCard = ({ formik }: SportsInfoCardProps) => {
  return (
    <Card className="border-0 shadow-card bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <Trophy className="w-5 h-5 text-primary mr-2 ml-2" />
          <span>المعلومات الرياضية</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="game">الرياضة *</Label>
            <Select
              value={formik.values.game}
              onValueChange={(value) => formik.setFieldValue("game", value)}
              onBlur={() => formik.setFieldTouched("game", true)}
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
            {formik.touched.game && formik.errors.game && (
              <div className="text-red-500 text-xs mt-1">
                {formik.errors.game}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">المركز/التخصص</Label>
            <Input
              id="position"
              name="position"
              value={formik.values.position}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="مثال: مهاجم، حارس مرمى، مدرب لياقة"
            />
            {formik.touched.position && formik.errors.position && (
              <div className="text-red-500 text-xs mt-1">
                {formik.errors.position}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">الفئة *</Label>
            <Select
              value={formik.values.category}
              onValueChange={(value) => formik.setFieldValue("category", value)}
              onBlur={() => formik.setFieldTouched("category", true)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر فئتك" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="player">لاعب</SelectItem>
                <SelectItem value="coach">مدرب</SelectItem>
              </SelectContent>
            </Select>
            {formik.touched.category && formik.errors.category && (
              <div className="text-red-500 text-xs mt-1">
                {formik.errors.category}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">الحالة الحالية *</Label>
            <Select
              value={formik.values.status}
              onValueChange={(value) => formik.setFieldValue("status", value)}
              onBlur={() => formik.setFieldTouched("status", true)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر حالتك" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">حر (بحث عن فريق)</SelectItem>
                <SelectItem value="contracted">متعاقد</SelectItem>
                <SelectItem value="transferred">منتقل مؤخراً</SelectItem>
              </SelectContent>
            </Select>
            {formik.touched.status && formik.errors.status && (
              <div className="text-red-500 text-xs mt-1">
                {formik.errors.status}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="expreiance">سنوات الخبرة</Label>
            <Input
              id="expreiance"
              name="expreiance"
              type="number"
              min="0"
              max="30"
              value={formik.values.expreiance}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="عدد سنوات ممارسة الرياضة"
            />
            {formik.touched.expreiance && formik.errors.expreiance && (
              <div className="text-red-500 text-xs mt-1">
                {formik.errors.expreiance}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
