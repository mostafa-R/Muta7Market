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
    <Card className="border-0 shadow-card bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <FiInstagram className="w-5 h-5 text-primary mr-2 ml-2" />
          <span>روابط التواصل الاجتماعي</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Instagram"
            name="socialLinks.instagram"
            placeholder="رابط Instagram"
            formik={formik}
          />
          <FormField
            label="Twitter"
            name="socialLinks.twitter"
            placeholder="رابط Twitter"
            formik={formik}
          />
          <FormField
            label="WhatsApp"
            name="socialLinks.whatsapp"
            placeholder="رقم WhatsApp"
            formik={formik}
          />
          <FormField
            label="YouTube"
            name="socialLinks.youtube"
            placeholder="رابط YouTube"
            formik={formik}
          />
        </div>
      </CardContent>
    </Card>
  );
};
