import PropTypes from "prop-types";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";

export const SuccessMessage = ({ isUpdate, playerId }) => {
  const { t } = useTranslation();

  if (isUpdate) return null;

  return (
    <div className="mt-6 p-6 bg-gradient-to-r  from-emerald-50 to-green-50 rounded-xl border border-emerald-100 shadow-sm animate-fade-in">
      <div className="flex items-center mb-4 ">
        <div className="space-y-4 m-auto">
          <h3 className="text-xl font-bold text-emerald-700 flex items-center justify-center  ">
            {t("registerProfile.success.title")}
          </h3>
        </div>
      </div>
      <div className="flex justify-center">
        <Suspense
          fallback={
            <div className="py-4 text-center text-gray-500">
              {t("general.loading")}
            </div>
          }
        ></Suspense>
      </div>
    </div>
  );
};

SuccessMessage.propTypes = {
  isUpdate: PropTypes.bool.isRequired,
  playerId: PropTypes.string,
};

SuccessMessage.defaultProps = {
  playerId: undefined,
};

export default SuccessMessage;
