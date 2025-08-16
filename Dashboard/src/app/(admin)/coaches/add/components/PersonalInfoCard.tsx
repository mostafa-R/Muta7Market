import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Upload, User } from "lucide-react";
import { FormField } from "./FormField";
import { nationalities } from "../types/types";
import { Label } from "@/components/ui/label";
import { get } from "lodash";
import { Input } from "@/components/ui/input";

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
    <Card className="border-0 shadow-lg bg-white text-right rounded-xl">
      <CardHeader className="pb-3 border-b border-gray-100">
        <CardTitle className="flex items-center justify-end gap-2">
          <span className="text-xl font-bold text-gray-800">المعلومات الشخصية</span>
          <User className="w-6 h-6 text-primary" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-5">
        {/* Profile Picture Section */}
        <div className="flex flex-col md:flex-row items-center justify-end gap-6 p-4 bg-gray-50 rounded-lg">
          <Avatar className="w-28 h-28 border-4 border-primary/20 shadow-sm">
            <AvatarImage src={formik.values.profilePicturePreview} className="object-cover" />
            <AvatarFallback className="bg-primary/10">
              <Camera className="w-10 h-10 text-primary/80" />
            </AvatarFallback>
          </Avatar>
          
          <div className="text-right space-y-3">
            <div>
              <Label htmlFor="profile-picture" className="block text-sm font-semibold text-gray-700 mb-1">
                الصورة الشخصية
              </Label>
              <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("profile-picture")?.click()}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-200"
                >
                  <span>اختر صورة</span>
                  <Upload className="w-4 h-4" />
                </Button>
                <p className="text-xs text-gray-500">
                  JPG, PNG أو GIF (حد أقصى 2MB)
                </p>
              </div>
            </div>
            
            <Input
              id="profile-picture"
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) {
                  formik.setFieldError("profilePictureFile", "يرجى اختيار ملف");
                  return;
                }
                const error = handleFileValidation(file, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE);
                if (error) {
                  formik.setFieldError("profilePictureFile", error);
                  return;
                }
                const reader = new FileReader();
                reader.onloadend = () => {
                  formik.setFieldValue("profilePicturePreview", reader.result as string);
                  formik.setFieldValue("profilePictureFile", file);
                };
                reader.readAsDataURL(file);
              }}
              className="hidden"
            />
            
            {get(formik.errors, "profilePictureFile") && (
              <div className="text-red-500 text-xs mt-1 text-right">
                {get(formik.errors, "profilePictureFile")}
              </div>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="الاسم الكامل"
            name="name"
            placeholder="أدخل اسمك الكامل"
            required
            formik={formik}
            dir="rtl"
            className="bg-gray-50 border-gray-200 focus:border-primary"
          />
          
          <FormField
            label="العمر"
            name="age"
            type="number"
            placeholder="أدخل عمرك"
            required
            formik={formik}
            dir="rtl"
            className="bg-gray-50 border-gray-200 focus:border-primary"
          />
          
          <div className="space-y-3">
            <Label className="block text-sm font-semibold text-gray-700 mb-2">
              الجنس *
            </Label>
            <RadioGroup
              value={formik.values.gender}
              onValueChange={(value) => formik.setFieldValue("gender", value)}
              onBlur={() => formik.setFieldTouched("gender", true)}
              className="flex justify-end gap-6"
            >
              <div className="flex items-center gap-2">
                <Label htmlFor="male" className="cursor-pointer text-gray-700">ذكر</Label>
                <RadioGroupItem 
                  value="Male" 
                  id="male" 
                  className="border-gray-300 hover:border-primary text-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="female" className="cursor-pointer text-gray-700">أنثى</Label>
                <RadioGroupItem 
                  value="Female" 
                  id="female" 
                  className="border-gray-300 hover:border-primary text-primary"
                />
              </div>
            </RadioGroup>
            {get(formik.touched, "gender") && get(formik.errors, "gender") && (
              <div className="text-red-500 text-xs mt-1 text-right">
                {get(formik.errors, "gender")}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nationality" className="block text-sm font-semibold text-gray-700 mb-2">
              الجنسية *
            </Label>
            <Select
              value={formik.values.nationality}
              onValueChange={(value) => {
                formik.setFieldValue("nationality", value);
                formik.setFieldTouched("nationality", true);
              }}
              dir="rtl"
            >
              <SelectTrigger className="bg-gray-50 border-gray-200 text-right hover:border-primary focus:border-primary">
                <SelectValue placeholder="اختر جنسيتك" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 shadow-lg">
                {nationalities.map((nationality) => (
                  <SelectItem 
                    key={nationality} 
                    value={nationality} 
                    className="text-right hover:bg-gray-50"
                  >
                    {nationality}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {get(formik.touched, "nationality") &&
              get(formik.errors, "nationality") && (
                <div className="text-red-500 text-xs mt-1 text-right">
                  {get(formik.errors, "nationality")}
                </div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};