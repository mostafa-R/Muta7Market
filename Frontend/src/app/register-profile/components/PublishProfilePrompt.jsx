import PropTypes from "prop-types";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import PaymentBtn from "./PaymentBtn";

export const PublishProfilePrompt = ({ playerId, isActive }) => {
  const { t } = useTranslation();

  if (isActive) return null;

  return (
    <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm animate-fade-in">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
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
            <path d="M12 5v14M5 12h14"></path>
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-blue-700">
            {t("registerProfile.publish.promptTitle", {
              defaultValue: "Publish your profile",
            })}
          </h3>
          <p className="text-blue-700/80">
            {t("registerProfile.publish.promptDesc", {
              defaultValue:
                "Complete payment to publish your profile and make it visible.",
            })}
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
PublishProfilePrompt.propTypes = {
  playerId: PropTypes.string, // Optional prop
  isActive: PropTypes.bool.isRequired,
};

// Add default props
PublishProfilePrompt.defaultProps = {
  playerId: undefined,
};

export default PublishProfilePrompt;
