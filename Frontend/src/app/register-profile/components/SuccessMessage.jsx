import PropTypes from "prop-types";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import PaymentBtn from "./PaymentBtn";

export const SuccessMessage = ({ isUpdate, playerId }) => {
  const { t } = useTranslation();

  if (isUpdate) return null;

  return (
    <div className="mt-6 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100 shadow-sm animate-fade-in">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-emerald-700">
            {t("registerProfile.success.title")}
          </h3>
          <p className="text-emerald-600">
            {t("registerProfile.success.description")}
          </p>
        </div>
      </div>
      <div className="flex justify-center">
        <Suspense
          fallback={
            <div className="py-4 text-center text-gray-500">
              {t("general.loading")}
            </div>
          }
        >
          <PaymentBtn type="publish_profile" playerId={playerId} />
        </Suspense>
      </div>
    </div>
  );
};

// Add PropTypes for type checking
SuccessMessage.propTypes = {
  isUpdate: PropTypes.bool.isRequired,
  playerId: PropTypes.string, // Optional prop
};

// Add default props
SuccessMessage.defaultProps = {
  playerId: undefined,
};

export default SuccessMessage;
