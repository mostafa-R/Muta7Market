import {
  prepareMediaFormData,
  processMediaResponse,
} from "@/app/utils/mediaUtils";
import axios from "axios";
import { useFormik } from "formik";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
// Updated imports to use new organized schema structure
import { playerFormSchema } from "../schemas/playerFormSchema";
import { validateWithJoi } from "../types/validateWithJoi";
import { initialFormValues } from "../utils/constants";
import { getErrorMessage, getSuccessMessage } from "../utils/helpers";

export const usePlayerForm = (idParam, router) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [canPay, setCanPay] = useState(false);
  const [player, setPlayer] = useState(null);
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const dataLoadedRef = useRef(false);

  const formik = useFormik({
    initialValues: initialFormValues,
    validateOnChange: true,
    validateOnBlur: true,
    validate: (values) => {
      try {
        // First use Joi for schema validation
        const joiErrors = validateWithJoi(playerFormSchema)(values);

        // Additional manual validation for all required fields
        const errors = { ...joiErrors };

        // Personal section validation
        if (!values.name || values.name.trim() === "") {
          errors.name = t("formValidation.nameRequired");
        }

        if (!values.age || isNaN(Number(values.age))) {
          errors.age = t("formValidation.ageRequired");
        } else if (Number(values.age) < 15 || Number(values.age) > 50) {
          errors.age = t("formValidation.ageRange");
        }

        if (!values.gender) {
          errors.gender = t("formValidation.genderRequired");
        }

        if (!values.nationality || values.nationality.trim() === "") {
          errors.nationality = t("formValidation.nationalityRequired");
        } else {
          // Validate against allowed nationality values
          const validNationalities = [
            "saudi",
            "uae",
            "egypt",
            "morocco",
            "kuwait",
            "qatar",
            "bahrain",
            "oman",
            "jordan",
            "lebanon",
            "syria",
            "iraq",
            "libya",
            "tunisia",
            "algeria",
            "sudan",
            "yemen",
            "other",
          ];
          if (!validNationalities.includes(values.nationality)) {
            errors.nationality = t("formValidation.nationalityInvalid");
          }
        }

        // Birth Country validation
        if (!values.birthCountry || values.birthCountry.trim() === "") {
          errors.birthCountry = t("formValidation.birthCountryRequired");
        } else {
          // Validate against allowed birth country values
          const validCountries = [
            "saudi",
            "uae",
            "egypt",
            "morocco",
            "kuwait",
            "qatar",
            "bahrain",
            "oman",
            "jordan",
            "lebanon",
            "syria",
            "iraq",
            "libya",
            "tunisia",
            "algeria",
            "sudan",
            "yemen",
            "other",
          ];
          if (!validCountries.includes(values.birthCountry)) {
            errors.birthCountry = t("formValidation.birthCountryInvalid");
          }
        }

        // Custom nationality validation when "other" is selected
        if (values.nationality === "other") {
          // Always validate when nationality is "other" - this is a required field
          if (
            !values.customNationality ||
            values.customNationality.trim() === ""
          ) {
            errors.customNationality = t(
              "formValidation.customNationalityRequired"
            );
          } else if (values.customNationality.trim().length < 2) {
            errors.customNationality = t(
              "formValidation.customNationalityTooShort"
            );
          } else if (values.customNationality.trim().length > 50) {
            errors.customNationality = t(
              "formValidation.customNationalityTooLong"
            );
          }
        }

        // Custom birth country validation when "other" is selected
        if (values.birthCountry === "other") {
          // Always validate when birthCountry is "other" - this is a required field
          if (
            !values.customBirthCountry ||
            values.customBirthCountry.trim() === ""
          ) {
            errors.customBirthCountry = t(
              "formValidation.customBirthCountryRequired"
            );
          } else if (values.customBirthCountry.trim().length < 2) {
            errors.customBirthCountry = t(
              "formValidation.customBirthCountryTooShort"
            );
          } else if (values.customBirthCountry.trim().length > 50) {
            errors.customBirthCountry = t(
              "formValidation.customBirthCountryTooLong"
            );
          }
        }

        // Sports section validation
        if (!values.game || values.game.trim() === "") {
          errors.game = t("sportsValidation.sportRequired");
        }

        // Custom sport validation when "other" is selected
        if (values.game === "other") {
          if (!values.customSport || values.customSport.trim() === "") {
            errors.customSport = t("sportsValidation.customSportRequired");
          } else if (values.customSport.trim().length < 2) {
            errors.customSport = t("sportsValidation.customSportTooShort");
          } else if (values.customSport.trim().length > 50) {
            errors.customSport = t("sportsValidation.customSportTooLong");
          }
        }

        if (!values.jop) {
          errors.jop = t("sportsValidation.categoryRequired");
        }

        // Role type validation when category (jop) is selected
        if (values.jop && (!values.roleType || values.roleType.trim() === "")) {
          errors.roleType = t("sportsValidation.roleTypeRequired");
        }

        // Custom role type validation when "other" is selected
        if (values.roleType === "other") {
          if (!values.customRoleType || values.customRoleType.trim() === "") {
            errors.customRoleType = t(
              "sportsValidation.customRoleTypeRequired"
            );
          } else if (values.customRoleType.trim().length < 2) {
            errors.customRoleType = t(
              "sportsValidation.customRoleTypeTooShort"
            );
          } else if (values.customRoleType.trim().length > 50) {
            errors.customRoleType = t("sportsValidation.customRoleTypeTooLong");
          }
        }

        // Position validation - only required for players, not coaches
        if (values.jop === "player") {
          if (!values.position || values.position.trim() === "") {
            errors.position = t("sportsValidation.positionRequired");
          } else if (values.position.length < 2) {
            errors.position = t("sportsValidation.positionTooShort");
          }
        }

        // Custom position validation when "other" is selected (only for players)
        if (values.jop === "player" && values.position === "other") {
          if (!values.customPosition || values.customPosition.trim() === "") {
            errors.customPosition = t(
              "sportsValidation.customPositionRequired"
            );
          } else if (values.customPosition.trim().length < 2) {
            errors.customPosition = t(
              "sportsValidation.customPositionTooShort"
            );
          } else if (values.customPosition.trim().length > 50) {
            errors.customPosition = t("sportsValidation.customPositionTooLong");
          }
        }

        if (!values.status) {
          errors.status = t("sportsValidation.statusRequired");
        }

        // Terms validation
        if (!values.agreeToTerms) {
          errors.agreeToTerms = t("sportsValidation.termsAcceptanceRequired");
        }

        return errors;
      } catch (err) {
        return { [err.path[0]]: err.message };
      }
    },
    onSubmit: async (values) => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error(t("formErrors.loginRequired"));
        return;
      }

      if (!API_URL) {
        toast.error(t("formErrors.serverConfigError"));
        return;
      }

      // Double-check terms agreement even within the submit handler
      if (!values.agreeToTerms) {
        toast.error(t("formErrors.termsAcceptanceRequired"));
        return;
      }

      try {
        setIsLoading(true);

        const isUpdate = Boolean(idParam);
        const url = isUpdate
          ? `${API_URL}/players/${idParam}`
          : `${API_URL}/players/createPlayer`;
        const method = isUpdate ? "patch" : "post";

        // Prepare payload
        const payload = preparePayload(values);

        // Handle file uploads if present
        const hasFiles =
          values.profilePictureFile ||
          values.documentFile ||
          values.media?.document?.file ||
          values.media?.video?.file;

        let response;
        if (!hasFiles) {
          response = await handleJsonSubmission(url, method, payload, token);
        } else {
          response = await handleMultipartSubmission(
            url,
            method,
            payload,
            values,
            token
          );
        }

        handleSubmissionSuccess(response);
      } catch (error) {
        handleSubmissionError(error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Load existing player data if editing - fixed infinite loop
  useEffect(() => {
    if (idParam && API_URL && !dataLoadedRef.current) {
      dataLoadedRef.current = true;

      const fetchPlayer = async () => {
        try {
          setIsLoading(true);
          const token = localStorage.getItem("token");
          if (!token) {
            toast.error(t("formErrors.loginRequiredFirst"));
            router.push("/login");
            return;
          }

          const response = await axios.get(`${API_URL}/players/${idParam}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const playerData = response.data.data;

          // Map backend expreiance to frontend experience field
          const mergedValues = {
            ...initialFormValues,
            name: playerData.name || "",
            age: playerData.age || "",
            gender: playerData.gender || "",
            nationality: playerData.nationality || "",
            customNationality: playerData.customNationality || "",
            birthCountry: playerData.birthCountry || "",
            customBirthCountry: playerData.customBirthCountry || "",
            jop: playerData.jop || "",
            jopSelected: true, // Mark as selected for existing players
            roleType: playerData.roleType || "",
            position: playerData.position || "",
            status: playerData.status || "",
            statusSelected: true, // Mark as selected for existing players
            experience: playerData.expreiance?.toString() || "0",
            contractEndDate: playerData.contractEndDate || "",
            monthlySalary: playerData.monthlySalary || {
              amount: "",
              currency: "SAR",
            },
            yearSalary: playerData.yearSalary || {
              amount: "",
              currency: "SAR",
            },
            transferredTo: playerData.transferredTo || {
              club: "",
              startDate: "",
              endDate: "",
              amount: "",
            },
            socialLinks: playerData.socialLinks || {
              instagram: "",
              twitter: "",
              whatsapp: "",
              youtube: "",
            },
            contactInfo: playerData.contactInfo || {
              isHidden: true,
              email: "",
              phone: "",
              agent: {
                name: "",
                phone: "",
                email: "",
              },
            },
            isPromoted: playerData.isPromoted || {
              status: false,
              startDate: "",
              endDate: "",
              type: "featured",
            },
            media: playerData.media
              ? {
                  video: playerData.media.video || {
                    url: null,
                    publicId: null,
                    title: null,
                    duration: 0,
                    uploadedAt: null,
                  },
                  document: playerData.media.document || {
                    url: null,
                    publicId: null,
                    title: null,
                    type: null,
                    size: 0,
                    uploadedAt: null,
                  },
                }
              : {
                  video: {
                    url: null,
                    publicId: null,
                    title: null,
                    duration: 0,
                    uploadedAt: null,
                  },
                  document: {
                    url: null,
                    publicId: null,
                    title: null,
                    type: null,
                    size: 0,
                    uploadedAt: null,
                  },
                },
            game: playerData.game || "",
            isActive: playerData.isActive || false,
            views: playerData.views || 0,
            seo: playerData.seo || {
              metaTitle: { en: "", ar: "" },
              metaDescription: { en: "", ar: "" },
              keywords: [],
            },
            profilePicturePreview: playerData.media?.profileImage?.url || "",
            profilePictureFile: undefined,
            agreeToTerms: true,
          };

          setPlayer(playerData);
          formik.setValues(mergedValues);
          toast.success(
            getSuccessMessage(response, t("formErrors.profileUpdated"))
          );
        } catch (err) {
          toast.error(
            getErrorMessage(err, t("formErrors.playerDataFetchFailed"))
          );
        } finally {
          setIsLoading(false);
        }
      };

      fetchPlayer();
    }
  }, [idParam, API_URL, router]); // Removed formik from dependencies

  const preparePayload = (values) => {
    const payload = { ...values };

    // Map experience -> expreiance (backend field name)
    if (payload.experience !== undefined) {
      payload.expreiance = Number(payload.experience) || 0;
      delete payload.experience;
    }

    // Convert numeric fields
    if (payload.age !== undefined && payload.age !== "") {
      payload.age = Number(payload.age);
    }
    if (
      payload.monthlySalary?.amount !== undefined &&
      payload.monthlySalary.amount !== ""
    ) {
      payload.monthlySalary.amount = Number(payload.monthlySalary.amount);
    }
    if (
      payload.yearSalary?.amount !== undefined &&
      payload.yearSalary.amount !== ""
    ) {
      payload.yearSalary.amount = Number(payload.yearSalary.amount);
    }
    if (
      payload.transferredTo?.amount !== undefined &&
      payload.transferredTo.amount !== ""
    ) {
      payload.transferredTo.amount = Number(payload.transferredTo.amount);
    }

    // Ensure proper object structure
    if (!payload.contactInfo) payload.contactInfo = {};
    if (!payload.contactInfo.agent) payload.contactInfo.agent = {};

    // Convert boolean fields
    payload.isActive = Boolean(payload.isActive);
    if (payload.contactInfo) {
      payload.contactInfo.isHidden = Boolean(payload.contactInfo.isHidden);
    }
    if (payload.isPromoted) {
      payload.isPromoted.status = Boolean(payload.isPromoted.status);
    }

    // Remove form-only fields
    delete payload.agreeToTerms;
    delete payload.profilePicturePreview;
    delete payload.profilePictureFile;
    delete payload.documentFile;

    return payload;
  };

  const handleJsonSubmission = async (url, method, payload, token) => {
    const response = await axios({
      method,
      url,
      data: payload,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response;
  };

  const handleMultipartSubmission = async (
    url,
    method,
    payload,
    values,
    token
  ) => {
    const fd = new FormData();

    // Add critical fields
    fd.append("name", payload.name || "");
    fd.append("age", payload.age || "");
    fd.append("gender", payload.gender || "");
    fd.append("nationality", payload.nationality || "");
    fd.append("customNationality", payload.customNationality || "");
    fd.append("birthCountry", payload.birthCountry || "");
    fd.append("customBirthCountry", payload.customBirthCountry || "");
    fd.append("game", payload.game || "");
    fd.append("jop", payload.jop || "");
    fd.append("roleType", payload.roleType || "");
    fd.append("position", payload.position || "");
    fd.append("status", payload.status || "");
    fd.append("expreiance", payload.expreiance || "0");

    // Handle media files
    prepareMediaFormData(values, player?.media, fd);

    // Add remaining fields
    Object.entries(payload).forEach(([k, v]) => {
      if (
        ![
          "name",
          "age",
          "gender",
          "nationality",
          "customNationality",
          "birthCountry",
          "customBirthCountry",
          "game",
          "jop",
          "roleType",
          "position",
          "status",
          "expreiance",
        ].includes(k) &&
        v !== undefined &&
        v !== null &&
        typeof v !== "object"
      ) {
        fd.append(k, v);
      }
    });

    // Append nested objects as JSON
    [
      "monthlySalary",
      "yearSalary",
      "transferredTo",
      "socialLinks",
      "isPromoted",
      "contactInfo",
    ].forEach((key) => {
      if (payload[key] && typeof payload[key] === "object") {
        fd.append(key, JSON.stringify(payload[key]));
      }
    });

    const response = await axios({
      method,
      url,
      data: fd,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response;
  };

  const handleSubmissionSuccess = (response) => {
    const successMessage = getSuccessMessage(
      response,
      t("formErrors.profileCreated")
    );

    toast.success(successMessage);

    try {
      const createdPlayer = response?.data?.data?.player;
      if (createdPlayer?._id) {
        setPlayer(createdPlayer);

        // Process media data if present
        if (response.data?.data?.media) {
          const processedMedia = processMediaResponse(response.data.data.media);
          setPlayer((prevPlayer) => ({
            ...prevPlayer,
            media: processedMedia,
          }));
        }
      }
    } catch {
      // Silent error handling for success response processing
    }

    setCanPay(true);
  };

  const handleSubmissionError = (error) => {
    const errorMessage = getErrorMessage(error, t("formErrors.uploadError"));
    toast.error(errorMessage);
  };

  return {
    formik,
    isLoading,
    setIsLoading,
    canPay,
    setCanPay,
    player,
    setPlayer,
  };
};
