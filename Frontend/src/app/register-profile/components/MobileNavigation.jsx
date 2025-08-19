import { Button } from "@/app/component/ui/button";
import { useDirection } from "@/hooks/use-direction";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import PropTypes from "prop-types";

export const MobileNavigation = ({
  currentStep,
  totalSteps,
  onPrevStep,
  onNextStep,
  onSubmit,
  isSubmitting,
}) => {
  const { isRTL } = useDirection();
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-between items-center z-10 shadow-lg">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevStep}
        disabled={currentStep === 0}
        className={`px-3 py-2 ${currentStep === 0 ? "opacity-50" : ""}`}
      >
        {isRTL ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </Button>

      <div className="text-center">
        <span className="text-sm font-medium">
          {currentStep + 1}/{totalSteps}
        </span>
      </div>

      {currentStep < totalSteps - 1 ? (
        <Button
          type="button"
          onClick={onNextStep}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700"
        >
          {isRTL ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onSubmit}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700"
          disabled={isSubmitting}
        >
          <Save className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};

// Add PropTypes for type checking
MobileNavigation.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  onPrevStep: PropTypes.func.isRequired,
  onNextStep: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
};

export default MobileNavigation;
