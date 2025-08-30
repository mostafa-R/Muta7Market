import ApiError from "../utils/ApiError.js";

const validate = (schema) => {
  return (req, res, next) => {
    const { value, error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true, 
    });

    if (error) {
      const errors = {};
      for (const err of error.details) {
        const key = err.path.join("."); 
        if (!errors[key]) errors[key] = [];
        errors[key].push(err.message);
      }
      return next(new ApiError(400, "Validation Error", true, errors));
    }

    req.body = value; 
    next();
  };
};

export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { value, error } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors = {};
      for (const err of error.details) {
        const key = err.path.join(".");
        if (!errors[key]) errors[key] = [];
        errors[key].push(err.message);
      }
      return next(new ApiError(400, "Query Validation Error", true, errors));
    }

    req.query = value;
    next();
  };
};

export default validate;
