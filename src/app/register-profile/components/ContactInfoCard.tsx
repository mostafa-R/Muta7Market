import { FiMail, FiPhone } from "react-icons/fi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/component/ui/card";
import { Checkbox } from "@/app/component/ui/checkbox";
import { Input } from "@/app/component/ui/input";
import { Label } from "@/app/component/ui/label";

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
          {formik.touched["contactInfo.isHidden"] &&
            formik.errors["contactInfo.isHidden"] && (
              <div className="text-red-500 text-xs mt-1">
                {formik.errors["contactInfo.isHidden"]}
              </div>
            )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="contact-email" className="flex items-center gap-1">
              <FiMail className="w-4 h-4" /> البريد الإلكتروني
            </Label>
            <Input
              id="contact-email"
              name="contactInfo.email"
              placeholder="البريد الإلكتروني"
              value={formik.values.contactInfo.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched["contactInfo.email"] &&
              formik.errors["contactInfo.email"] && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors["contactInfo.email"]}
                </div>
              )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-phone" className="flex items-center gap-1">
              <FiPhone className="w-4 h-4" /> رقم الهاتف
            </Label>
            <Input
              type="tel"
              id="contact-phone"
              name="contactInfo.phone"
              placeholder="رقم الهاتف"
              value={formik.values.contactInfo.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched["contactInfo.phone"] &&
              formik.errors["contactInfo.phone"] && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors["contactInfo.phone"]}
                </div>
              )}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>معلومات الوكيل (اختياري)</Label>
            <Input
              placeholder="اسم الوكيل"
              name="contactInfo.agent.name"
              value={formik.values.contactInfo.agent.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched["contactInfo.agent.name"] &&
              formik.errors["contactInfo.agent.name"] && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors["contactInfo.agent.name"]}
                </div>
              )}
            <Input
              type="tel"
              placeholder="هاتف الوكيل"
              name="contactInfo.agent.phone"
              value={formik.values.contactInfo.agent.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched["contactInfo.agent.phone"] &&
              formik.errors["contactInfo.agent.phone"] && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors["contactInfo.agent.phone"]}
                </div>
              )}
            <Input
              placeholder="بريد الوكيل"
              name="contactInfo.agent.email"
              value={formik.values.contactInfo.agent.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched["contactInfo.agent.email"] &&
              formik.errors["contactInfo.agent.email"] && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors["contactInfo.agent.email"]}
                </div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

