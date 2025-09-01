// components/FormField.jsx
import { Input } from "@/app/component/ui/input";
import { Label } from "@/app/component/ui/label";
import { cn } from "@/lib/utils";
import { get } from "lodash";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const FormField = ({
  label,
  name,
  type = "text",
  placeholder,
  required,
  formik,
}) => {
  const { t } = useTranslation();
  const { values, errors, touched, handleChange, handleBlur } = formik;
  const [isFocused, setIsFocused] = useState(false);
  const hasError = get(touched, name) && get(errors, name);
  const fieldValue = get(values, name) || "";
  const translatedLabel = typeof label === "string" ? t(label) : label;
  const translatedPlaceholder =
    typeof placeholder === "string" ? t(placeholder) : placeholder;

  return (
    <div className="space-y-2">
      <Label
        htmlFor={name}
        className="flex items-center text-sm font-medium mb-1"
      >
        {translatedLabel}{" "}
        {required && <span className="text-red-500 mr-1">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={type}
          placeholder={translatedPlaceholder}
          value={fieldValue}
          onChange={handleChange}
          onBlur={(e) => {
            handleBlur(e);
            setIsFocused(false);
          }}
          onFocus={() => setIsFocused(true)}
          aria-describedby={hasError ? `${name}-error` : undefined}
          aria-invalid={hasError ? "true" : "false"}
          className={cn(
            "bg-white border-gray-300 transition-all duration-200",
            hasError && "border-red-500 ring-1 ring-red-200",
            isFocused && "border-blue-500 ring-2 ring-blue-200 ring-opacity-50",
            type === "number" && "appearance-textfield"
          )}
        />
      </div>
      {hasError && (
        <div
          id={`${name}-error`}
          role="alert"
          aria-live="assertive"
          className="text-red-500 text-xs mt-1 bg-red-50 p-1 px-2 rounded-md border border-red-100 inline-block"
        >
          {get(errors, name)}
        </div>
      )}
    </div>
  );
};
