import { genderOptions, nationalities } from '../playerOptions';

const PersonalInformationStep = ({ 
  formData, 
  handleInputChange, 
  showCustomFields 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 space-x-reverse mb-6">
        <div className="bg-green-100 rounded-lg p-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">المعلومات الشخصية</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            العمر <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            min="15"
            max="50"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="أدخل العمر"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الجنس <span className="text-red-500">*</span>
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="" disabled>
              اختر الجنس
            </option>
            {genderOptions.map((option) => (
              <option key={option.id} value={option.value}>
                {option.value === "male" ? "ذكر" : "أنثى"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الجنسية <span className="text-red-500">*</span>
          </label>
          <select
            name="nationality"
            value={formData.nationality}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="" disabled>
              اختر الجنسية
            </option>
            {nationalities.map((option) => (
              <option key={option.id} value={option.value}>
               {option.value === "saudi" ? "السعودية" : 
                 option.value === "uae" ? "الإمارات" :
                 option.value === "egypt" ? "مصر" :
                 option.value === "morocco" ? "المغرب" :
                 option.value === "kuwait" ? "الكويت" :
                 option.value === "qatar" ? "قطر" :
                 option.value === "bahrain" ? "البحرين" :
                 option.value === "oman" ? "عُمان" :
                 option.value === "jordan" ? "الأردن" :
                 option.value === "lebanon" ? "لبنان" :
                 option.value === "syria" ? "سوريا" :
                 option.value === "iraq" ? "العراق" :
                 option.value === "libya" ? "ليبيا" :
                 option.value === "tunisia" ? "تونس" :
                 option.value === "algeria" ? "الجزائر" :
                 option.value === "sudan" ? "السودان" :
                 option.value === "yemen" ? "اليمن" :
                 "أخرى"}
              </option>
            ))}
          </select>
        </div>

        {showCustomFields.nationality && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              حدد الجنسية
            </label>
            <input
              type="text"
              name="customNationality"
              value={formData.customNationality}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل الجنسية"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            بلد الولادة <span className="text-red-500">*</span>
          </label>
          <select
            name="birthCountry"
            value={formData.birthCountry}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="" disabled>
              اختر بلد الولادة
            </option>
            {nationalities.map((option) => (
              <option key={option.id} value={option.value}>
                {option.value === "saudi" ? "السعودية" : 
                 option.value === "uae" ? "الإمارات" :
                 option.value === "egypt" ? "مصر" :
                 option.value === "morocco" ? "المغرب" :
                 option.value === "kuwait" ? "الكويت" :
                 option.value === "qatar" ? "قطر" :
                 option.value === "bahrain" ? "البحرين" :
                 option.value === "oman" ? "عُمان" :
                 option.value === "jordan" ? "الأردن" :
                 option.value === "lebanon" ? "لبنان" :
                 option.value === "syria" ? "سوريا" :
                 option.value === "iraq" ? "العراق" :
                 option.value === "libya" ? "ليبيا" :
                 option.value === "tunisia" ? "تونس" :
                 option.value === "algeria" ? "الجزائر" :
                 option.value === "sudan" ? "السودان" :
                 option.value === "yemen" ? "اليمن" :
                 "أخرى"}
              </option>
            ))}
          </select>
        </div>

        {showCustomFields.birthCountry && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              حدد بلد الولادة
            </label>
            <input
              type="text"
              name="customBirthCountry"
              value={formData.customBirthCountry}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل بلد الولادة"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInformationStep;
