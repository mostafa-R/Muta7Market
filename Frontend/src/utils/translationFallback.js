/**
 * Helper function to extract string value from multilingual objects or strings
 * @param {string|object} value - The value to extract string from
 * @returns {string} - String value for translation keys
 */
const getStringValue = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    // For multilingual objects, prefer slug for translation keys
    if (value.slug) return value.slug;
    if (value.en) return value.en;
    if (value.ar) return value.ar;
  }
  return String(value);
};

/**
 * Helper function to get display value from multilingual objects
 * @param {string|object} value - The value to get display text from
 * @param {string} language - Current language (ar/en)
 * @returns {string} - Display value in appropriate language
 */
const getDisplayValue = (value, language = "en") => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    // For multilingual objects, prefer current language
    if (language === "ar" && value.ar) return value.ar;
    if (language === "en" && value.en) return value.en;
    if (value.ar) return value.ar;
    if (value.en) return value.en;
  }
  return String(value);
};

/**

 * @param {Function} t 
 * @param {string} key 
 * @param {string} fallback 
 * @returns {string} 
 */
export const tFallback = (t, key, fallback = null) => {
  const translated = t(key);

  if (translated === key) {
    return fallback || extractTextFromKey(key);
  }

  return translated;
};

/**

 * @param {string} key 
 * @returns {string} 
 */
const extractTextFromKey = (key) => {
  const lastPart = key.split(".").pop();

  return lastPart
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

/**

 * @param {Function} t 
 * @param {string|object} position 
 * @param {string|object} sport
 * @param {string} language - Current language (ar/en)
 * @returns {string} 
 */
export const translatePosition = (
  t,
  position,
  sport = null,
  language = "en"
) => {
  if (!position) return "";

  // Check if position is already a multilingual object with display value
  if (typeof position === "object" && (position.ar || position.en)) {
    return getDisplayValue(position, language);
  }

  const positionStringValue = getStringValue(position);
  const positionKey = positionStringValue.toLowerCase().replace(/\s+/g, "");

  if (sport) {
    const sportStringValue = getStringValue(sport);
    const sportKey = sportStringValue.toLowerCase();
    const fullKey = `positions.${sportKey}.${positionKey}`;
    const translated = t(fullKey);

    if (translated !== fullKey) {
      return translated;
    }
  }

  const generalKey = `positions.${positionKey}`;
  return tFallback(t, generalKey, positionStringValue);
};

/**
 * @param {Function} t
 * @param {string|object} sport
 * @param {string} language - Current language (ar/en)
 * @returns {string}
 */
export const translateSport = (t, sport, language = "en") => {
  if (!sport) return "";

  // Check if sport is already a multilingual object with display value
  if (typeof sport === "object" && (sport.ar || sport.en)) {
    return getDisplayValue(sport, language);
  }

  const sportStringValue = getStringValue(sport);
  const sportKey = sportStringValue.toLowerCase();
  return tFallback(t, `sports.${sportKey}`, sportStringValue);
};

/**
 * @param {Function} t
 * @param {string|object} nationality
 * @returns {string}
 */
export const translateNationality = (t, nationality) => {
  if (!nationality) return "";

  // Check if nationality is already a multilingual object with display value
  if (typeof nationality === "object" && (nationality.ar || nationality.en)) {
    return getDisplayValue(nationality);
  }

  const nationalityStringValue = getStringValue(nationality);
  const nationalityKey = nationalityStringValue.toLowerCase();
  return tFallback(
    t,
    `nationalities.${nationalityKey}`,
    nationalityStringValue
  );
};

/**
 * @param {Function} t
 * @param {string|object} role
 * @returns {string}
 */
export const translatePlayerRole = (t, role) => {
  if (!role) return "";

  // Check if role is already a multilingual object with display value
  if (typeof role === "object" && (role.ar || role.en)) {
    return getDisplayValue(role);
  }

  const roleStringValue = getStringValue(role);
  const roleKey = roleStringValue.toLowerCase().replace(/\s+/g, "");
  return tFallback(t, `playerRoles.${roleKey}`, roleStringValue);
};

/**
 * @param {Function} t
 * @param {string|object} role
 * @returns {string}
 */
export const translateCoachRole = (t, role) => {
  if (!role) return "";

  // Check if role is already a multilingual object with display value
  if (typeof role === "object" && (role.ar || role.en)) {
    return getDisplayValue(role);
  }

  const roleStringValue = getStringValue(role);
  const roleKey = roleStringValue.toLowerCase().replace(/\s+/g, "");
  return tFallback(t, `coachRoles.${roleKey}`, roleStringValue);
};
