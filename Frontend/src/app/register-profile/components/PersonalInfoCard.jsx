import { Avatar, AvatarFallback, AvatarImage } from "@/app/component/ui/avatar";
import { Input } from "@/app/component/ui/input";
import { get } from "lodash";
import { Camera, Upload, User } from "lucide-react";
import { Button } from "../../component/ui/button";
import { Label } from "../../component/ui/label";
import { RadioGroup, RadioGroupItem } from "../../component/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../component/ui/select";
import { nationalities } from "../types/constants";
import { FormField } from "./FormField";

export const PersonalInfoCard = ({
  formik,
  handleFileValidation,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
}) => {
  return (
    <div className="space-y-6">
      {/* Card title */}
      <div className="flex items-center space-x-2 space-x-reverse">
        <div className="bg-blue-50 p-2 rounded-full">
          <User className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold">المعلومات الشخصية</h2>
      </div>

      <div className="space-y-6">
        {/* Profile picture upload */}
        <div className="flex flex-col sm:flex-row items-center sm:space-x-6 sm:space-x-reverse bg-blue-50/50 p-4 rounded-lg border border-blue-100/50">
          <Avatar className="w-24 h-24 border-4 border-white shadow-sm mb-4 sm:mb-0">
            <AvatarImage
              src={formik.values.profilePicturePreview}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-50 to-blue-100">
              <Camera className="w-8 h-8 text-blue-500" />
            </AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-right w-full">
            <Label
              htmlFor="profile-picture"
              className="text-sm font-medium block mb-2"
            >
              الصورة الشخصية
            </Label>
            <div className="mt-2 flex flex-col sm:flex-row gap-2 items-center justify-center sm:justify-start">
              <Input
                id="profile-picture"
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(",")}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) {
                    formik.setFieldError(
                      "profilePictureFile",
                      "يرجى اختيار ملف"
                    );
                    return;
                  }
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
                      reader.result
                    );
                    formik.setFieldValue("profilePictureFile", file);
                  };
                  reader.readAsDataURL(file);
                }}
                className="hidden"
                aria-labelledby="profile-picture-label"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  document.getElementById("profile-picture")?.click()
                }
                className="bg-white hover:bg-blue-50 border-blue-200 transition-colors flex-shrink-0"
              >
                <Upload className="w-4 h-4 ml-2" />
                رفع صورة
              </Button>
              <p className="text-xs text-gray-500">
                JPG, PNG أو GIF (حد أقصى 10MB)
              </p>
            </div>
            {get(formik.errors, "profilePictureFile") && (
              <div
                role="alert"
                aria-live="assertive"
                className="text-red-500 text-xs mt-2 bg-red-50 p-1 px-2 rounded-md border border-red-100 inline-block"
              >
                {get(formik.errors, "profilePictureFile")}
              </div>
            )}
          </div>
        </div>

        {/* Personal information form fields */}
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

          {/* Gender selection with improved radio buttons */}
          <div className="space-y-3">
            <Label htmlFor="gender-group" className="flex items-center">
              الجنس <span className="text-red-500 mr-1">*</span>
            </Label>
            <RadioGroup
              id="gender-group"
              value={formik.values.gender}
              onValueChange={(value) => formik.setFieldValue("gender", value)}
              onBlur={() => formik.setFieldTouched("gender", true)}
              className="flex space-x-4 space-x-reverse"
            >
              <div className="flex items-center space-x-2 space-x-reverse px-4 py-2 border rounded-md bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male" className="cursor-pointer">
                  ذكر
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse px-4 py-2 border rounded-md bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female" className="cursor-pointer">
                  أنثى
                </Label>
              </div>
            </RadioGroup>
            {get(formik.touched, "gender") && get(formik.errors, "gender") && (
              <div
                role="alert"
                aria-live="assertive"
                className="text-red-500 text-xs mt-1 bg-red-50 p-1 px-2 rounded-md border border-red-100 inline-block"
              >
                {get(formik.errors, "gender")}
              </div>
            )}
          </div>

          {/* Nationality selection with improved styling */}
          <div className="space-y-2">
            <Label htmlFor="nationality" className="flex items-center">
              الجنسية <span className="text-red-500 mr-1">*</span>
            </Label>
            <Select
              value={formik.values.nationality}
              onValueChange={(value) => {
                formik.setFieldValue("nationality", value);
                formik.setFieldTouched("nationality", true);
              }}
            >
              <SelectTrigger
                id="nationality"
                className="bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50"
              >
                <SelectValue placeholder="اختر جنسيتك" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {nationalities.map((nationality) => (
                  <SelectItem key={nationality} value={nationality}>
                    {nationality}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {get(formik.touched, "nationality") &&
              get(formik.errors, "nationality") && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="text-red-500 text-xs mt-1 bg-red-50 p-1 px-2 rounded-md border border-red-100 inline-block"
                >
                  {get(formik.errors, "nationality")}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
