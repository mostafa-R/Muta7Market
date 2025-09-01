import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { sectionRequiredFields } from "../utils/constants";
import { validateFields } from "../utils/helpers";

export const useFormSteps = (formik) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
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

  const getFilteredSections = () => {
    const userStatus = formik.values.status;

    if (userStatus === "available") {
      return allFormSections.filter((section) => section.id !== "transfer");
    }
    return allFormSections;
  };

  const formSections = getFilteredSections();

  const prevStatusRef = React.useRef(formik.values.status);

  React.useEffect(() => {
    const userStatus = formik.values.status;
    const prevStatus = prevStatusRef.current;

    if (userStatus === "available" && prevStatus !== "available") {
      const transferIndex = allFormSections.findIndex(
        (section) => section.id === "transfer"
      );
      setCurrentStep((currentStep) => {
        if (currentStep > transferIndex) {
          return currentStep - 1;
        }
        return currentStep;
      });
    }

    prevStatusRef.current = userStatus;
  }, [formik.values.status, allFormSections]);

  const nextStep = async () => {
    const currentSection = formSections[currentStep].id;
    const requiredFields = sectionRequiredFields[currentSection] || [];

    requiredFields.forEach((field) => {
      formik.setFieldTouched(field, true, true);
    });

    if (
      requiredFields.includes("nationality") &&
      formik.values.nationality === "other"
    ) {
      formik.setFieldTouched("customNationality", true, true);
    }

    if (
      requiredFields.includes("birthCountry") &&
      formik.values.birthCountry === "other"
    ) {
      formik.setFieldTouched("customBirthCountry", true, true);
    }

    if (requiredFields.includes("position") && formik.values.jop === "player") {
      formik.setFieldTouched("position", true, true);
    }

    if (formik.values.jop === "player" && formik.values.position === "other") {
      formik.setFieldTouched("customPosition", true, true);
    }

    const _errors = await formik.validateForm();

    const customErrors = validateFields(requiredFields, formik.values, t);

    const mergedErrors = { ..._errors, ...customErrors };
    const currentSectionErrors = {};

    if (mergedErrors && Object.keys(mergedErrors).length > 0) {
      Object.keys(mergedErrors).forEach((path) => {
        if (requiredFields.includes(path)) {
          currentSectionErrors[path] = mergedErrors[path];
        }
        if (
          path === "customNationality" &&
          requiredFields.includes("nationality") &&
          formik.values.nationality === "other"
        ) {
          currentSectionErrors[path] = mergedErrors[path];
        }
        if (
          path === "customBirthCountry" &&
          requiredFields.includes("birthCountry") &&
          formik.values.birthCountry === "other"
        ) {
          currentSectionErrors[path] = mergedErrors[path];
        }
        if (
          path === "position" &&
          requiredFields.includes("position") &&
          formik.values.jop === "player"
        ) {
          currentSectionErrors[path] = mergedErrors[path];
        }
        if (
          path === "customPosition" &&
          formik.values.jop === "player" &&
          formik.values.position === "other"
        ) {
          currentSectionErrors[path] = mergedErrors[path];
        }
        if (
          path === "customRoleType" &&
          requiredFields.includes("roleType") &&
          formik.values.roleType === "other"
        ) {
          currentSectionErrors[path] = mergedErrors[path];
        }
        if (
          path === "customSport" &&
          requiredFields.includes("game") &&
          formik.values.game === "other"
        ) {
          currentSectionErrors[path] = mergedErrors[path];
        }
      });
    }

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
