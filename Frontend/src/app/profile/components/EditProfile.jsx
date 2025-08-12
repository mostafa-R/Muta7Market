// components/profile/EditProfile.jsx
import React from "react";

const EditProfile = ({
  register,
  handleSubmit,
  errors,
  onSubmit,
  handleImageChange,
  error,
  success,
  isLoading,
}) => {
  const FormField = ({
    icon,
    label,
    name,
    type = "text",
    placeholder,
    isTextarea = false,
    rows = 4,
  }) => (
    <div className="mb-6">
      <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
        <i className={`fas ${icon} text-purple-600`}></i>
        {label}
      </label>
      {isTextarea ? (
        <textarea
          {...register(name)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <input
          {...register(name)}
          type={type}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          placeholder={placeholder}
        />
      )}
      {errors[name] && (
        <p className="text-red-500 text-sm flex items-center gap-1 mt-2">
          <i className="fas fa-exclamation-circle"></i>
          {errors[name].message}
        </p>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-[#00183D] p-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <i className="fas fa-edit"></i>
          تعديل المعلومات الشخصية
        </h1>
      </div>

      {/* Form Content */}
      <div className="p-6 lg:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-user text-purple-600"></i>
              المعلومات الأساسية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                icon="fa-user"
                label="الاسم الكامل"
                name="name"
                placeholder="أدخل الاسم الكامل"
              />
              <FormField
                icon="fa-envelope"
                label="البريد الإلكتروني"
                name="email"
                type="email"
                placeholder="أدخل البريد الإلكتروني"
              />
              <FormField
                icon="fa-phone"
                label="رقم الهاتف"
                name="phone"
                placeholder="أدخل رقم الهاتف"
              />
              <FormField
                icon="fa-birthday-cake"
                label="تاريخ الميلاد"
                name="dateOfBirth"
                type="date"
              />
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-info-circle text-purple-600"></i>
              معلومات إضافية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                icon="fa-map-marker-alt"
                label="العنوان"
                name="address"
                placeholder="أدخل العنوان"
              />
              <FormField
                icon="fa-briefcase"
                label="المهنة"
                name="occupation"
                placeholder="أدخل المهنة"
              />
              <FormField
                icon="fa-globe"
                label="الموقع الإلكتروني"
                name="website"
                placeholder="https://example.com"
              />
              <div className="md:col-span-2">
                <FormField
                  icon="fa-user-tag"
                  label="النبذة التعريفية"
                  name="bio"
                  placeholder="أكتب نبذة مختصرة عن نفسك..."
                  isTextarea
                />
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-lock text-purple-600"></i>
              الأمان
            </h3>
            <FormField
              icon="fa-lock"
              label="كلمة المرور الجديدة"
              name="password"
              type="password"
              placeholder="أدخل كلمة المرور الجديدة (اختياري)"
            />
          </div>

          {/* Profile Image Section */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-image text-purple-600"></i>
              الصورة الشخصية
            </h3>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-purple-50 file:text-[#00183D] hover:file:bg-purple-100 cursor-pointer"
              />
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
              <i className="fas fa-check-circle"></i>
              {success}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[#00183D] text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  حفظ التغييرات
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
