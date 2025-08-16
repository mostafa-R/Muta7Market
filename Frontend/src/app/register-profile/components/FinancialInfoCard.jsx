// components/FinancialInfoCard.jsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/component/ui/card";
import { DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FormField } from "./FormField";

export const FinancialInfoCard = ({ formik }) => {
  const { t } = useTranslation();

  return (
    <Card className="border-0 shadow-card bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <DollarSign className="w-5 h-5 text-primary mr-2 ml-2" />
          <span>{t("registerProfile.form.financialInfo.title")}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label={t("registerProfile.form.financialInfo.monthlySalary")}
            name="monthlySalary.amount"
            type="number"
            placeholder={t(
              "registerProfile.form.financialInfo.monthlySalaryPlaceholder"
            )}
            formik={formik}
          />
          <FormField
            label={t("registerProfile.form.financialInfo.annualContract")}
            name="yearSalary.amount"
            type="number"
            placeholder={t(
              "registerProfile.form.financialInfo.annualContractPlaceholder"
            )}
            formik={formik}
          />
          <FormField
            label={t("registerProfile.form.financialInfo.contractEndDate")}
            name="contractEndDate"
            type="date"
            formik={formik}
          />
        </div>
      </CardContent>
    </Card>
  );
};
