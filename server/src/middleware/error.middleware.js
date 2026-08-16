import { logger } from '../utils/logger.js';
import { translate, detectLocale } from '../i18n/index.js';
import { ApiError } from '../utils/ApiError.js';
import { config } from '../config/env.js';

const configIsProd = config.isProduction;

export function notFoundHandler(req, res, next) {
  next(new ApiError(404, 'common.notFound', {}, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, req, res, next) {
  const lang = detectLocale(req, req.user?.lang);

  if (err?.name === 'MulterError') {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({
      success: false,
      statusCode: status,
      message: status === 413 ? translate(lang, 'media.tooLarge') : translate(lang, 'media.invalidType'),
    });
  }

  if (err?.name === 'CastError') {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: translate(lang, 'common.invalidId'),
    });
  }

  if (err?.name === 'ValidationError' && err?.errors) {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(422).json({
      success: false,
      statusCode: 422,
      message: translate(lang, 'common.validationError'),
      details,
    });
  }

  if (err?.code === 11000) {
    return res.status(409).json({
      success: false,
      statusCode: 409,
      message: translate(lang, 'common.conflict'),
    });
  }

  if (err?.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      statusCode: 413,
      message: translate(lang, 'media.tooLarge'),
    });
  }

  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;
  const message = isApiError ? translate(lang, err.key, err.params) || err.message : translate(lang, 'common.serverError');

  if (!isApiError || statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} -> ${statusCode} :: ${err.message || err}`, {
      stack: err.stack,
      body: configIsProd ? undefined : req.body,
    });
  }

  const body = { success: false, statusCode, message };
  if (isApiError && err.details) body.details = err.details;

  res.status(statusCode).json(body);
}
