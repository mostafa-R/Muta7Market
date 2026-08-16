import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LANGUAGES, DEFAULT_LOCALE } from '../config/constants.js';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dictionaries = {};
LANGUAGES.forEach((lang) => {
  const filePath = path.join(__dirname, `./locales/${lang}.json`);
  try {
    dictionaries[lang] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    logger.error(`Failed to load locale file ${lang}.json:`, err.message);
    dictionaries[lang] = {};
  }
});

function resolvePath(obj, key) {
  return key.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), obj);
}

export function translate(locale, key, params = {}) {
  const lang = LANGUAGES.includes(locale) ? locale : DEFAULT_LOCALE;
  let template = resolvePath(dictionaries[lang], key);

  if (template === undefined || template === null || typeof template === 'object') {
    template = resolvePath(dictionaries[DEFAULT_LOCALE], key);
  }
  if (typeof template !== 'string') return key;

  return template.replace(/\{\{(\w+)\}\}/g, (match, name) => (params[name] !== undefined ? String(params[name]) : match));
}

export function detectLocale(req, userLang) {
  const candidates = [
    req?.query?.lang,
    req?.body?.lang,
    req?.headers?.['x-lang'],
    req?.cookies?.lang,
  ];
  for (const candidate of candidates) {
    if (candidate && LANGUAGES.includes(String(candidate).toLowerCase())) {
      return String(candidate).toLowerCase();
    }
  }
  if (userLang && LANGUAGES.includes(userLang)) return userLang;
  const accept = req?.headers?.['accept-language'];
  if (accept) {
    const preferred = accept.split(',')[0]?.trim().toLowerCase().slice(0, 2);
    if (LANGUAGES.includes(preferred)) return preferred;
  }
  return DEFAULT_LOCALE;
}

export function getAllTranslations(lang = DEFAULT_LOCALE) {
  return dictionaries[lang] || dictionaries[DEFAULT_LOCALE];
}
