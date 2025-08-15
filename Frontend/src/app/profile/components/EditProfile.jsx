"use client";
import { Eye, EyeOff, Upload, X } from "lucide-react";
import { useState } from "react";

const EditProfile = ({
  register,
  handleSubmit,
  errors,
  onSubmit,
  handleImageChange,
  handleCancelImage,
  imagePreview,
  profileImage,
  error,
  success,
  isLoading,
  t,
  language,
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
        <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
          <i className={`fas ${icon} text-purple-600`}></i>
          {label}
        </label>

        {isTextarea ? (
          <textarea
            {...register(name)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00183D] text-gray-700 focus:border-transparent transition-all resize-none"
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
          />
        ) : (
          <div className="relative">
            <input
              {...register(name)}
              type={type === "password" && showPassword ? "text" : type}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00183D] focus:border-transparent transition-all"
              placeholder={placeholder}
              disabled={disabled}
            />
            {type === "password" && (
              <button
                type="button"
                onClick={togglePassword}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            )}
          </div>
        )}

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
      <div className="bg-[#00183D] p-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <i className="fas fa-edit"></i>
          {t("profile.editProfile")}
        </h1>
      </div>

      <div className="p-6 lg:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Image Section */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-image text-purple-600"></i>
              {t("profile.profileImage")}
            </h3>

            <div className="space-y-4">
              {/* معاينة الصورة */}
              {imagePreview && (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt={t("profile.profileImagePreview")}
                    className="w-32 h-32 rounded-full object-cover border-4 border-purple-100"
                  />
                  {profileImage && (
                    <button
                      type="button"
                      onClick={handleCancelImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              )}

              {/* زر رفع الصورة */}
              <div className="flex items-center gap-4">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-[#00183D] rounded-xl hover:bg-purple-100 transition-colors">
                    <Upload size={20} />
                    <span>
                      {profileImage
                        ? t("profile.changeImage")
                        : t("profile.chooseImage")}
                    </span>
                  </div>
                </label>

                {profileImage && (
                  <span className="text-sm text-green-600">
                    {t("profile.selected")}: {profileImage.name}
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-500">
                {t("profile.allowedImageFormats")}
              </p>
            </div>
          </div>

          {/* Basic Information Section */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-user text-[#00183D]"></i>
              {t("profile.basicInformation")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                icon="fa-user"
                label={t("profile.name")}
                name="name"
                placeholder={t("profile.enterFullName")}
              />
              <FormField
                icon="fa-envelope"
                label={t("profile.email")}
                name="email"
                type="email"
                placeholder={t("profile.enterEmail")}
                disabled={true}
              />
              <FormField
                icon="fa-phone"
                label={t("profile.phone")}
                name="phone"
                placeholder={t("profile.enterPhone")}
              />
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-info-circle text-purple-600"></i>
              {t("profile.additionalInformation")}
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <FormField
                icon="fa-user-tag"
                label={t("profile.bio")}
                name="bio"
                placeholder={t("profile.writeShortBio")}
                isTextarea
              />
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-lock text-purple-600"></i>
              {t("profile.security")}
            </h3>
            <FormField
              icon="fa-lock"
              label={t("profile.newPassword")}
              name="newPassword"
              type="password"
              placeholder={t("profile.newPasswordOptional")}
            />
            <FormField
              icon="fa-lock"
              label={t("profile.confirmNewPassword")}
              name="confirmPassword"
              type="password"
              placeholder={t("profile.confirmNewPassword")}
            />
            <FormField
              icon="fa-lock"
              label={t("profile.currentPassword")}
              name="oldPassword"
              type="password"
              placeholder={t("profile.currentPasswordRequired")}
            />
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

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              onClick={() => window.location.reload()}
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[#00183D] text-white rounded-xl hover:bg-[#001a3d] transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  {t("common.saving")}
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  {t("common.save")}
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
