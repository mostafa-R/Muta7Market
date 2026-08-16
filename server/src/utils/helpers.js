export const pick = (obj, keys) => {
  if (!obj || typeof obj !== 'object') return {};
  const result = {};
  keys.forEach((key) => {
    if (obj[key] !== undefined) result[key] = obj[key];
  });
  return result;
};

export const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

export const deepMerge = (target, source) => {
  if (!isObject(target) || !isObject(source)) return source;
  const output = { ...target };
  Object.keys(source).forEach((key) => {
    if (isObject(source[key]) && isObject(target[key])) output[key] = deepMerge(target[key], source[key]);
    else output[key] = source[key];
  });
  return output;
};

export const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
};

export const cleanObj = (obj) => {
  const out = {};
  Object.keys(obj).forEach((key) => {
    const v = obj[key];
    if (v !== undefined && v !== null && v !== '') {
      if (typeof v === 'object' && !Array.isArray(v)) out[key] = cleanObj(v);
      else out[key] = v;
    }
  });
  return out;
};

export const stripHtml = (html) => String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
