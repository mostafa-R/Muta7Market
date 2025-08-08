// components/ContactInfoCard.tsx
import { FiMail, FiPhone } from "react-icons/fi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/component/ui/card";
import { Checkbox } from "@/app/component/ui/checkbox";
import { FormField } from "./FormField";
import { Label } from "@/app/component/ui/label";
import { get } from "lodash";

interface ContactInfoCardProps {
  formik: any;
}

export const ContactInfoCard = ({ formik }: ContactInfoCardProps) => {
  return (
    <Card className="border-0 shadow-card bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <FiMail className="w-5 h-5 text-primary mr-2 ml-2" />
          <span>معلومات التواصل</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center space-x-2 space-x-reverse">
            <Checkbox
              className="mr-2 ml-2"
              checked={formik.values.contactInfo.isHidden}
              onCheckedChange={(checked) =>
                formik.setFieldValue("contactInfo.isHidden", !!checked)
              }
              onBlur={() =>
                formik.setFieldTouched("contactInfo.isHidden", true)
              }
            />
            <span>إخفاء معلومات التواصل عن الجميع</span>
          </Label>
          {get(formik.touched, "contactInfo.isHidden") &&
            get(formik.errors, "contactInfo.isHidden") && (
              <div className="text-red-500 text-xs mt-1">
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
          />
          <FormField
            label="رقم الهاتف"
            name="contactInfo.phone"
            type="tel"
            placeholder="رقم الهاتف"
            formik={formik}
          />
          <div className="space-y-2 md:col-span-2">
            <Label>معلومات الوكيل (اختياري)</Label>
            <FormField
              label="اسم الوكيل"
              name="contactInfo.agent.name"
              placeholder="اسم الوكيل"
              formik={formik}
            />
            <FormField
              label="هاتف الوكيل"
              name="contactInfo.agent.phone"
              type="tel"
              placeholder="هاتف الوكيل"
              formik={formik}
            />
            <FormField
              label="بريد الوكيل"
              name="contactInfo.agent.email"
              placeholder="بريد الوكيل"
              formik={formik}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
