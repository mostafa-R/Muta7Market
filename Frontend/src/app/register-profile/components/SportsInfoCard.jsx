import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/component/ui/card";
import { Label } from "@/app/component/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/component/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { get } from "lodash";
import { Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSportsData } from "../hooks/useSportsData";
// Keep the old imports as fallbacks in case API fails
import {
  coachRoleTypes as fallbackCoachRoleTypes,
  playerRoleTypes as fallbackPlayerRoleTypes,
  sportPositions as fallbackSportPositions,
  sportsOptions as fallbackSportsOptions,
} from "../constants/sportsPositions";
import {
  getGameValue,
  getPositionValue,
  getRoleTypeValue,
  isOtherGame,
  isOtherPosition,
  isOtherRoleType,
} from "../utils/helpers";
import { ConditionalSelect } from "./ConditionalSelect";

export const SportsInfoCard = ({ formik }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const {
    isLoading,
    error,
    getSportsOptions,
    getSportPositions,
    getPlayerRoleTypes,
    getCoachRoleTypes,
  } = useSportsData();

  // Get dynamic data from API or use fallbacks if API fails
  const sportsOptions =
    !isLoading && !error ? getSportsOptions() : fallbackSportsOptions;

  // Get sport positions for the selected sport
  const getPositionsForSport = (game) => {
    const sportSlug = getGameValue(game);
    if (!sportSlug) return [];
    return !isLoading && !error
      ? getSportPositions(sportSlug)
      : fallbackSportPositions[sportSlug] || [];
  };

  // Get role types based on job type
  const getRoleTypesForJob = (jobType, game) => {
    const sportSlug = getGameValue(game);
    if (!jobType) return [];
    if (jobType === "player") {
      return !isLoading && !error && sportSlug
        ? getPlayerRoleTypes(sportSlug)
        : fallbackPlayerRoleTypes;
    } else if (jobType === "coach") {
      return !isLoading && !error && sportSlug
        ? getCoachRoleTypes(sportSlug)
        : fallbackCoachRoleTypes;
    }
    return [];
  };

  return (
    <Card className="border-0 shadow-card bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <Trophy className="w-5 h-5 text-primary mr-2 ml-2" />
          <span>{t("registerProfile.form.sportsInfo.title")}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ConditionalSelect
            label={t("registerProfile.form.sportsInfo.category")}
            name="jop"
            value={formik.values.jop || ""}
            onValueChange={(value) => {
              // Store the job type value
              formik.setFieldValue("jop", value);
              formik.setFieldValue("jopSelected", true);
              formik.setFieldTouched("jop", true);

              // Store the multilingual job type name
              if (value === "player") {
                formik.setFieldValue("jopName", {
                  ar: "لاعب",
                  en: "Player",
                });
              } else if (value === "coach") {
                formik.setFieldValue("jopName", {
                  ar: "مدرب",
                  en: "Coach",
                });
              }

              // Reset related fields
              formik.setFieldValue("roleType", "");
              formik.setFieldValue("roleTypeName", null);
              formik.setFieldValue("roleTypeData", null);
              formik.setFieldValue("customRoleType", "");
              formik.setFieldValue("position", "");
              formik.setFieldValue("positionName", null);
              formik.setFieldValue("positionData", null);
              formik.setFieldTouched("position", false);
            }}
            onBlur={() => formik.setFieldTouched("jop", true)}
            placeholder={t(
              "registerProfile.form.sportsInfo.categoryPlaceholder"
            )}
            options={[
              {
                id: "player",
                name: "registerProfile.form.sportsInfo.player",
                value: "player",
              },
              {
                id: "coach",
                name: "registerProfile.form.sportsInfo.coach",
                value: "coach",
              },
            ]}
            required={true}
            formik={formik}
          >
            {/* Conditional Role Type Selection */}
            {formik.values.jop && (
              <div className="mt-4 space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  {formik.values.jop === "player"
                    ? t("registerProfile.form.sportsInfo.playerType")
                    : t("registerProfile.form.sportsInfo.coachType")}
                  <span className="text-red-500 mr-1 ml-1">*</span>
                </Label>
                <Select
                  value={getRoleTypeValue(formik.values.roleType) || ""}
                  onValueChange={(value) => {
                    // Find the selected role type with all its multilingual data
                    const roleTypes = getRoleTypesForJob(
                      formik.values.jop,
                      formik.values.game
                    );
                    const selectedRoleType = roleTypes.find(
                      (role) => role.value === value
                    );

                    // Store the roleType data
                    formik.setFieldTouched("roleType", true);

                    if (
                      selectedRoleType &&
                      selectedRoleType.name &&
                      typeof selectedRoleType.name === "object"
                    ) {
                      // Store the multilingual name directly in the roleType field
                      formik.setFieldValue("roleType", {
                        ar: selectedRoleType.name.ar,
                        en: selectedRoleType.name.en,
                        slug: value, // Keep the slug for reference
                      });

                      // Also store in roleTypeName for UI components that might need it
                      formik.setFieldValue("roleTypeName", {
                        ar: selectedRoleType.name.ar,
                        en: selectedRoleType.name.en,
                      });

                      // Store the original object for reference if needed
                      if (selectedRoleType._original) {
                        formik.setFieldValue(
                          "roleTypeData",
                          selectedRoleType._original
                        );
                      }
                    } else {
                      // Fallback to string value if no multilingual data
                      formik.setFieldValue("roleType", value);
                    }

                    if (value !== "other") {
                      formik.setFieldValue("customRoleType", "");
                      formik.setFieldTouched("customRoleType", false);
                    }
                  }}
                  onOpenChange={(open) => {
                    if (!open) {
                      formik.setFieldTouched("roleType", true);
                    }
                  }}
                >
                  <SelectTrigger
                    className={`h-11 bg-white transition-all focus:ring-2 focus:ring-blue-400 ${
                      get(formik.touched, "roleType") &&
                      get(formik.errors, "roleType")
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-blue-400"
                    }`}
                    required
                  >
                    <SelectValue
                      placeholder={
                        formik.values.jop === "player"
                          ? t(
                              "registerProfile.form.sportsInfo.selectPlayerType"
                            )
                          : t("registerProfile.form.sportsInfo.selectCoachType")
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {getRoleTypesForJob(
                      formik.values.jop,
                      formik.values.game
                    ).map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.name && typeof role.name === "object"
                          ? language === "ar"
                            ? role.name.ar
                            : role.name.en
                          : t(role.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {get(formik.touched, "roleType") &&
                  get(formik.errors, "roleType") && (
                    <div
                      role="alert"
                      aria-live="assertive"
                      className="text-red-500 text-xs mt-1 bg-red-50 p-1 px-2 rounded-md border border-red-100 inline-block"
                    >
                      {get(formik.errors, "roleType")}
                    </div>
                  )}

                {/* Custom role type input field when "other" is selected */}
                {isOtherRoleType(formik.values.roleType) && (
                  <div className="mt-4 space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      {formik.values.jop === "player"
                        ? t("registerProfile.form.sportsInfo.customPlayerType")
                        : t("registerProfile.form.sportsInfo.customCoachType")}
                      <span className="text-red-500 mx-1">*</span>
                    </Label>
                    <input
                      id="customRoleType"
                      name="customRoleType"
                      type="text"
                      value={formik.values.customRoleType || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder={
                        formik.values.jop === "player"
                          ? t(
                              "registerProfile.form.sportsInfo.customPlayerTypePlaceholder"
                            )
                          : t(
                              "registerProfile.form.sportsInfo.customCoachTypePlaceholder"
                            )
                      }
                      className={`w-full h-11 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${
                        get(formik.touched, "customRoleType") &&
                        get(formik.errors, "customRoleType")
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 hover:border-blue-400"
                      }`}
                    />
                    {get(formik.touched, "customRoleType") &&
                    get(formik.errors, "customRoleType") ? (
                      <div className="text-red-600 text-xs mt-1">
                        {get(formik.errors, "customRoleType")}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-xs mt-1">
                        {formik.values.jop === "player"
                          ? t(
                              "registerProfile.form.sportsInfo.customPlayerTypePlaceholder"
                            )
                          : t(
                              "registerProfile.form.sportsInfo.customCoachTypePlaceholder"
                            )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </ConditionalSelect>

          <div className="space-y-2 relative">
            <Label
              htmlFor="game"
              className="flex items-center text-base font-medium"
            >
              <span className="flex items-center">
                {t("registerProfile.form.sportsInfo.sport")}{" "}
                <span className="text-red-500 mx-1">*</span>
              </span>
            </Label>
            <Select
              value={getGameValue(formik.values.game) || ""}
              onValueChange={(value) => {
                // Find the selected sport with all its multilingual data
                const selectedSport = sportsOptions.find(
                  (sport) => sport.value === value
                );

                // Store the multilingual data directly in game field
                formik.setFieldValue("gameSelected", true);
                formik.setFieldTouched("game", true);

                if (
                  selectedSport &&
                  selectedSport.name &&
                  typeof selectedSport.name === "object"
                ) {
                  // Store the multilingual name directly in the game field
                  formik.setFieldValue("game", {
                    ar: selectedSport.name.ar,
                    en: selectedSport.name.en,
                    slug: value, // Keep the slug for reference
                  });

                  // Also store in gameName for UI components that might need it
                  formik.setFieldValue("gameName", {
                    ar: selectedSport.name.ar,
                    en: selectedSport.name.en,
                  });

                  // Store the original object for reference if needed
                  if (selectedSport._original) {
                    formik.setFieldValue("gameData", selectedSport._original);
                  }
                } else {
                  // Fallback to string value if no multilingual data
                  formik.setFieldValue("game", value);
                }

                // Reset position-related fields
                formik.setFieldValue("position", "");
                formik.setFieldTouched("position", false);
                formik.setFieldValue("positionName", null);

                if (value !== "other") {
                  formik.setFieldValue("customSport", "");
                  formik.setFieldTouched("customSport", false);
                }
              }}
              onOpenChange={(open) => {
                if (!open) {
                  formik.setFieldTouched("game", true);
                }
              }}
            >
              <SelectTrigger
                className={`h-11 transition-all focus:ring-2 focus:ring-blue-400 ${
                  get(formik.touched, "game") && get(formik.errors, "game")
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 hover:border-blue-400"
                }`}
              >
                <SelectValue
                  placeholder={t(
                    "registerProfile.form.sportsInfo.sportPlaceholder"
                  )}
                />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {isLoading ? (
                  <div className="p-2 text-center">
                    <span className="text-gray-500">
                      {t("common.loading") || "Loading..."}
                    </span>
                  </div>
                ) : error ? (
                  <div className="p-2 text-center">
                    <span className="text-red-500">
                      {t("common.error") || "Error loading sports"}
                    </span>
                  </div>
                ) : (
                  sportsOptions.map((sport) => (
                    <SelectItem key={sport.value} value={sport.value}>
                      {sport.name && typeof sport.name === "object"
                        ? language === "ar"
                          ? sport.name.ar
                          : sport.name.en
                        : t(sport.name)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {isOtherGame(formik.values.game) && (
              <div className="mt-4 space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  {t("registerProfile.form.sportsInfo.customSport")}
                  <span className="text-red-500 mx-1">*</span>
                </Label>
                <input
                  id="customSport"
                  name="customSport"
                  type="text"
                  value={formik.values.customSport || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder={t(
                    "registerProfile.form.sportsInfo.customSportPlaceholder"
                  )}
                  className={`w-full h-11 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${
                    get(formik.touched, "customSport") &&
                    get(formik.errors, "customSport")
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 hover:border-blue-400"
                  }`}
                />
                {get(formik.touched, "customSport") &&
                get(formik.errors, "customSport") ? (
                  <div className="text-red-600 text-xs mt-1">
                    {get(formik.errors, "customSport")}
                  </div>
                ) : (
                  <div className="text-gray-500 text-xs mt-1">
                    {t(
                      "registerProfile.form.sportsInfo.customSportPlaceholder"
                    )}
                  </div>
                )}
              </div>
            )}
            {get(formik.touched, "game") && get(formik.errors, "game") ? (
              <div className="text-red-600 text-sm font-medium mt-1 flex items-center">
                <span className="inline-block w-3 h-3 bg-red-600 rounded-full mr-2"></span>
                {get(formik.errors, "game")}
              </div>
            ) : (
              !formik.values.gameSelected && (
                <div className="text-gray-500 text-xs mt-1">
                  {t("registerProfile.form.sportsInfo.sportPlaceholder")}
                </div>
              )
            )}
          </div>

          {formik.values.jop === "player" && (
            <div className="space-y-2 relative">
              <Label
                htmlFor="position"
                className="flex items-center text-base font-medium"
              >
                <span className="flex items-center">
                  {t("registerProfile.form.sportsInfo.position")}{" "}
                  <span className="text-red-500 mx-1">*</span>
                </span>
              </Label>
              {formik.values.game &&
              getPositionsForSport(formik.values.game).length > 0 ? (
                <>
                  <Select
                    value={getPositionValue(formik.values.position) || ""}
                    onValueChange={(value) => {
                      // Find the selected position with all its multilingual data
                      const positions = getPositionsForSport(
                        formik.values.game
                      );
                      const selectedPosition = positions.find(
                        (pos) => pos.value === value
                      );

                      // Store the position data
                      formik.setFieldTouched("position", true);

                      if (
                        selectedPosition &&
                        selectedPosition.name &&
                        typeof selectedPosition.name === "object"
                      ) {
                        // Store the multilingual name directly in the position field
                        formik.setFieldValue("position", {
                          ar: selectedPosition.name.ar,
                          en: selectedPosition.name.en,
                          slug: value, // Keep the slug for reference
                        });

                        // Also store in positionName for UI components that might need it
                        formik.setFieldValue("positionName", {
                          ar: selectedPosition.name.ar,
                          en: selectedPosition.name.en,
                        });

                        // Store the original object for reference if needed
                        if (selectedPosition._original) {
                          formik.setFieldValue(
                            "positionData",
                            selectedPosition._original
                          );
                        }
                      } else {
                        // Fallback to string value if no multilingual data
                        formik.setFieldValue("position", value);
                      }

                      if (value !== "other") {
                        formik.setFieldValue("customPosition", "");
                        formik.setFieldTouched("customPosition", false);
                      }
                    }}
                    onOpenChange={(open) => {
                      if (!open) {
                        formik.setFieldTouched("position", true);
                      }
                    }}
                  >
                    <SelectTrigger
                      className={`h-11 transition-all focus:ring-2 focus:ring-blue-400 ${
                        get(formik.touched, "position") &&
                        get(formik.errors, "position")
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 hover:border-blue-400"
                      }`}
                    >
                      <SelectValue
                        placeholder={t(
                          "registerProfile.form.sportsInfo.positionPlaceholder"
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {isLoading ? (
                        <div className="p-2 text-center">
                          <span className="text-gray-500">
                            {t("common.loading") || "Loading..."}
                          </span>
                        </div>
                      ) : error ? (
                        <div className="p-2 text-center">
                          <span className="text-red-500">
                            {t("common.error") || "Error loading positions"}
                          </span>
                        </div>
                      ) : (
                        getPositionsForSport(formik.values.game).map(
                          (position) => (
                            <SelectItem
                              key={position.value}
                              value={position.value}
                            >
                              {position.name &&
                              typeof position.name === "object"
                                ? language === "ar"
                                  ? position.name.ar
                                  : position.name.en
                                : t(position.name)}
                            </SelectItem>
                          )
                        )
                      )}
                    </SelectContent>
                  </Select>

                  {/* Custom position input field when "other" is selected */}
                  {isOtherPosition(formik.values.position) && (
                    <div className="mt-4 space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        {t("registerProfile.form.sportsInfo.customPosition")}
                        <span className="text-red-500 mx-1">*</span>
                      </Label>
                      <input
                        id="customPosition"
                        name="customPosition"
                        type="text"
                        value={formik.values.customPosition || ""}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder={t(
                          "registerProfile.form.sportsInfo.customPositionPlaceholder"
                        )}
                        className={`w-full h-11 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${
                          get(formik.touched, "customPosition") &&
                          get(formik.errors, "customPosition")
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 hover:border-blue-400"
                        }`}
                      />
                      {get(formik.touched, "customPosition") &&
                      get(formik.errors, "customPosition") ? (
                        <div className="text-red-600 text-xs mt-1">
                          {get(formik.errors, "customPosition")}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-xs mt-1">
                          {t(
                            "registerProfile.form.sportsInfo.customPositionPlaceholder"
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="h-11 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 flex items-center">
                  <span className="text-gray-500">
                    {t("registerProfile.form.sportsInfo.selectSportFirst")}
                  </span>
                </div>
              )}
              {get(formik.touched, "position") &&
              get(formik.errors, "position") ? (
                <div className="text-red-600 text-sm font-medium mt-1 flex items-center">
                  <span className="inline-block w-3 h-3 bg-red-600 rounded-full mr-2"></span>
                  {get(formik.errors, "position")}
                </div>
              ) : (
                <div className="text-gray-500 text-xs mt-1">
                  {formik.values.game
                    ? t("registerProfile.form.sportsInfo.positionPlaceholder")
                    : t("registerProfile.form.sportsInfo.selectSportFirst")}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2 relative">
            <Label
              htmlFor="status"
              className="flex items-center text-base font-medium"
            >
              <span className="flex items-center">
                {t("registerProfile.form.sportsInfo.currentStatus")}{" "}
                <span className="text-red-500 mx-1">*</span>
              </span>
            </Label>
            <Select
              value={formik.values.status || ""}
              onValueChange={(value) => {
                // Store the status value
                formik.setFieldValue("status", value);
                formik.setFieldValue("statusSelected", true);
                formik.setFieldTouched("status", true);

                // Store the multilingual status name
                if (value === "available") {
                  formik.setFieldValue("statusName", {
                    ar: "متاح",
                    en: "Available",
                  });
                } else if (value === "contracted") {
                  formik.setFieldValue("statusName", {
                    ar: "متعاقد",
                    en: "Contracted",
                  });
                } else if (value === "transferred") {
                  formik.setFieldValue("statusName", {
                    ar: "منتقل",
                    en: "Transferred",
                  });
                }
              }}
              onOpenChange={(open) => {
                if (!open) {
                  formik.setFieldTouched("status", true);
                }
              }}
            >
              <SelectTrigger
                className={`h-11 transition-all focus:ring-2 focus:ring-blue-400 ${
                  get(formik.touched, "status") && get(formik.errors, "status")
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 hover:border-blue-400"
                }`}
              >
                <SelectValue
                  placeholder={t(
                    "registerProfile.form.sportsInfo.currentStatusPlaceholder"
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available" className="py-2 text-base">
                  {t("registerProfile.form.sportsInfo.available")}
                </SelectItem>
                <SelectItem value="contracted" className="py-2 text-base">
                  {t("registerProfile.form.sportsInfo.contracted")}
                </SelectItem>
                <SelectItem value="transferred" className="py-2 text-base">
                  {t("registerProfile.form.sportsInfo.transferred")}
                </SelectItem>
              </SelectContent>
            </Select>
            {get(formik.touched, "status") && get(formik.errors, "status") ? (
              <div className="text-red-600 text-sm font-medium mt-1 flex items-center">
                <span className="inline-block w-3 h-3 bg-red-600 rounded-full mr-2"></span>
                {get(formik.errors, "status")}
              </div>
            ) : (
              !formik.values.statusSelected && (
                <div className="text-gray-500 text-xs mt-1">
                  {t(
                    "registerProfile.form.sportsInfo.currentStatusPlaceholder"
                  )}
                </div>
              )
            )}
          </div>

          <div className="space-y-2 relative">
            <Label
              htmlFor="experience"
              className="flex items-center text-base font-medium"
            >
              <span>{t("registerProfile.form.sportsInfo.experience")}</span>
              <span className="text-xs text-gray-500 mr-2">
                ({t("labels.optional")})
              </span>
            </Label>
            <input
              id="experience"
              name="experience"
              type="number"
              min="0"
              max="30"
              value={formik.values.experience || ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder={t(
                "registerProfile.form.sportsInfo.experiencePlaceholder"
              )}
              className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
            />
            {get(formik.touched, "experience") &&
            get(formik.errors, "experience") ? (
              <div className="text-red-600 text-xs mt-1">
                {get(formik.errors, "experience")}
              </div>
            ) : (
              <div className="text-gray-500 text-xs mt-1">
                {t("registerProfile.form.sportsInfo.experiencePlaceholder")}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="bg-blue-50 rounded-lg p-4 flex items-start">
            <div className="text-blue-500 mr-3 mt-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-1">
                {t("registerProfile.form.sportsInfo.importantInfo")}
              </h4>
              <p className="text-sm text-blue-700">
                {t("registerProfile.form.sportsInfo.importantInfoText")}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
