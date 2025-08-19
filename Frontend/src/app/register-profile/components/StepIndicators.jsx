import PropTypes from "prop-types";

export const StepIndicators = ({ sections, currentStep, onStepClick }) => {
  return (
    <div className="hidden md:flex mb-8 overflow-x-auto justify-between">
      {sections.map((section, index) => (
        <button
          key={section.id}
          onClick={() => onStepClick(index)}
          className={`flex flex-col items-center mx-1 min-w-[80px] ${
            currentStep === index
              ? "text-blue-600 font-medium"
              : index < currentStep
              ? "text-green-600"
              : "text-gray-400"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-1 ${
              currentStep === index
                ? "bg-blue-100 text-blue-600"
                : index < currentStep
                ? "bg-green-100 text-green-600"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {section.icon}
          </div>
          <span className="text-xs whitespace-nowrap">{section.title}</span>
        </button>
      ))}
    </div>
  );
};

// Add PropTypes for type checking
StepIndicators.propTypes = {
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
    })
  ).isRequired,
  currentStep: PropTypes.number.isRequired,
  onStepClick: PropTypes.func.isRequired,
};

export default StepIndicators;
