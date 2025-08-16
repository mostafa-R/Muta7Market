// components/TermsCard.tsx
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { get } from "lodash";

interface TermsCardProps {
  formik: any;
}

export const TermsCard = ({ formik }: TermsCardProps) => {
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
                className="text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
              <p className="text-base text-muted-foreground mt-1">
                بتسجيلك تُوافق على عرض بياناتك للأندية والمدربين المهتمين
              </p>
              {get(formik.touched, "agreeToTerms") &&
                get(formik.errors, "agreeToTerms") && (
                  <div className="text-red-500 text-sm mt-1">
                    {get(formik.errors, "agreeToTerms")}
                  </div>
                )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
       <Button
  type="submit"
  variant="default"
  size="xl"
  disabled={formik.isSubmitting}
  className="hover:shadow-form w-full rounded-md bg-blue-600 hover:bg-blue-700 py-4 px-8 text-center text-lg font-bold text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
>
  <Save className="w-5 h-5 ml-2" />
  تعديل الملف الشخصي
</Button>

      </div>
    </>
  );
};
