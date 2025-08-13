// components/profile/EditProfile.jsx
"use client";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

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
    disabled = false,
    placeholder,
    isTextarea = false,
    rows = 4,
  }) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => setShowPassword((prev) => !prev);

    return (
      <div className="mb-6">
        {/* Label */}
        <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
          <i className={`fas ${icon} text-purple-600`}></i>
          {label}
        </label>

        {/* Input / Textarea */}
        {isTextarea ? (
          <textarea
            {...register(name)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00183D] text-gray-500 focus:border-transparent transition-all resize-none"
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
          />
        ) : (
          <div className="relative">
            <input
              {...register(name)}
              type={type === "password" && showPassword ? "text" : type}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00183D] focus:border-transparent transition-all pr-10"
              placeholder={placeholder}
              disabled={disabled}
            />
            {type === "password" && (
              <button
                type="button"
                onClick={togglePassword}
                className="absolute left-7 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            )}
          </div>
        )}

        {/* Error Message */}
        {errors?.[name] && (
          <p className="text-red-500 text-sm flex items-center gap-1 mt-2">
            <i className="fas fa-exclamation-circle"></i>
            {errors[name].message}
          </p>
        )}
      </div>
    );
  };

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
              <i className="fas fa-user text-[#00183D]"></i>
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
                disabled={true}
              />
              <FormField
                icon="fa-phone"
                label="رقم الهاتف"
                name="phone"
                placeholder="أدخل رقم الهاتف"
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
              placeholder=" كلمة المرور الجديدة"
            />
            <FormField
              icon="fa-lock"
              label="تاكيد كلمة المرور الجديدة"
              name="confirmPassword"
              type="password"
              placeholder="تاكيد كلمة المرور الجديدة"
            />

            <FormField
              icon="fa-lock"
              label="كلمة المرور الحالية"
              name="oldPassword"
              type="password"
              placeholder="كلمة المرور الحالية"
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
