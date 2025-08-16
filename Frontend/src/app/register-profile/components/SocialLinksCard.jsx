// components/SocialLinksCard.jsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/component/ui/card";
import { useTranslation } from "react-i18next";
import { FiInstagram } from "react-icons/fi";
import { FormField } from "./FormField";

export const SocialLinksCard = ({ formik }) => {
  const { t } = useTranslation();

  return (
    <Card className="border-0 shadow-card bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <FiInstagram className="w-5 h-5 text-primary mr-2 ml-2" />
          <span>{t("registerProfile.form.socialLinks.title")}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Instagram"
            name="socialLinks.instagram"
            placeholder={t(
              "registerProfile.form.socialLinks.instagramPlaceholder"
            )}
            formik={formik}
          />
          <FormField
            label="Twitter"
            name="socialLinks.twitter"
            placeholder={t(
              "registerProfile.form.socialLinks.twitterPlaceholder"
            )}
            formik={formik}
          />
          <FormField
            label="WhatsApp"
            name="socialLinks.whatsapp"
            placeholder={t(
              "registerProfile.form.socialLinks.whatsappPlaceholder"
            )}
            formik={formik}
          />
          <FormField
            label="YouTube"
            name="socialLinks.youtube"
            placeholder={t(
              "registerProfile.form.socialLinks.youtubePlaceholder"
            )}
            formik={formik}
          />
        </div>
      </CardContent>
    </Card>
  );
};
