import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/component/ui/card";
import { useTranslation } from "react-i18next";
import { FiFileText } from "react-icons/fi";
import { FormField } from "./FormField";

export const TransferInfoCard = ({ formik }) => {
  const { t } = useTranslation();

  return (
    <Card className="border-0 shadow-card bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <FiFileText className="w-5 h-5 text-primary mr-2 ml-2" />
          <span>{t("registerProfile.form.transferInfo.title")}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label={t("registerProfile.form.transferInfo.transferredToClub")}
            name="transferredTo.club"
            placeholder={t(
              "registerProfile.form.transferInfo.transferredToClubPlaceholder"
            )}
            formik={formik}
          />
          <FormField
            label={t("registerProfile.form.transferInfo.transferAmount")}
            name="transferredTo.amount"
            type="number"
            placeholder={t(
              "registerProfile.form.transferInfo.transferAmountPlaceholder"
            )}
            formik={formik}
          />
          <FormField
            label={t("registerProfile.form.transferInfo.transferStartDate")}
            name="transferredTo.startDate"
            type="date"
            formik={formik}
          />
          <FormField
            label={t("registerProfile.form.transferInfo.transferEndDate")}
            name="transferredTo.endDate"
            type="date"
            formik={formik}
          />
        </div>
      </CardContent>
    </Card>
  );
};
