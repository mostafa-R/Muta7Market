import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

export const ProgressIndicator = ({ currentStep, totalSteps, title }) => {
  const { t } = useTranslation();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">
          {t("registerProfile.progress.step")} {currentStep + 1}/{totalSteps}
        </span>
        <span className="text-sm font-medium text-gray-600">{title}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
          style={{
            width: `${((currentStep + 1) / totalSteps) * 100}%`,
          }}
        ></div>
      </div>
    </div>
  );
};

ProgressIndicator.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
};

export default ProgressIndicator;
