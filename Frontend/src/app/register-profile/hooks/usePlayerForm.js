import { API_BASE, apiClient } from "@/app/utils/api.ts";
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
  const API_URL = API_BASE;
  const dataLoadedRef = useRef(false);

  const formik = useFormik({
    initialValues: initialFormValues,
    validateOnChange: true,
    validateOnBlur: true,
    validate: (values) => {
      try {
        // Transform null values to empty strings before validation
        const transformedValues = { ...values };
        if (transformedValues.isPromoted) {
          console.log(
            "Original isPromoted before validation:",
            transformedValues.isPromoted
          );
          if (transformedValues.isPromoted.startDate === null) {
            transformedValues.isPromoted.startDate = "";
            console.log("Transformed startDate from null to empty string");
          }
          if (transformedValues.isPromoted.endDate === null) {
            transformedValues.isPromoted.endDate = "";
            console.log("Transformed endDate from null to empty string");
          }
          if (transformedValues.isPromoted.type === null) {
            transformedValues.isPromoted.type = "featured";
            console.log("Transformed type from null to 'featured'");
          }
          console.log(
            "Transformed isPromoted after validation:",
            transformedValues.isPromoted
          );
        }

        // First use Joi for schema validation
        const joiErrors = validateWithJoi(playerFormSchema)(transformedValues);

        // Additional manual validation for all required fields
        const errors = { ...joiErrors };

        // Personal section validation
        if (!transformedValues.name || transformedValues.name.trim() === "") {
          errors.name = t("formValidation.nameRequired");
        }

        if (!transformedValues.age || isNaN(Number(transformedValues.age))) {
          errors.age = t("formValidation.ageRequired");
        } else if (
          Number(transformedValues.age) < 15 ||
          Number(transformedValues.age) > 50
        ) {
          errors.age = t("formValidation.ageRange");
        }

        if (!transformedValues.gender) {
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
      // console.log("Form submission started with values:", values);
      // console.log("ID Parameter:", idParam);

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        toast.error(t("formErrors.loginRequired"));
        return;
      }

      if (!API_URL) {
        console.error("No API URL configured");
        toast.error(t("formErrors.serverConfigError"));
        return;
      }

      // Double-check terms agreement even within the submit handler
      if (!values.agreeToTerms) {
        console.error("Terms not agreed");
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

        // console.log(`Making ${method.toUpperCase()} request to:`, url);

        // Prepare payload
        const payload = preparePayload(values);
        // console.log("Prepared payload:", payload);

        // Handle file uploads if present
        const hasFiles =
          values.profilePictureFile ||
          values.documentFile ||
          values.media?.document?.file ||
          values.media?.video?.file ||
          (values.media?.images &&
            Array.isArray(values.media.images) &&
            values.media.images.some((img) => img.file));

        console.log("File detection:", {
          profilePictureFile: !!values.profilePictureFile,
          documentFile: !!values.documentFile,
          videoFile: !!values.media?.video?.file,
          documentFileMedia: !!values.media?.document?.file,
          imagesWithFiles: values.media?.images
            ? values.media.images.filter((img) => img.file).length
            : 0,
          totalHasFiles: hasFiles,
        });

        // console.log("Has files:", hasFiles);

        let response;
        if (!hasFiles) {
          console.log("Using JSON submission");
          response = await handleJsonSubmission(url, method, payload, token);
        } else {
          console.log("Using multipart submission");
          response = await handleMultipartSubmission(
            url,
            method,
            payload,
            values,
            token
          );
        }

        console.log("Submission successful:", response);
        handleSubmissionSuccess(response);
      } catch (error) {
        console.error("Form submission error:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
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

          try {
            console.log(
              `Fetching player data from: ${API_URL}/players/${idParam}`
            );
            const response = await apiClient.get(`/players/${idParam}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            const playerData = response.data.data;

            // Map backend data to frontend form fields
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
              customRoleType: playerData.customRoleType || "", // Fix: Add missing customRoleType mapping
              position: playerData.position || "",
              customPosition: playerData.customPosition || "", // Fix: Add missing customPosition mapping
              status: playerData.status || "",
              statusSelected: true, // Mark as selected for existing players
              experience: (playerData.experience || 0).toString(),
              contractEndDate: playerData.contractEndDate
                ? new Date(playerData.contractEndDate)
                    .toISOString()
                    .split("T")[0]
                : "",
              monthlySalary: playerData.monthlySalary || {
                amount: "",
                currency: "SAR",
              },
              yearSalary: playerData.yearSalary || {
                amount: "",
                currency: "SAR",
              },
              transferredTo: playerData.transferredTo
                ? {
                    club: playerData.transferredTo.club || "",
                    startDate: playerData.transferredTo.startDate
                      ? new Date(playerData.transferredTo.startDate)
                          .toISOString()
                          .split("T")[0]
                      : "",
                    endDate: playerData.transferredTo.endDate
                      ? new Date(playerData.transferredTo.endDate)
                          .toISOString()
                          .split("T")[0]
                      : "",
                    amount: playerData.transferredTo.amount || "",
                  }
                : {
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
              contactInfo: playerData.contactInfo
                ? {
                    isHidden: playerData.contactInfo.isHidden || false, // Fix: Add missing isHidden mapping
                    email: playerData.contactInfo.email || "",
                    phone: playerData.contactInfo.phone || "",
                    agent: playerData.contactInfo.agent || {
                      name: "",
                      phone: "",
                      email: "",
                    },
                  }
                : {
                    isHidden: false,
                    email: "",
                    phone: "",
                    agent: {
                      name: "",
                      phone: "",
                      email: "",
                    },
                  },
              isPromoted: playerData.isPromoted
                ? {
                    status: Boolean(playerData.isPromoted.status),
                    startDate: playerData.isPromoted.startDate
                      ? playerData.isPromoted.startDate instanceof Date
                        ? playerData.isPromoted.startDate
                            .toISOString()
                            .split("T")[0]
                        : new Date(playerData.isPromoted.startDate)
                            .toISOString()
                            .split("T")[0]
                      : "",
                    endDate: playerData.isPromoted.endDate
                      ? playerData.isPromoted.endDate instanceof Date
                        ? playerData.isPromoted.endDate
                            .toISOString()
                            .split("T")[0]
                        : new Date(playerData.isPromoted.endDate)
                            .toISOString()
                            .split("T")[0]
                      : "",
                    type:
                      playerData.isPromoted.type &&
                      ["featured", "premium"].includes(
                        playerData.isPromoted.type
                      )
                        ? playerData.isPromoted.type
                        : "featured",
                  }
                : {
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
                    images: playerData.media.images || [], // Fix: Add missing images array mapping
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
                    images: [], // Fix: Initialize empty images array
                  },
              game: playerData.game || "",
              customSport: playerData.customSport || "", // Fix: Add missing customSport mapping
              isActive:
                playerData.isActive !== undefined ? playerData.isActive : false,
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
            console.log(
              "Original playerData.isPromoted:",
              playerData.isPromoted
            );
            console.log("Merged isPromoted values:", mergedValues.isPromoted);
            formik.setValues(mergedValues);
            console.log(
              "Player data loaded and form values set:",
              mergedValues
            );
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
        } catch (error) {
          console.error("Error in fetchPlayer:", error);
          toast.error(
            getErrorMessage(error, t("formErrors.playerDataFetchFailed"))
          );
          setIsLoading(false);
        }
      };

      fetchPlayer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idParam, API_URL, router, t]); // formik excluded to prevent infinite re-renders

  // Clean up null values in form after data is loaded
  useEffect(() => {
    const currentValues = formik.values;
    if (
      currentValues.isPromoted &&
      (currentValues.isPromoted.startDate === null ||
        currentValues.isPromoted.endDate === null ||
        currentValues.isPromoted.type === null)
    ) {
      console.log("Cleaning up null values in isPromoted");
      const cleanedIsPromoted = {
        ...currentValues.isPromoted,
        startDate:
          currentValues.isPromoted.startDate === null
            ? ""
            : currentValues.isPromoted.startDate,
        endDate:
          currentValues.isPromoted.endDate === null
            ? ""
            : currentValues.isPromoted.endDate,
        type:
          currentValues.isPromoted.type === null
            ? "featured"
            : currentValues.isPromoted.type,
      };

      formik.setFieldValue("isPromoted", cleanedIsPromoted);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.isPromoted]); // formik excluded intentionally to prevent infinite re-renders

  const preparePayload = (values) => {
    const payload = { ...values };

    // Backend uses 'experience' field name (not 'expreiance')
    if (payload.experience !== undefined) {
      payload.experience = Number(payload.experience) || 0;
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

    // Convert date fields to proper format
    if (payload.contractEndDate) {
      payload.contractEndDate = new Date(payload.contractEndDate).toISOString();
    }
    if (payload.transferredTo?.startDate) {
      payload.transferredTo.startDate = new Date(
        payload.transferredTo.startDate
      ).toISOString();
    }
    if (payload.transferredTo?.endDate) {
      payload.transferredTo.endDate = new Date(
        payload.transferredTo.endDate
      ).toISOString();
    }

    // Ensure proper object structure
    if (!payload.contactInfo) payload.contactInfo = {};
    if (!payload.contactInfo.agent) payload.contactInfo.agent = {};

    // Convert boolean fields
    payload.isActive = Boolean(payload.isActive);

    if (payload.isPromoted) {
      payload.isPromoted.status = Boolean(payload.isPromoted.status);
      // Convert date fields to proper format if they exist, otherwise send null to API
      if (payload.isPromoted.startDate && payload.isPromoted.startDate !== "") {
        payload.isPromoted.startDate = new Date(
          payload.isPromoted.startDate
        ).toISOString();
      } else {
        payload.isPromoted.startDate = null;
      }
      if (payload.isPromoted.endDate && payload.isPromoted.endDate !== "") {
        payload.isPromoted.endDate = new Date(
          payload.isPromoted.endDate
        ).toISOString();
      } else {
        payload.isPromoted.endDate = null;
      }
      // Ensure type has a valid value, send null to API if not promoted
      if (payload.isPromoted.status === false) {
        // If not promoted, send null values to API
        payload.isPromoted.type = null;
        payload.isPromoted.startDate = null;
        payload.isPromoted.endDate = null;
      } else if (
        !payload.isPromoted.type ||
        !["featured", "premium"].includes(payload.isPromoted.type)
      ) {
        payload.isPromoted.type = "featured";
      }
    }

    if (payload.contactInfo) {
      payload.contactInfo.isHidden = Boolean(payload.contactInfo.isHidden);
    }

    // Remove form-only fields but keep custom fields for conditional validation
    delete payload.agreeToTerms;
    delete payload.profilePicturePreview;
    delete payload.profilePictureFile;
    delete payload.documentFile;
    delete payload.jopSelected;
    delete payload.statusSelected;

    return payload;
  };

  const handleJsonSubmission = async (url, method, payload, token) => {
    try {
      console.log(`Making ${method.toUpperCase()} JSON request to: ${url}`);
      const response = await apiClient({
        method,
        url: url.replace(API_URL, ""), // Remove base URL if it's included
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("JSON submission successful", response.status);
      return response;
    } catch (error) {
      console.error("JSON submission error:", error.message);
      if (error.response) {
        console.error(
          "Error response:",
          error.response.status,
          error.response.data
        );
      } else if (error.request) {
        console.error("No response received:", error.request);
      }
      throw error;
    }
  };

  const handleMultipartSubmission = async (
    url,
    method,
    payload,
    values,
    token
  ) => {
    const fd = new FormData();

    // Add critical fields - ensuring all required fields are included
    fd.append("name", payload.name || "");
    fd.append("age", payload.age || "");
    fd.append("gender", payload.gender || "");
    fd.append("nationality", payload.nationality || "");
    fd.append("customNationality", payload.customNationality || "");
    fd.append("birthCountry", payload.birthCountry || "");
    fd.append("customBirthCountry", payload.customBirthCountry || "");
    fd.append("game", payload.game || "");
    fd.append("customSport", payload.customSport || "");
    fd.append("jop", payload.jop || "");
    fd.append("roleType", payload.roleType || "");
    fd.append("customRoleType", payload.customRoleType || "");
    fd.append("position", payload.position || "");
    fd.append("customPosition", payload.customPosition || "");
    fd.append("status", payload.status || "");
    fd.append("experience", payload.experience || "0");

    // Handle media files
    console.log("Preparing media form data with values:", {
      profilePictureFile: values.profilePictureFile,
      documentFile: values.documentFile,
      mediaVideo: values.media?.video,
      mediaDocument: values.media?.document,
      mediaImages: values.media?.images?.map((img) => ({
        hasFile: !!img.file,
        title: img.title,
        url: img.url?.substring(0, 50) + "...",
      })),
    });

    try {
      prepareMediaFormData(values, player?.media, fd);
    } catch (validationError) {
      // Handle file size validation errors
      console.error("File validation error:", validationError.message);
      throw new Error(validationError.message);
    }

    // Log what was actually appended to FormData
    console.log("FormData entries after media preparation:");
    for (let pair of fd.entries()) {
      if (pair[1] instanceof File) {
        console.log(`${pair[0]}: File(${pair[1].name}, ${pair[1].size} bytes)`);
      } else {
        console.log(
          `${pair[0]}: ${
            typeof pair[1] === "string" ? pair[1].substring(0, 100) : pair[1]
          }`
        );
      }
    }

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
          "customSport",
          "jop",
          "roleType",
          "customRoleType",
          "position",
          "customPosition",
          "status",
          "experience",
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

    try {
      console.log(
        `Making ${method.toUpperCase()} multipart request to: ${url}`
      );
      // Use axios directly for multipart/form-data to ensure proper handling
      const response = await axios({
        method,
        url,
        data: fd,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        // Add additional configuration to debug network issues
        timeout: 120000, // 2 minutes timeout for file uploads
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });
      console.log("Multipart submission successful", response.status);
      return response;
    } catch (error) {
      console.error("Multipart submission error:", error.message);
      if (error.response) {
        console.error(
          "Error response:",
          error.response.status,
          error.response.data
        );
      } else if (error.request) {
        console.error("No response received:", error.request);
      }
      throw error;
    }
  };

  const handleSubmissionSuccess = (response) => {
    const isUpdate = Boolean(idParam);
    const successMessage = getSuccessMessage(
      response,
      isUpdate ? t("formErrors.profileUpdated") : t("formErrors.profileCreated")
    );

    toast.success(successMessage);

    try {
      // Backend response structure: { success: true, data: playerObject, message: "..." }
      const responseData = response?.data?.data;
      let playerData = responseData;

      // For create operations, player might be directly in data
      // For update operations, player might be in data.player
      if (responseData?.player) {
        playerData = responseData.player;
      }

      console.log("🎉 Success response structure:", {
        responseData,
        playerData,
        hasMediaUpdates: !!responseData?.mediaUpdates,
        hasMediaInData: !!responseData?.media,
        playerHasMedia: !!playerData?.media,
      });

      if (playerData?._id) {
        setPlayer(playerData);

        // Process media data if present in the response
        if (responseData?.mediaUpdates) {
          console.log("📊 Processing mediaUpdates:", responseData.mediaUpdates);
          // This is update response with media update info
          // The actual media data should already be in playerData.media
        }

        if (responseData?.media) {
          console.log("📊 Processing media from response:", responseData.media);
          const processedMedia = processMediaResponse(responseData.media);
          setPlayer((prevPlayer) => ({
            ...prevPlayer,
            media: processedMedia,
          }));
        } else if (playerData?.media) {
          console.log("📊 Using media from playerData:", playerData.media);
          // Media is already in the player data, no need to process separately
        }

        // Set successful form state
        setCanPay(true);

        // Clear file fields after successful submission to prevent stale data
        if (isUpdate) {
          console.log("🧹 Clearing file fields after successful update");
          formik.setFieldValue("profilePictureFile", null);
          formik.setFieldValue("documentFile", null);

          // Clear file references in media objects but keep the URLs from server
          if (formik.values.media?.video?.file) {
            formik.setFieldValue("media.video.file", null);
          }
          if (formik.values.media?.document?.file) {
            formik.setFieldValue("media.document.file", null);
          }
          if (
            formik.values.media?.images &&
            Array.isArray(formik.values.media.images)
          ) {
            const cleanedImages = formik.values.media.images.map((img) => ({
              ...img,
              file: null, // Clear the file but keep the URL
            }));
            formik.setFieldValue("media.images", cleanedImages);
          }
        }

        console.log(
          `✅ ${isUpdate ? "Update" : "Create"} operation successful:`,
          playerData
        );
      } else {
        console.warn("No player data found in response:", response?.data);
      }
    } catch (error) {
      console.warn("Error processing submission response:", error);
      // Still set canPay if the operation was successful
      setCanPay(true);
    }

    // For updates, you might want to show a different UI or redirect
    if (isUpdate) {
      setTimeout(() => {
        console.log(
          "Profile updated successfully - you can add navigation here"
        );
      }, 1000);
    }
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
