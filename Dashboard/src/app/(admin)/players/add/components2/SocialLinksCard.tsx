// components/SocialLinksCard.tsx
import { FiInstagram, FiTwitter, FiPhone, FiYoutube } from "react-icons/fi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormField } from "./FormField";

interface SocialLinksCardProps {
  formik: any;
}

export const SocialLinksCard = ({ formik }: SocialLinksCardProps) => {
  return (
    <Card className="border-0 shadow-card bg-white text-right">
      <CardHeader>
        <CardTitle className="flex items-center justify-end gap-2">
          <span className="text-lg font-semibold text-gray-800">روابط التواصل الاجتماعي</span>
          <FiInstagram className="w-5 h-5 text-primary" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Instagram"
            name="socialLinks.instagram"
            placeholder="رابط Instagram"
            formik={formik}
            dir="rtl"
            className="text-right"
          />
          <FormField
            label="Twitter"
            name="socialLinks.twitter"
            placeholder="رابط Twitter"
            formik={formik}
            dir="rtl"
            className="text-right"
          />
          <FormField
            label="WhatsApp"
            name="socialLinks.whatsapp"
            placeholder="رقم WhatsApp"
            formik={formik}
            dir="rtl"
            className="text-right"
          />
          <FormField
            label="YouTube"
            name="socialLinks.youtube"
            placeholder="رابط YouTube"
            formik={formik}
            dir="rtl"
            className="text-right"
          />
        </div>
      </CardContent>
    </Card>
  );
};