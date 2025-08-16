// utils/validateWithJoi.ts
import Joi from "joi";

export const validateWithJoi = (schema: Joi.ObjectSchema) => (values: any) => {
  const { error } = schema.validate(values, { abortEarly: false });
  if (!error) return {};

  const errors: Record<string, string> = {};
  error.details.forEach((err) => {
    const field = err.path[0];
    if (!errors[field]) {
      errors[field] = err.message;
    }
  });
  return errors;
};
