// components/PersonalInfoCard.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/app/component/ui/avatar";
import { Button } from "../../component/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../component/ui/card";
import { RadioGroup, RadioGroupItem } from "../../component/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../component/ui/select";
import { Camera, Upload, User } from "lucide-react";
import { FormField } from "./FormField";
import { nationalities } from "../types/types";
import { Label } from "../../component/ui/label";
import { get } from "lodash";
import { Input } from "@/app/component/ui/input";

interface PersonalInfoCardProps {
  formik: any;
  handleFileValidation: (
    file: File | null | undefined,
    allowedTypes: string[],
    maxSize: number
  ) => string | null;
  ALLOWED_IMAGE_TYPES: string[];
  MAX_FILE_SIZE: number;
}

export const PersonalInfoCard = ({
  formik,
  handleFileValidation,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
}: PersonalInfoCardProps) => {
  return (
    <Card className="border-0 shadow-card bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <User className="w-5 h-5 text-primary ml-2 mr-2" />
          <span>المعلومات الشخصية</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-6 space-x-reverse">
          <Avatar className="w-24 h-24 border-4 border-primary/20 ml-2 mr-2">
            <AvatarImage src={formik.values.profilePicturePreview} />
            <AvatarFallback className="bg-primary/10">
              <Camera className="w-8 h-8 text-primary" />
            </AvatarFallback>
          </Avatar>
          <div>
            <Label htmlFor="profile-picture" className="text-sm font-medium">
              الصورة الشخصية
            </Label>
            <div className="mt-2">
              <Input
                id="profile-picture"
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(",")}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  const error = handleFileValidation(
                    file,
                    ALLOWED_IMAGE_TYPES,
                    MAX_FILE_SIZE
                  );
                  if (error) {
                    formik.setFieldError("profilePictureFile", error);
                    return;
                  }
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    formik.setFieldValue(
                      "profilePicturePreview",
                      reader.result as string
                    );
                    formik.setFieldValue("profilePictureFile", file);
                  };
                  reader.readAsDataURL(file);
                }}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  document.getElementById("profile-picture")?.click()
                }
              >
                <Upload className="w-4 h-4 ml-2" />
                رفع صورة
              </Button>
              {get(formik.errors, "profilePictureFile") && (
                <div className="text-red-500 text-xs mt-1">
                  {get(formik.errors, "profilePictureFile")}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG أو GIF (حد أقصى 2MB)
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="الاسم الكامل"
            name="name"
            placeholder="أدخل اسمك الكامل"
            required
            formik={formik}
          />
          <FormField
            label="العمر"
            name="age"
            type="number"
            placeholder="أدخل عمرك"
            required
            formik={formik}
          />
          <div className="space-y-3">
            <Label>الجنس *</Label>
            <RadioGroup
              value={formik.values.gender}
              onValueChange={(value) => formik.setFieldValue("gender", value)}
              onBlur={() => formik.setFieldTouched("gender", true)}
              className="flex space-x-6 space-x-reverse"
            >
              <div className="flex items-center space-x-2 space-x-reverse gap-2">
                <RadioGroupItem value="Male" id="male" />
                <Label htmlFor="male">ذكر</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse gap-2">
                <RadioGroupItem value="Female" id="female" />
                <Label htmlFor="female">أنثى</Label>
              </div>
            </RadioGroup>
            {get(formik.touched, "gender") && get(formik.errors, "gender") && (
              <div className="text-red-500 text-xs mt-1">
                {get(formik.errors, "gender")}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="nationality">الجنسية *</Label>
            <Select
              value={formik.values.nationality}
              onValueChange={(value) =>
                formik.setFieldValue("nationality", value)
              }
              onBlur={() => formik.setFieldTouched("nationality", true)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر جنسيتك" />
              </SelectTrigger>
              <SelectContent>
                {nationalities.map((nationality) => (
                  <SelectItem key={nationality} value={nationality}>
                    {nationality}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {get(formik.touched, "nationality") &&
              get(formik.errors, "nationality") && (
                <div className="text-red-500 text-xs mt-1">
                  {get(formik.errors, "nationality")}
                </div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
