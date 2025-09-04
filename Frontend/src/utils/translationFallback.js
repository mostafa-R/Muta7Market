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
 * @param {string} position 
 * @param {string} sport
 * @returns {string} 
 */
export const translatePosition = (t, position, sport = null) => {
  if (!position) return "";

  const positionKey = position.toLowerCase().replace(/\s+/g, "");

  if (sport) {
    const sportKey = sport.toLowerCase();
    const fullKey = `positions.${sportKey}.${positionKey}`;
    const translated = t(fullKey);

    if (translated !== fullKey) {
      return translated;
    }
  }

  const generalKey = `positions.${positionKey}`;
  return tFallback(t, generalKey, position);
};

/**
 * @param {Function} t 
 * @param {string} sport
 * @returns {string} 
 */
export const translateSport = (t, sport) => {
  if (!sport) return "";

  const sportKey = sport.toLowerCase();
  return tFallback(t, `sports.${sportKey}`, sport);
};

/**
 * @param {Function} t
 * @param {string} nationality
 * @returns {string} 
 */
export const translateNationality = (t, nationality) => {
  if (!nationality) return "";

  const nationalityKey = nationality.toLowerCase();
  return tFallback(t, `nationalities.${nationalityKey}`, nationality);
};

/**
 * @param {Function} t 
 * @param {string} role
 * @returns {string}
 */
export const translatePlayerRole = (t, role) => {
  if (!role) return "";

  const roleKey = role.toLowerCase().replace(/\s+/g, "");
  return tFallback(t, `playerRoles.${roleKey}`, role);
};

/**
 * @param {Function} t 
 * @param {string} role 
 * @returns {string} 
 */
export const translateCoachRole = (t, role) => {
  if (!role) return "";

  const roleKey = role.toLowerCase().replace(/\s+/g, "");
  return tFallback(t, `coachRoles.${roleKey}`, role);
};
