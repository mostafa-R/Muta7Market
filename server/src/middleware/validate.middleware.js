import { translate } from '../i18n/index.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { detectLocale } from '../i18n/index.js';

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data = req[source] || {};
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const lang = detectLocale(req, req.user?.lang);
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      const firstKey = error.details[0]?.type === 'any.required' ? 'validation.fieldRequired' : 'validation.invalidData';
      const msg = translate(lang, firstKey, { field: error.details[0]?.path.join('.') || '' });
      const err = new ApiError(422, firstKey, {}, msg);
      err.details = details;
      return next(err);
    }

    req[source] = value;
    next();
  };
}

export function validateParams(schema) {
  return validate(schema, 'params');
}

export function validateQuery(schema) {
  return validate(schema, 'query');
}
