// utils/validateWithJoi.js

export const validateWithJoi = (schema) => (values) => {
  const { error } = schema.validate(values, { abortEarly: false });
  if (!error) return {};

  const errors = {};
  error.details.forEach((err) => {
    const field = err.path[0];
    if (!errors[field]) {
      errors[field] = err.message;
    }
  });
  return errors;
};
