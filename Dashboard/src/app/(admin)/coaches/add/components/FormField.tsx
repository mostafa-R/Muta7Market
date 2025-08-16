// components/FormField.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { get } from "lodash";

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  formik: any; // يتم تمرير formik كـ prop
}

export const FormField = ({
  label,
  name,
  type = "text",
  placeholder,
  required,
  formik,
}: FormFieldProps) => {
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
