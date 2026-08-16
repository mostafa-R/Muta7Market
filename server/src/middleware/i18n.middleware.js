import { detectLocale, translate } from '../i18n/index.js';

export function i18nMiddleware(req, res, next) {
  const userLang = req.user?.lang;
  const lang = detectLocale(req, userLang);
  req.lang = lang;
  res.locals.lang = lang;
  req.t = (key, params = {}) => translate(lang, key, params);
  res.t = req.t;
  next();
}
