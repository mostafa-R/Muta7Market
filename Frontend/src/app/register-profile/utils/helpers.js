export const getSuccessMessage = (response, fallback) => {
  return (
    response?.data?.message ||
    response?.data?.msg ||
    response?.message ||
    fallback
  );
};

export const getErrorMessage = (error, fallback) => {
  const errorData = error?.response?.data;

  if (errorData?.error?.message) {
    return errorData.error.message;
  }

  if (errorData?.message) {
    return errorData.message;
  }

  if (errorData?.error && typeof errorData.error === "string") {
    return errorData.error;
  }

  return error?.message || fallback;
};

export const handleFileValidation = (file, allowedTypes, maxSize, t) => {
  if (!file) return t("fileValidation.noFileSelected");
  if (!allowedTypes.includes(file.type))
    return t("fileValidation.unsupportedFileType");
  if (file.size > maxSize) return t("fileValidation.fileTooLarge");
  return null;
};

export const validateFields = (fields, values, t) => {
  const errors = {};

  if (fields.includes("name") && (!values.name || values.name.trim() === "")) {
    errors.name = t("fieldValidation.nameRequired");
  }

  if (fields.includes("age")) {
    if (!values.age || values.age === "") {
      errors.age = t("fieldValidation.ageRequired");
    } else if (isNaN(Number(values.age))) {
      errors.age = t("fieldValidation.ageMustBeNumber");
    } else if (Number(values.age) < 15 || Number(values.age) > 50) {
      errors.age = t("fieldValidation.ageRange");
    }
  }

  if (fields.includes("gender") && !values.gender) {
    errors.gender = t("fieldValidation.genderRequired");
  }

  if (
    fields.includes("nationality") &&
    (!values.nationality || values.nationality.trim() === "")
  ) {
    errors.nationality = t("fieldValidation.nationalityRequired");
  }

  if (
    fields.includes("nationality") &&
    values.nationality === "other" &&
    (!values.customNationality || values.customNationality.trim() === "")
  ) {
    errors.customNationality = t("fieldValidation.customNationalityRequired");
  }

  if (
    fields.includes("birthCountry") &&
    (!values.birthCountry || values.birthCountry.trim() === "")
  ) {
    errors.birthCountry = t("fieldValidation.birthCountryRequired");
  }

  if (
    fields.includes("birthCountry") &&
    values.birthCountry === "other" &&
    (!values.customBirthCountry || values.customBirthCountry.trim() === "")
  ) {
    errors.customBirthCountry = t("fieldValidation.customBirthCountryRequired");
  }

  if (fields.includes("game")) {
    const gameValue = getGameValue(values.game);
    if (!gameValue || gameValue.trim() === "") {
      errors.game = t("sportsValidation.sportRequired");
    }
  }

  if (
    fields.includes("game") &&
    isOtherGame(values.game) &&
    (!values.customSport || values.customSport.trim() === "")
  ) {
    errors.customSport = t("sportsValidation.customSportRequired");
  }

  if (
    fields.includes("roleType") &&
    values.jop &&
    (!values.roleType || getRoleTypeValue(values.roleType).trim() === "")
  ) {
    errors.roleType = t("sportsValidation.roleTypeRequired");
  }

  if (
    fields.includes("roleType") &&
    isOtherRoleType(values.roleType) &&
    (!values.customRoleType || values.customRoleType.trim() === "")
  ) {
    errors.customRoleType = t("sportsValidation.customRoleTypeRequired");
  }

  if (
    fields.includes("position") &&
    values.jop === "player" &&
    (!values.position || getPositionValue(values.position).trim() === "")
  ) {
    errors.position = t("sportsValidation.positionRequired");
  }

  if (
    fields.includes("position") &&
    values.jop === "player" &&
    isOtherPosition(values.position) &&
    (!values.customPosition || values.customPosition.trim() === "")
  ) {
    errors.customPosition = t("sportsValidation.customPositionRequired");
  }

  if (fields.includes("jop")) {
    if (!values.jopSelected) {
      errors.jop = t("sportsValidation.categoryRequired");
    } else if (!values.jop || !["player", "coach"].includes(values.jop)) {
      errors.jop = t("sportsValidation.categoryInvalid");
    }
  }

  if (fields.includes("status")) {
    if (!values.statusSelected) {
      errors.status = t("sportsValidation.statusRequired");
    } else if (
      !values.status ||
      !["available", "contracted", "transferred"].includes(values.status)
    ) {
      errors.status = t("sportsValidation.statusInvalid");
    }
  }
  if (fields.includes("agreeToTerms") && !values.agreeToTerms) {
    errors.agreeToTerms = t("sportsValidation.termsAcceptanceRequired");
  }
  return errors;
};

/**
 * Get the slug/value from a game field that can be either string or object
 * @param {string|object} game - The game value from form
 * @returns {string} - The game slug/value
 */
export const getGameValue = (game) => {
  if (!game) return "";
  if (typeof game === "string") return game;
  if (typeof game === "object" && game.slug) return game.slug;
  return "";
};

/**
 * Check if the game value represents "other"
 * @param {string|object} game - The game value from form
 * @returns {boolean} - True if game is "other"
 */
export const isOtherGame = (game) => {
  const gameValue = getGameValue(game);
  return gameValue === "other";
};

/**
 * Get the slug/value from a roleType field that can be either string or object
 * @param {string|object} roleType - The roleType value from form
 * @returns {string} - The roleType slug/value
 */
export const getRoleTypeValue = (roleType) => {
  if (!roleType) return "";
  if (typeof roleType === "string") return roleType;
  if (typeof roleType === "object" && roleType.slug) return roleType.slug;
  return "";
};

/**
 * Check if the roleType value represents "other"
 * @param {string|object} roleType - The roleType value from form
 * @returns {boolean} - True if roleType is "other"
 */
export const isOtherRoleType = (roleType) => {
  const roleTypeValue = getRoleTypeValue(roleType);
  return roleTypeValue === "other";
};

/**
 * Get the slug/value from a position field that can be either string or object
 * @param {string|object} position - The position value from form
 * @returns {string} - The position slug/value
 */
export const getPositionValue = (position) => {
  if (!position) return "";
  if (typeof position === "string") return position;
  if (typeof position === "object" && position.slug) return position.slug;
  return "";
};

/**
 * Check if the position value represents "other"
 * @param {string|object} position - The position value from form
 * @returns {boolean} - True if position is "other"
 */
export const isOtherPosition = (position) => {
  const positionValue = getPositionValue(position);
  return positionValue === "other";
};
