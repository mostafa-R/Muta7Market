import ApiError from "../utils/ApiError.js";

const validateFormData = (schema) => {
  return async (req, res, next) => {
    try {
      const parsedBody = {};

      const isFormData = req.headers["content-type"]?.includes(
        "multipart/form-data"
      );

      if (isFormData) {
        for (const key in req.body) {
          try {
            if (
              typeof req.body[key] === "string" &&
              (req.body[key].startsWith("{") || req.body[key].startsWith("["))
            ) {
              parsedBody[key] = JSON.parse(req.body[key]);
            } else {
              parsedBody[key] = req.body[key];
            }
          } catch (err) {
            parsedBody[key] = req.body[key];
          }
        }
      } else {
        Object.assign(parsedBody, req.body);
      }

      const { value, error } = schema.validate(parsedBody, {
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

      req.validatedBody = value;

      next();
    } catch (error) {
      return next(new ApiError(400, "Error processing form data"));
    }
  };
};

export default validateFormData;
