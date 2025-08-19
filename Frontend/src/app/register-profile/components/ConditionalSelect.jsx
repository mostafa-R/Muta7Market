import { Input } from "@/app/component/ui/input";
import { Label } from "@/app/component/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/component/ui/select";
import { get } from "lodash";
import { useTranslation } from "react-i18next";

export const ConditionalSelect = ({
  label,
  name,
  value,
  onValueChange,
  onBlur,
  placeholder,
  options,
  required = false,
  formik,
  triggerValue = null, // value that triggers conditional input
  conditionalInputName = null, // name for conditional input field
  conditionalInputPlaceholder = "",
  showConditionalInput = false, // whether to show conditional input
  children, // for custom conditional content
}) => {
  const { t } = useTranslation();
  const { touched, errors } = formik;

  const hasError = get(touched, name) && get(errors, name);
  const hasConditionalError =
    conditionalInputName &&
    get(touched, conditionalInputName) &&
    get(errors, conditionalInputName);

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="flex items-center text-sm font-medium">
        {label}
        {required && <span className="text-red-500 mr-1 ml-1">*</span>}
      </Label>

      <Select
        value={value || ""}
        onValueChange={onValueChange}
        onOpenChange={(open) => {
          if (!open && onBlur) {
            onBlur();
          }
        }}
      >
        <SelectTrigger
          id={name}
          className={`h-11 bg-white transition-all focus:ring-2 focus:ring-blue-400 ${
            hasError
              ? "border-red-300 bg-red-50"
              : "border-gray-200 hover:border-blue-400"
          }`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {t(option.name)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasError && (
        <div
          role="alert"
          aria-live="assertive"
          className="text-red-500 text-xs mt-1 bg-red-50 p-1 px-2 rounded-md border border-red-100 inline-block"
        >
          {get(errors, name)}
        </div>
      )}

      {/* Conditional Input for "Other" option */}
      {showConditionalInput && conditionalInputName && (
        <div className="mt-3 space-y-2">
          <Label
            htmlFor={conditionalInputName}
            className="text-sm font-medium text-gray-700"
          >
            {t("registerProfile.form.personalInfo.specifyNationality")}
            <span className="text-red-500 mr-1 ml-1">*</span>
          </Label>
          <Input
            id={conditionalInputName}
            name={conditionalInputName}
            value={formik.values[conditionalInputName] || ""}
            onChange={(e) => {
              formik.handleChange(e);
              // Mark as touched when user starts typing
              formik.setFieldTouched(conditionalInputName, true);
            }}
            onBlur={(e) => {
              formik.handleBlur(e);
              // Always mark as touched on blur for required conditional fields
              formik.setFieldTouched(conditionalInputName, true);
            }}
            placeholder={conditionalInputPlaceholder}
            required
            className={`bg-white border-gray-300 transition-all duration-200 ${
              hasConditionalError ? "border-red-500 ring-1 ring-red-200" : ""
            }`}
            autoComplete="off"
          />
          {hasConditionalError && (
            <div
              role="alert"
              aria-live="assertive"
              className="text-red-500 text-xs mt-1 bg-red-50 p-1 px-2 rounded-md border border-red-100 inline-block"
            >
              {get(errors, conditionalInputName)}
            </div>
          )}
        </div>
      )}

      {/* Custom conditional content */}
      {children}
    </div>
  );
};
