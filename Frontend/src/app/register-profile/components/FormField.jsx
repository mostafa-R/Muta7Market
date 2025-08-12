// components/FormField.jsx
import { Input } from "@/app/component/ui/input";
import { Label } from "@/app/component/ui/label";
import { get } from "lodash";

export const FormField = ({
  label,
  name,
  type = "text",
  placeholder,
  required,
  formik,
}) => {
  const { values, errors, touched, handleChange, handleBlur } = formik;

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="flex items-center gap-1">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={get(values, name) || ""}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-describedby={
          get(touched, name) && get(errors, name) ? `${name}-error` : undefined
        }
      />
      {get(touched, name) && get(errors, name) && (
        <div id={`${name}-error`} className="text-red-500 text-xs mt-1">
          {get(errors, name)}
        </div>
      )}
    </div>
  );
};
