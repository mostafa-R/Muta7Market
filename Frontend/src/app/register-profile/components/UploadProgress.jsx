import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

export const UploadProgress = ({ progress }) => {
  const { t } = useTranslation();

  if (progress <= 0 || progress >= 100) return null;

  return (
    <div className="mt-6 p-4 bg-white rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium">
          {t("registerProfile.upload.progress")}
        </span>
        <span className="text-sm font-medium">
          {progress}
          {t("registerProfile.upload.percent")}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

UploadProgress.propTypes = {
  progress: PropTypes.number.isRequired,
};

export default UploadProgress;
