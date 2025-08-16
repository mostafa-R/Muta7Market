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
import { get } from "lodash";
import { Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { sportsOptions } from "../types/constants";

export const SportsInfoCard = ({ formik }) => {
  const { t } = useTranslation();

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
          {/* الرياضة */}
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
              value={formik.values.game || ""}
              onValueChange={(value) => {
                formik.setFieldValue("game", value);
                formik.setFieldValue("gameSelected", true);
                formik.setFieldTouched("game", true);
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
                {sportsOptions.map((sport) => (
                  <SelectItem key={sport.value} value={sport.value}>
                    {t(sport.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          {/* المركز/التخصص */}
          <div className="space-y-2 relative">
            <Label
              htmlFor="position"
              className="flex items-center text-base font-medium"
            >
              <span>{t("registerProfile.form.sportsInfo.position")}</span>
              <span className="text-xs text-gray-500 mr-2">(اختياري)</span>
            </Label>
            <input
              id="position"
              name="position"
              value={formik.values.position || ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder={t(
                "registerProfile.form.sportsInfo.positionPlaceholder"
              )}
              className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
            />
            <div className="text-gray-500 text-xs mt-1">
              {t("registerProfile.form.sportsInfo.positionPlaceholder")}
            </div>
          </div>

          {/* الفئة */}
          <div className="space-y-2 relative">
            <Label
              htmlFor="jop"
              className="flex items-center text-base font-medium"
            >
              <span className="flex items-center">
                {t("registerProfile.form.sportsInfo.category")}{" "}
                <span className="text-red-500 mx-1">*</span>
              </span>
            </Label>
            <Select
              value={formik.values.jop || ""}
              onValueChange={(value) => {
                formik.setFieldValue("jop", value);
                formik.setFieldValue("jopSelected", true);
                formik.setFieldTouched("jop", true);
              }}
              onOpenChange={(open) => {
                if (!open) {
                  formik.setFieldTouched("jop", true);
                }
              }}
            >
              <SelectTrigger
                className={`h-11 transition-all focus:ring-2 focus:ring-blue-400 ${
                  get(formik.touched, "jop") && get(formik.errors, "jop")
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 hover:border-blue-400"
                }`}
              >
                <SelectValue
                  placeholder={t(
                    "registerProfile.form.sportsInfo.categoryPlaceholder"
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="player" className="py-2 text-base">
                  {t("registerProfile.form.sportsInfo.player")}
                </SelectItem>
                <SelectItem value="coach" className="py-2 text-base">
                  {t("registerProfile.form.sportsInfo.coach")}
                </SelectItem>
              </SelectContent>
            </Select>
            {get(formik.touched, "jop") && get(formik.errors, "jop") ? (
              <div className="text-red-600 text-sm font-medium mt-1 flex items-center">
                <span className="inline-block w-3 h-3 bg-red-600 rounded-full mr-2"></span>
                {get(formik.errors, "jop")}
              </div>
            ) : (
              !formik.values.jopSelected && (
                <div className="text-gray-500 text-xs mt-1">
                  {t("registerProfile.form.sportsInfo.categoryPlaceholder")}
                </div>
              )
            )}
          </div>

          {/* الحالة الحالية */}
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
                formik.setFieldValue("status", value);
                formik.setFieldValue("statusSelected", true);
                formik.setFieldTouched("status", true);
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

          {/* سنوات الخبرة */}
          <div className="space-y-2 relative">
            <Label
              htmlFor="experience"
              className="flex items-center text-base font-medium"
            >
              <span>{t("registerProfile.form.sportsInfo.experience")}</span>
              <span className="text-xs text-gray-500 mr-2">(اختياري)</span>
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
