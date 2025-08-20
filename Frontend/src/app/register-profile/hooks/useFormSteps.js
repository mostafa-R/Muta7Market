import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { sectionRequiredFields } from "../utils/constants";
import { validateFields } from "../utils/helpers";

export const useFormSteps = (formik) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  // All possible form sections - memoized to prevent dependency issues
  const allFormSections = useMemo(
    () => [
      {
        id: "personal",
        title: t("registerProfile.sections.personal"),
        icon: "👤",
      },
      { id: "sports", title: t("registerProfile.sections.sports"), icon: "🏆" },
      {
        id: "financial",
        title: t("registerProfile.sections.financial"),
        icon: "💰",
      },
      {
        id: "transfer",
        title: t("registerProfile.sections.transfer"),
        icon: "🔄",
      },
      {
        id: "contact",
        title: t("registerProfile.sections.contact"),
        icon: "📞",
      },
      { id: "social", title: t("registerProfile.sections.social"), icon: "🔗" },
      { id: "media", title: t("registerProfile.sections.media"), icon: "📎" },
      { id: "terms", title: t("registerProfile.sections.terms"), icon: "📝" },
    ],
    [t]
  );

  // Filter sections based on user status
  const getFilteredSections = () => {
    const userStatus = formik.values.status;

    // If user status is "available", exclude transfer section
    if (userStatus === "available") {
      return allFormSections.filter((section) => section.id !== "transfer");
    }

    // For other statuses (contracted, transferred) or when no status selected yet, show all sections
    return allFormSections;
  };

  const formSections = getFilteredSections();

  // Track previous status to detect actual changes
  const prevStatusRef = React.useRef(formik.values.status);

  // Handle status change effects on current step
  React.useEffect(() => {
    const userStatus = formik.values.status;
    const prevStatus = prevStatusRef.current;

    // Only adjust if status actually changed TO "available" from something else
    if (userStatus === "available" && prevStatus !== "available") {
      const transferIndex = allFormSections.findIndex(
        (section) => section.id === "transfer"
      );

      // If current step is after transfer section, adjust the index down by 1
      setCurrentStep((currentStep) => {
        if (currentStep > transferIndex) {
          return currentStep - 1;
        }
        return currentStep;
      });
    }

    // Update previous status reference
    prevStatusRef.current = userStatus;
  }, [formik.values.status, allFormSections]);

  const nextStep = async () => {
    const currentSection = formSections[currentStep].id;
    const requiredFields = sectionRequiredFields[currentSection] || [];

    // Mark required fields as touched
    requiredFields.forEach((field) => {
      formik.setFieldTouched(field, true, true);
    });

    // Also mark customNationality as touched if nationality is "other"
    if (
      requiredFields.includes("nationality") &&
      formik.values.nationality === "other"
    ) {
      formik.setFieldTouched("customNationality", true, true);
    }

    // Also mark customBirthCountry as touched if birthCountry is "other"
    if (
      requiredFields.includes("birthCountry") &&
      formik.values.birthCountry === "other"
    ) {
      formik.setFieldTouched("customBirthCountry", true, true);
    }

    // Also mark position as touched if user is a player
    if (requiredFields.includes("position") && formik.values.jop === "player") {
      formik.setFieldTouched("position", true, true);
    }

    // Also mark customPosition as touched if position is "other" and user is a player
    // This ensures validation for custom position field when "Other" option is selected
    if (formik.values.jop === "player" && formik.values.position === "other") {
      formik.setFieldTouched("customPosition", true, true);
    }

    // Use both Joi validation and our custom validation
    const _errors = await formik.validateForm();

    // Add our custom validation
    const customErrors = validateFields(requiredFields, formik.values, t);

    // Merge errors
    const mergedErrors = { ..._errors, ...customErrors };
    const currentSectionErrors = {};

    // Filter errors for current section only
    if (mergedErrors && Object.keys(mergedErrors).length > 0) {
      Object.keys(mergedErrors).forEach((path) => {
        if (requiredFields.includes(path)) {
          currentSectionErrors[path] = mergedErrors[path];
        }
        // Special case: include customNationality error when nationality is "other"
        if (
          path === "customNationality" &&
          requiredFields.includes("nationality") &&
          formik.values.nationality === "other"
        ) {
          currentSectionErrors[path] = mergedErrors[path];
        }
        // Special case: include customBirthCountry error when birthCountry is "other"
        if (
          path === "customBirthCountry" &&
          requiredFields.includes("birthCountry") &&
          formik.values.birthCountry === "other"
        ) {
          currentSectionErrors[path] = mergedErrors[path];
        }
        // Special case: include position error when user is a player
        if (
          path === "position" &&
          requiredFields.includes("position") &&
          formik.values.jop === "player"
        ) {
          currentSectionErrors[path] = mergedErrors[path];
        }
        // Special case: include customPosition error when position is "other" and user is a player
        if (
          path === "customPosition" &&
          formik.values.jop === "player" &&
          formik.values.position === "other"
        ) {
          currentSectionErrors[path] = mergedErrors[path];
        }
        // Special case: include customRoleType error when roleType is "other"
        if (
          path === "customRoleType" &&
          requiredFields.includes("roleType") &&
          formik.values.roleType === "other"
        ) {
          currentSectionErrors[path] = mergedErrors[path];
        }
        // Special case: include customSport error when sport is "other"
        if (
          path === "customSport" &&
          requiredFields.includes("game") &&
          formik.values.game === "other"
        ) {
          currentSectionErrors[path] = mergedErrors[path];
        }
      });
    }

    // Check if current section has validation errors
    if (Object.keys(currentSectionErrors).length > 0) {
      const firstError =
        currentSectionErrors[Object.keys(currentSectionErrors)[0]];
      toast.error(
        typeof firstError === "string"
          ? firstError
          : t("formValidation.reviewRequiredFields")
      );
      return;
    }

    // Proceed to next step if validation passes
    if (currentStep < formSections.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // Custom function to handle direct step navigation (for step indicators)
  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < formSections.length) {
      setCurrentStep(stepIndex);
      window.scrollTo(0, 0);
    }
  };

  return {
    currentStep,
    setCurrentStep: goToStep,
    formSections,
    nextStep,
    prevStep,
  };
};
