// components/ContactInfoCard.tsx
import { FiMail, FiPhone } from "react-icons/fi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "./FormField";
import { Label } from "@/components/ui/label";
import { get } from "lodash";

interface ContactInfoCardProps {
  formik: any;
}

export const ContactInfoCard = ({ formik }: ContactInfoCardProps) => {
  return (
    <Card className="border-0 shadow-card bg-white text-right">
      <CardHeader>
        <CardTitle className="flex items-center justify-end">
          <span className="text-lg font-semibold text-gray-800">معلومات التواصل</span>
          <FiMail className="w-5 h-5 text-primary mr-2" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center justify-end gap-2">
            <span className="text-sm font-medium text-gray-700">إخفاء معلومات التواصل عن الجميع</span>
            <Checkbox
              checked={formik.values.contactInfo.isHidden}
              onCheckedChange={(checked) =>
                formik.setFieldValue("contactInfo.isHidden", !!checked)
              }
              onBlur={() =>
                formik.setFieldTouched("contactInfo.isHidden", true)
              }
            />
          </Label>
          {get(formik.touched, "contactInfo.isHidden") &&
            get(formik.errors, "contactInfo.isHidden") && (
              <div className="text-red-500 text-xs mt-1 text-right">
                {get(formik.errors, "contactInfo.isHidden")}
              </div>
            )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="البريد الإلكتروني"
            name="contactInfo.email"
            placeholder="البريد الإلكتروني"
            formik={formik}
            dir="rtl"
          />
          <FormField
            label="رقم الهاتف"
            name="contactInfo.phone"
            type="tel"
            placeholder="رقم الهاتف"
            formik={formik}
            dir="rtl"
          />
          <div className="space-y-2 md:col-span-2">
            <Label className="block text-sm font-medium text-gray-700 text-right">
              معلومات الوكيل (اختياري)
            </Label>
            <FormField
              label="اسم الوكيل"
              name="contactInfo.agent.name"
              placeholder="اسم الوكيل"
              formik={formik}
              dir="rtl"
            />
            <FormField
              label="هاتف الوكيل"
              name="contactInfo.agent.phone"
              type="tel"
              placeholder="هاتف الوكيل"
              formik={formik}
              dir="rtl"
            />
            <FormField
              label="بريد الوكيل"
              name="contactInfo.agent.email"
              placeholder="بريد الوكيل"
              formik={formik}
              dir="rtl"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};