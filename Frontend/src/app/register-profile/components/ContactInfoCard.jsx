// components/ContactInfoCard.jsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/component/ui/card";
import { Checkbox } from "@/app/component/ui/checkbox";
import { Label } from "@/app/component/ui/label";
import { get } from "lodash";
import { useTranslation } from "react-i18next";
import { FiMail } from "react-icons/fi";
import { FormField } from "./FormField";

export const ContactInfoCard = ({ formik }) => {
  const { t } = useTranslation();

  return (
    <Card className="border-0 shadow-card bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <FiMail className="w-5 h-5 text-primary mr-2 ml-2" />
          <span>{t("registerProfile.form.contactInfo.title")}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* <div className="space-y-2">
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
            <span>{t("registerProfile.form.contactInfo.hideContactInfo")}</span>
          </Label>
          {get(formik.touched, "contactInfo.isHidden") &&
            get(formik.errors, "contactInfo.isHidden") && (
              <div className="text-red-500 text-xs mt-1">
                {get(formik.errors, "contactInfo.isHidden")}
              </div>
            )}
        </div> */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label={t("registerProfile.form.contactInfo.email")}
            name="contactInfo.email"
            placeholder={t("registerProfile.form.contactInfo.emailPlaceholder")}
            formik={formik}
          />
          <FormField
            label={t("registerProfile.form.contactInfo.phone")}
            name="contactInfo.phone"
            type="tel"
            placeholder={t("registerProfile.form.contactInfo.phonePlaceholder")}
            formik={formik}
          />
          <div className="space-y-2 md:col-span-2">
            <Label>{t("registerProfile.form.contactInfo.agentInfo")}</Label>
            <FormField
              label={t("registerProfile.form.contactInfo.agentName")}
              name="contactInfo.agent.name"
              placeholder={t(
                "registerProfile.form.contactInfo.agentNamePlaceholder"
              )}
              formik={formik}
            />
            <FormField
              label={t("registerProfile.form.contactInfo.agentPhone")}
              name="contactInfo.agent.phone"
              type="tel"
              placeholder={t(
                "registerProfile.form.contactInfo.agentPhonePlaceholder"
              )}
              formik={formik}
            />
            <FormField
              label={t("registerProfile.form.contactInfo.agentEmail")}
              name="contactInfo.agent.email"
              placeholder={t(
                "registerProfile.form.contactInfo.agentEmailPlaceholder"
              )}
              formik={formik}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
