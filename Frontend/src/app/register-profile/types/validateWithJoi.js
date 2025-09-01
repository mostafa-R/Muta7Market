
export const validateWithJoi = (schema) => (values) => {
  const { error } = schema.validate(values, {
    abortEarly: false,
    allowUnknown: true,
  });
  if (!error) return {};

  const errors = {};
  error.details.forEach((err) => {
    const path = Array.isArray(err.path)
      ? err.path.join(".")
      : String(err.path || "");
    if (path && !errors[path]) {
      errors[path] = err.message;
    }
  });
  return errors;
};
