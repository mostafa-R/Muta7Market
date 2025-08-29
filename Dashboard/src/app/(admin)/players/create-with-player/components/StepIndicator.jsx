
const StepIndicator = ({ currentStep }) => {
  const steps = [
    { number: 1, title: "معلومات الحساب" },
    { number: 2, title: "المعلومات الشخصية" },
    { number: 3, title: "المعلومات المهنية" },
    { number: 4, title: "معلومات التواصل" },
    { number: 5, title: "الوسائط" }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 transform ${
                currentStep >= step.number
                  ? "bg-[#1e293b] text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {currentStep > step.number ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.number
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-2 mx-3 rounded-full transition-all duration-300 ${
                  currentStep > step.number ? "bg-[#1e293b]" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4">
        {steps.map((step) => (
          <span 
            key={step.number}
            className={currentStep >= step.number ? "text-[#1e293b] font-medium" : "text-gray-500"}
          >
            {step.title}
          </span>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
