// Helper functions for API response handling
export const getSuccessMessage = (response, fallback) => {
  return (
    response?.data?.message ||
    response?.data?.msg ||
    response?.message ||
    fallback
  );
};

export const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

// File validation helper
export const handleFileValidation = (file, allowedTypes, maxSize, t) => {
  if (!file) return t("fileValidation.noFileSelected");
  if (!allowedTypes.includes(file.type))
    return t("fileValidation.unsupportedFileType");
  if (file.size > maxSize) return t("fileValidation.fileTooLarge");
  return null;
};

// Form validation helpers
export const validateFields = (fields, values, t) => {
  const errors = {};

  // Personal section validations
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

  // Conditional validation for custom nationality when "other" is selected
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

  // Conditional validation for custom birth country when "other" is selected
  if (
    fields.includes("birthCountry") &&
    values.birthCountry === "other" &&
    (!values.customBirthCountry || values.customBirthCountry.trim() === "")
  ) {
    errors.customBirthCountry = t("fieldValidation.customBirthCountryRequired");
  }

  // Sports section validations
  if (fields.includes("game") && (!values.game || values.game.trim() === "")) {
    errors.game = t("sportsValidation.sportRequired");
  }

  // Position validation - only required for players, not coaches
  if (
    fields.includes("position") &&
    values.jop === "player" &&
    (!values.position || values.position.trim() === "")
  ) {
    errors.position = t("sportsValidation.positionRequired");
  }

  // Custom position validation - required when position is "other"
  // This ensures users cannot proceed if they select "Other" but leave custom position empty
  if (
    fields.includes("position") &&
    values.position === "other" &&
    (!values.customPosition || values.customPosition.trim() === "")
  ) {
    errors.customPosition = t("sportsValidation.customPositionRequired");
  }

  // Strengthen jop validation - must be explicitly selected by user
  if (fields.includes("jop")) {
    if (!values.jopSelected) {
      errors.jop = t("sportsValidation.categoryRequired");
    } else if (!values.jop || !["player", "coach"].includes(values.jop)) {
      errors.jop = t("sportsValidation.categoryInvalid");
    }
  }

  // Strengthen status validation - must be explicitly selected by user
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

  // Terms section validation
  if (fields.includes("agreeToTerms") && !values.agreeToTerms) {
    errors.agreeToTerms = t("sportsValidation.termsAcceptanceRequired");
  }

  return errors;
};
