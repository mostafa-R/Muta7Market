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
        const transformedValues = { ...values };
        if (transformedValues.isPromoted) {
          if (transformedValues.isPromoted.startDate === null) {
            transformedValues.isPromoted.startDate = "";
          }
          if (transformedValues.isPromoted.endDate === null) {
            transformedValues.isPromoted.endDate = "";
          }
          if (transformedValues.isPromoted.type === null) {
            transformedValues.isPromoted.type = "featured";
          }
        }

        const joiErrors = validateWithJoi(playerFormSchema)(transformedValues);

        const errors = { ...joiErrors };

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

        if (!values.birthCountry || values.birthCountry.trim() === "") {
          errors.birthCountry = t("formValidation.birthCountryRequired");
        } else {
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

        if (values.nationality === "other") {
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

        if (values.birthCountry === "other") {
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

        if (!values.game || values.game.trim() === "") {
          errors.game = t("sportsValidation.sportRequired");
        }

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

        if (values.jop && (!values.roleType || values.roleType.trim() === "")) {
          errors.roleType = t("sportsValidation.roleTypeRequired");
        }

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

        if (values.jop === "player") {
          if (!values.position || values.position.trim() === "") {
            errors.position = t("sportsValidation.positionRequired");
          } else if (values.position.length < 2) {
            errors.position = t("sportsValidation.positionTooShort");
          }
        }

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

        const payload = preparePayload(values);
        const hasFiles =
          values.profilePictureFile ||
          values.documentFile ||
          values.media?.document?.file ||
          values.media?.video?.file ||
          (values.media?.images &&
            Array.isArray(values.media.images) &&
            values.media.images.some((img) => img.file));

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

        handleSubmissionSuccess(response);
      } catch (error) {
        handleSubmissionError(error);
      } finally {
        setIsLoading(false);
      }
    },
  });

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
            const response = await apiClient.get(`/players/${idParam}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            const playerData = response.data.data;
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
              jopSelected: true,
              roleType: playerData.roleType || "",
              customRoleType: playerData.customRoleType || "",
              position: playerData.position || "",
              customPosition: playerData.customPosition || "",
              status: playerData.status || "",
              statusSelected: true,
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
                    isHidden: playerData.contactInfo.isHidden || false,
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
                    images: playerData.media.images || [],
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
                    images: [],
                  },
              game: playerData.game || "",
              customSport: playerData.customSport || "",
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
        } catch (error) {
          toast.error(
            getErrorMessage(error, t("formErrors.playerDataFetchFailed"))
          );
          setIsLoading(false);
        }
      };

      fetchPlayer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idParam, API_URL, router, t]);

  useEffect(() => {
    const currentValues = formik.values;
    if (
      currentValues.isPromoted &&
      (currentValues.isPromoted.startDate === null ||
        currentValues.isPromoted.endDate === null ||
        currentValues.isPromoted.type === null)
    ) {
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
  }, [formik.values.isPromoted]);

  const preparePayload = (values) => {
    const payload = { ...values };

    if (payload.experience !== undefined) {
      payload.experience = Number(payload.experience) || 0;
    }

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

    if (!payload.contactInfo) payload.contactInfo = {};
    if (!payload.contactInfo.agent) payload.contactInfo.agent = {};

    payload.isActive = Boolean(payload.isActive);

    if (payload.isPromoted) {
      payload.isPromoted.status = Boolean(payload.isPromoted.status);
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
      if (payload.isPromoted.status === false) {
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
      const response = await apiClient({
        method,
        url: url.replace(API_URL, ""),
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
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

    try {
      prepareMediaFormData(values, player?.media, fd);
    } catch (validationError) {
      throw new Error(validationError.message);
    }

    for (let pair of fd.entries()) {
      if (pair[1] instanceof File) {
      } else {
      }
    }

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
      const response = await axios({
        method,
        url,
        data: fd,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
        },
      });
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
      const responseData = response?.data?.data;
      let playerData = responseData;

      if (responseData?.player) {
        playerData = responseData.player;
      }

      if (playerData?._id) {
        setPlayer(playerData);

        if (responseData?.mediaUpdates) {
        }

        if (responseData?.media) {
          const processedMedia = processMediaResponse(responseData.media);
          setPlayer((prevPlayer) => ({
            ...prevPlayer,
            media: processedMedia,
          }));
        } else if (playerData?.media) {
        }

        setCanPay(true);

        if (isUpdate) {
          formik.setFieldValue("profilePictureFile", null);
          formik.setFieldValue("documentFile", null);

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
              file: null,
            }));
            formik.setFieldValue("media.images", cleanedImages);
          }
        }
      } else {
        console.warn("No player data found in response:", response?.data);
      }
    } catch (error) {
      console.warn("Error processing submission response:", error);
      setCanPay(true);
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
