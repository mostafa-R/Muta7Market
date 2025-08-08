import { Save } from "lucide-react";
import { Button } from "@/app/component/ui/button";
import { Card, CardContent } from "@/app/component/ui/card";
import { Checkbox } from "@/app/component/ui/checkbox";
import { Label } from "@/app/component/ui/label";

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
              {formik.touched.agreeToTerms && formik.errors.agreeToTerms && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.agreeToTerms}
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
          className="hover:shadow-form w-full rounded-md bg-[hsl(var(--primary))] py-3 px-8 text-center text-base font-semibold text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Save className="w-5 h-5 ml-2" />
          إنشاء الملف الشخصي
        </Button>
      </div>
    </>
  );
};
