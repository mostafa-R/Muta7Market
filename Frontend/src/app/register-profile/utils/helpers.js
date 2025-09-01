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

  if (fields.includes("game") && (!values.game || values.game.trim() === "")) {
    errors.game = t("sportsValidation.sportRequired");
  }

  if (
    fields.includes("game") &&
    values.game === "other" &&
    (!values.customSport || values.customSport.trim() === "")
  ) {
    errors.customSport = t("sportsValidation.customSportRequired");
  }

  if (
    fields.includes("roleType") &&
    values.jop &&
    (!values.roleType || values.roleType.trim() === "")
  ) {
    errors.roleType = t("sportsValidation.roleTypeRequired");
  }

  if (
    fields.includes("roleType") &&
    values.roleType === "other" &&
    (!values.customRoleType || values.customRoleType.trim() === "")
  ) {
    errors.customRoleType = t("sportsValidation.customRoleTypeRequired");
  }

  if (
    fields.includes("position") &&
    values.jop === "player" &&
    (!values.position || values.position.trim() === "")
  ) {
    errors.position = t("sportsValidation.positionRequired");
  }

  if (
    fields.includes("position") &&
    values.jop === "player" &&
    values.position === "other" &&
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
