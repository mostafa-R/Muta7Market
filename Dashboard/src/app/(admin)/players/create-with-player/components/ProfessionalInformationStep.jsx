import { useSportsData } from '../hooks/useSportsData';
import {
  currencyOptions,
  statusOptions
} from '../playerOptions';

const ProfessionalInformationStep = ({ 
  formData, 
  handleInputChange, 
  showCustomFields 
}) => {
  // Get dynamic sports data
  const {
    loading: sportsLoading,
    getSportOptions,
    getPositionsForSport,
    getRoleTypesForSport,
    getAllRoleTypes
  } = useSportsData();

  // Get dynamic options based on current form state
  const sportsOptions = getSportOptions();
  const availablePositions = formData.game ? getPositionsForSport(formData.game) : [];
  const availableRoleTypes = formData.game && formData.jop 
    ? getRoleTypesForSport(formData.game, formData.jop)
    : getAllRoleTypes(formData.jop || "player");

  // Enhanced handleInputChange to handle automatic position setting when sport is "other"
  const handleEnhancedInputChange = (e) => {
    const { name, value } = e.target;
    
    // Call the original handleInputChange first
    handleInputChange(e);
    
    // Special logic: when sport is "other", automatically set position to "other" for players
    if (name === "game" && value === "other" && formData.jop === "player") {
      const positionEvent = {
        target: {
          name: "position",
          value: "other"
        }
      };
      handleInputChange(positionEvent);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 space-x-reverse mb-6">
        <div className="bg-purple-100 rounded-lg p-2">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 6V8a2 2 0 00-2-2H10a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">المعلومات المهنية</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* الفئة - الوظيفة */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            الفئة <span className="text-red-500">*</span>
          </label>
          <select
            name="jop"
            value={formData.jop}
            onChange={(e) => {
              handleEnhancedInputChange(e);
              // Clear position and role type when changing job category
              const roleEvent = { target: { name: "roleType", value: "" } };
              handleInputChange(roleEvent);
              const posEvent = { target: { name: "position", value: "" } };
              handleInputChange(posEvent);
            }}
            className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
            required
          >
            <option value="" disabled>
              اختر الفئة
            </option>
            <option value="player">لاعب</option>
            <option value="coach">مدرب</option>
          </select>

          {/* نوع الدور - يظهر بعد اختيار الفئة */}
          {formData.jop && (
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {formData.jop === "player" ? "نوع اللاعب" : "نوع المدرب"}
                <span className="text-red-500 mr-1 ml-1">*</span>
              </label>
              <select
                name="roleType"
                value={formData.roleType}
                onChange={handleEnhancedInputChange}
                className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
                disabled={sportsLoading}
              >
                <option value="" disabled>
                  {sportsLoading ? "جاري تحميل الأنواع..." : 
                   formData.jop === "player" ? "اختر نوع اللاعب" : "اختر نوع المدرب"}
                </option>
                {availableRoleTypes.map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.name}
                  </option>
                ))}
                <option value="other">أخرى</option>
              </select>

              {/* Custom role type input field when "other" is selected */}
              {formData.roleType === "other" && (
                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {formData.jop === "player" ? "حدد نوع اللاعب" : "حدد نوع المدرب"}
                    <span className="text-red-500 mx-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="customRoleType"
                    value={formData.customRoleType}
                    onChange={handleEnhancedInputChange}
                    placeholder={
                      formData.jop === "player" ? "أدخل نوع اللاعب" : "أدخل نوع المدرب"
                    }
                    className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
                  />
                  <div className="text-gray-500 text-xs mt-1">
                    {formData.jop === "player" ? "أدخل نوع اللاعب" : "أدخل نوع المدرب"}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* الرياضة */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            الرياضة <span className="text-red-500">*</span>
          </label>
          <select
            name="game"
            value={formData.game}
            onChange={handleEnhancedInputChange}
            className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
            required
            disabled={sportsLoading}
          >
            <option value="" disabled>
              {sportsLoading ? "جاري تحميل الرياضات..." : "اختر الرياضة"}
            </option>
            {sportsOptions.map((option) => (
              <option key={option.id} value={option.value}>
                {option.name}
              </option>
            ))}
            <option value="other">أخرى</option>
          </select>
          {sportsLoading && (
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <svg className="animate-spin w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              جاري تحميل بيانات الرياضات...
            </div>
          )}

          {/* Custom sport input field when "other" is selected */}
          {formData.game === "other" && (
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium text-gray-700">
                حدد الرياضة
                <span className="text-red-500 mx-1">*</span>
              </label>
              <input
                type="text"
                name="customSport"
                value={formData.customSport}
                onChange={handleEnhancedInputChange}
                placeholder="أدخل نوع الرياضة"
                className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
              />
              <div className="text-gray-500 text-xs mt-1">
                أدخل نوع الرياضة
              </div>
            </div>
          )}
        </div>

        {/* المركز/التخصص - للاعبين فقط */}
        {formData.jop === "player" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              المركز <span className="text-red-500">*</span>
            </label>
            {formData.game ? (
              <>
                {/* إذا كانت الرياضة "أخرى" - اظهار حقل المركز المخصص مباشرة */}
                {formData.game === "other" ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="customPosition"
                      value={formData.customPosition}
                      onChange={handleEnhancedInputChange}
                      placeholder="أدخل المركز"
                      className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
                    />
                    <div className="text-gray-500 text-xs mt-1">
                      أدخل المركز المخصص
                    </div>
                  </div>
                ) : availablePositions.length > 0 ? (
                  /* إذا كانت الرياضة محددة ولديها مراكز - اظهار select مع المراكز */
                  <>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleEnhancedInputChange}
                      className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
                      disabled={sportsLoading}
                    >
                      <option value="" disabled>
                        {sportsLoading ? "جاري تحميل المراكز..." : "اختر المركز"}
                      </option>
                      {availablePositions.map((option) => (
                        <option key={option.id} value={option.value}>
                          {option.name}
                        </option>
                      ))}
                      <option value="other">أخرى</option>
                    </select>

                    {/* Custom position input field when "other" is selected */}
                    {formData.position === "other" && (
                      <div className="mt-4 space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          حدد المركز
                          <span className="text-red-500 mx-1">*</span>
                        </label>
                        <input
                          type="text"
                          name="customPosition"
                          value={formData.customPosition}
                          onChange={handleEnhancedInputChange}
                          placeholder="أدخل المركز"
                          className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
                        />
                        <div className="text-gray-500 text-xs mt-1">
                          أدخل المركز
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* إذا كانت الرياضة محددة ولكن لا توجد مراكز محددة - اظهار حقل مخصص */
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="customPosition"
                      value={formData.customPosition}
                      onChange={handleEnhancedInputChange}
                      placeholder="أدخل المركز"
                      className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
                    />
                    <div className="text-gray-500 text-xs mt-1">
                      أدخل المركز لهذه الرياضة
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* إذا لم يتم اختيار رياضة بعد */
              <div className="h-11 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 flex items-center">
                <span className="text-gray-500">
                  اختر الرياضة أولاً
                </span>
              </div>
            )}
            <div className="text-gray-500 text-xs mt-1">
              {!formData.game ? "اختر الرياضة أولاً" : 
               formData.game === "other" ? "أدخل المركز المخصص" :
               sportsLoading ? "جاري تحميل المراكز..." :
               availablePositions.length === 0 ? "لا توجد مراكز محددة لهذه الرياضة" :
               "اختر أو أدخل المركز"}
            </div>
          </div>
        )}

        {/* الحالة الحالية */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            الحالة الحالية <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleEnhancedInputChange}
            className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
          >
            <option value="" disabled>
              اختر الحالة
            </option>
            {statusOptions.map((option) => (
              <option key={option.id} value={option.value}>
                {option.value === "available" ? "متاح" :
                 option.value === "contracted" ? "متعاقد" :
                 "منتقل"}
              </option>
            ))}
          </select>
          <div className="text-gray-500 text-xs mt-1">
            حدد الحالة الحالية للشخص
          </div>
        </div>

        {/* سنوات الخبرة */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            سنوات الخبرة
            <span className="text-xs text-gray-500 mr-2">(اختياري)</span>
          </label>
          <input
            type="number"
            name="experience"
            value={formData.experience}
            onChange={handleEnhancedInputChange}
            min="0"
            max="30"
            className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
            placeholder="عدد سنوات الخبرة"
          />
          <div className="text-gray-500 text-xs mt-1">
            عدد سنوات الخبرة في الرياضة
          </div>
        </div>
      </div>

      {/* Salary Information */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex items-center space-x-3 space-x-reverse mb-6">
          <div className="bg-green-100 rounded-lg p-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">معلومات الراتب</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              الراتب الشهري
              <span className="text-xs text-gray-500 mr-2">(اختياري)</span>
            </label>
            <div className="flex space-x-2 space-x-reverse">
              <input
                type="number"
                name="monthlySalary.amount"
                value={formData.monthlySalary.amount}
                onChange={handleEnhancedInputChange}
                min="0"
                className="flex-1 h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
                placeholder="المبلغ"
              />
              <select
                name="monthlySalary.currency"
                value={formData.monthlySalary.currency}
                onChange={handleEnhancedInputChange}
                className="h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
              >
                {currencyOptions.map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.value}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-gray-500 text-xs mt-1">
              الراتب الشهري الحالي أو المطلوب
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              الراتب السنوي
              <span className="text-xs text-gray-500 mr-2">(اختياري)</span>
            </label>
            <div className="flex space-x-2 space-x-reverse">
              <input
                type="number"
                name="yearSalary.amount"
                value={formData.yearSalary.amount}
                onChange={handleEnhancedInputChange}
                min="0"
                className="flex-1 h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
                placeholder="المبلغ"
              />
              <select
                name="yearSalary.currency"
                value={formData.yearSalary.currency}
                onChange={handleEnhancedInputChange}
                className="h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
              >
                {currencyOptions.map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.value}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-gray-500 text-xs mt-1">
              الراتب السنوي الحالي أو المطلوب
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              تاريخ انتهاء العقد
              <span className="text-xs text-gray-500 mr-2">(اختياري)</span>
            </label>
            <div className="relative">
              <input
                type="date"
                name="contractEndDate"
                value={formData.contractEndDate}
                onChange={handleEnhancedInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full h-11 pl-12 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const input = e.target.parentElement.querySelector('input[type="date"]');
                  if (input) {
                    input.focus();
                    input.showPicker && input.showPicker();
                  }
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <div className="text-gray-500 text-xs mt-1">
              تاريخ انتهاء العقد الحالي (إن وُجد)
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Information */}
      {(formData.status === "transferred" || formData.status === "contracted") && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center space-x-3 space-x-reverse mb-6">
            <div className="bg-orange-100 rounded-lg p-2">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">معلومات الانتقال</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                النادي المنتقل إليه
              </label>
              <input
                type="text"
                name="transferredTo.club"
                value={formData.transferredTo.club}
                onChange={handleEnhancedInputChange}
                className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
                placeholder="اسم النادي"
              />
              <div className="text-gray-500 text-xs mt-1">
                اسم النادي المنتقل إليه
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                مبلغ الانتقال
              </label>
              <input
                type="number"
                name="transferredTo.amount"
                value={formData.transferredTo.amount}
                onChange={handleEnhancedInputChange}
                min="0"
                className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors hover:border-blue-400"
                placeholder="المبلغ"
              />
              <div className="text-gray-500 text-xs mt-1">
                قيمة الانتقال (إن وُجدت)
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                تاريخ بداية الانتقال
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="transferredTo.startDate"
                  value={formData.transferredTo.startDate}
                  onChange={handleEnhancedInputChange}
                  className="w-full h-11 pl-12 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    const input = e.target.parentElement.querySelector('input[type="date"]');
                    if (input) {
                      input.focus();
                      input.showPicker && input.showPicker();
                    }
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <div className="text-gray-500 text-xs mt-1">
                تاريخ بداية الانتقال أو التعاقد
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                تاريخ نهاية الانتقال
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="transferredTo.endDate"
                  value={formData.transferredTo.endDate}
                  onChange={handleEnhancedInputChange}
                  className="w-full h-11 pl-12 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 hover:border-blue-400"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    const input = e.target.parentElement.querySelector('input[type="date"]');
                    if (input) {
                      input.focus();
                      input.showPicker && input.showPicker();
                    }
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <div className="text-gray-500 text-xs mt-1">
                تاريخ انتهاء الانتقال أو التعاقد
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Important Info Section */}
      <div className="mt-8 pt-6 border-t border-gray-100">
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
              معلومات هامة
            </h4>
            <p className="text-sm text-blue-700">
              جميع المعلومات المهنية ستظهر في الملف الشخصي للمساعدة في عملية البحث والاختيار. تأكد من دقة البيانات المدخلة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalInformationStep;