// components/TermsCard.jsx
import { Card, CardContent } from "@/app/component/ui/card";
import { Checkbox } from "@/app/component/ui/checkbox";
import { Label } from "@/app/component/ui/label";
import { get } from "lodash";
import React from "react";

export const TermsCard = ({ formik }) => {
  // Force field touched when component renders to show validation immediately
  React.useEffect(() => {
    formik.setFieldTouched("agreeToTerms", true, false);
  }, []);

  return (
    <>
      <Card className="border-0 shadow-card bg-white">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3 space-x-reverse">
            <Checkbox
              id="terms"
              checked={formik.values.agreeToTerms}
              onCheckedChange={(checked) =>
                formik.setFieldValue("agreeToTerms", !!checked)
              }
              onBlur={() => formik.setFieldTouched("agreeToTerms", true)}
            />
            <div className="flex-1 mr-2 ml-2">
              <Label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                أوافق على{" "}
                <span className="text-primary hover:underline cursor-pointer">
                  الشروط والأحكام
                </span>{" "}
                و
                <span className="text-primary hover:underline cursor-pointer">
                  {" "}
                  سياسة الخصوصية
                </span>
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                بتسجيلك تُوافق على عرض بياناتك للأندية والمدربين المهتمين
              </p>
              {get(formik.touched, "agreeToTerms") &&
                get(formik.errors, "agreeToTerms") && (
                  <div className="text-red-500 text-xs mt-1">
                    {get(formik.errors, "agreeToTerms")}
                  </div>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
