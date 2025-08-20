import { Avatar, AvatarFallback, AvatarImage } from "@/app/component/ui/avatar";
import { Input } from "@/app/component/ui/input";
import { get } from "lodash";
import { Camera, Upload, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../../component/ui/button";
import { Label } from "../../component/ui/label";
import { RadioGroup, RadioGroupItem } from "../../component/ui/radio-group";
// Updated import to use new organized constants structure
import { nationalities } from "../constants/sportsPositions";
import { ConditionalSelect } from "./ConditionalSelect";
import { FormField } from "./FormField";

export const PersonalInfoCard = ({
  formik,
  handleFileValidation,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Card title */}
      <div className="flex items-center space-x-2 space-x-reverse">
        <div className="bg-blue-50 p-2 rounded-full">
          <User className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold">
          {t("registerProfile.form.personalInfo.title")}
        </h2>
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
              {t("registerProfile.form.personalInfo.profilePicture")}
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
                      t("fileUpload.pleaseSelectFile")
                    );
                    return;
                  }
                  const error = handleFileValidation(
                    file,
                    ALLOWED_IMAGE_TYPES,
                    MAX_FILE_SIZE,
                    t
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
                {t("registerProfile.form.personalInfo.uploadImage")}
              </Button>
              <p className="text-xs text-gray-500">
                {t("registerProfile.form.personalInfo.allowedImageFormats")}
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
            label={t("registerProfile.form.personalInfo.fullName")}
            name="name"
            placeholder={t(
              "registerProfile.form.personalInfo.fullNamePlaceholder"
            )}
            required
            formik={formik}
          />
          <FormField
            label={t("registerProfile.form.personalInfo.age")}
            name="age"
            type="number"
            placeholder={t("registerProfile.form.personalInfo.agePlaceholder")}
            required
            formik={formik}
          />

          {/* Nationality selection with conditional "Other" input */}
          <ConditionalSelect
            label={t("registerProfile.form.personalInfo.nationality")}
            name="nationality"
            value={formik.values.nationality}
            onValueChange={(value) => {
              formik.setFieldValue("nationality", value);
              formik.setFieldTouched("nationality", true);
              // Clear custom nationality if not "other"
              if (value !== "other") {
                formik.setFieldValue("customNationality", "");
                formik.setFieldTouched("customNationality", false);
                // Also clear any existing errors for customNationality
                if (formik.errors.customNationality) {
                  formik.setFieldError("customNationality", "");
                }
              } else {
                // If switching to "other", reset custom nationality field
                formik.setFieldValue("customNationality", "");
                formik.setFieldTouched("customNationality", false);
                formik.setFieldError("customNationality", "");
              }
            }}
            onBlur={() => formik.setFieldTouched("nationality", true)}
            placeholder={t(
              "registerProfile.form.personalInfo.nationalityPlaceholder"
            )}
            options={nationalities}
            required={true}
            formik={formik}
            triggerValue="other"
            autoDetectConditional={true}
            conditionalInputName="customNationality"
            conditionalInputLabel={t(
              "registerProfile.form.personalInfo.specifyNationality"
            )}
            conditionalInputPlaceholder={t(
              "registerProfile.form.personalInfo.customNationalityPlaceholder"
            )}
          />

          {/* Birth Country selection with conditional "Other" input */}
          <ConditionalSelect
            label={t("registerProfile.form.personalInfo.birthCountry")}
            name="birthCountry"
            value={formik.values.birthCountry}
            onValueChange={(value) => {
              formik.setFieldValue("birthCountry", value);
              formik.setFieldTouched("birthCountry", true);
              // Clear custom birth country if not "other"
              if (value !== "other") {
                formik.setFieldValue("customBirthCountry", "");
                formik.setFieldTouched("customBirthCountry", false);
                // Also clear any existing errors for customBirthCountry
                if (formik.errors.customBirthCountry) {
                  formik.setFieldError("customBirthCountry", "");
                }
              } else {
                // If switching to "other", reset custom birth country field
                formik.setFieldValue("customBirthCountry", "");
                formik.setFieldTouched("customBirthCountry", false);
                formik.setFieldError("customBirthCountry", "");
              }
            }}
            onBlur={() => formik.setFieldTouched("birthCountry", true)}
            placeholder={t(
              "registerProfile.form.personalInfo.birthCountryPlaceholder"
            )}
            options={nationalities}
            required={true}
            formik={formik}
            triggerValue="other"
            autoDetectConditional={true}
            conditionalInputName="customBirthCountry"
            conditionalInputLabel={t(
              "registerProfile.form.personalInfo.customBirthCountryPlaceholder"
            )}
            conditionalInputPlaceholder={t(
              "registerProfile.form.personalInfo.customBirthCountryPlaceholder"
            )}
          />

          {/* Gender selection with improved radio buttons */}
          <div className="space-y-3">
            <Label htmlFor="gender-group" className="flex items-center">
              {t("registerProfile.form.personalInfo.gender")}{" "}
              <span className="text-red-500 mr-1">*</span>
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
                  {t("registerProfile.form.personalInfo.male")}
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse px-4 py-2 border rounded-md bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female" className="cursor-pointer">
                  {t("registerProfile.form.personalInfo.female")}
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
        </div>
      </div>
    </div>
  );
};
