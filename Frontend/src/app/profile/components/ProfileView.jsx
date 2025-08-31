"use client";
// components/profile/ProfileView.jsx
import Image from "next/image";
import {
  FaCalendar,
  FaCheckCircle,
  FaEnvelope,
  FaPhone,
  FaUser,
  FaUserTag,
} from "react-icons/fa";

const ProfileView = ({ user, t, language }) => {
  // Helper function to get profile image URL
  const getProfileImageUrl = () => {
    if (!user?.profileImage) return null;

    // إذا كان profileImage كائن مع url
    if (typeof user.profileImage === "object" && user.profileImage.url) {
      return user.profileImage.url;
    }

    // إذا كان profileImage نص مباشر
    if (
      typeof user.profileImage === "string" &&
      user.profileImage.trim() !== ""
    ) {
      return user.profileImage;
    }

    return null;
  };

  const profileImageUrl = getProfileImageUrl();

  const InfoItem = ({
    icon: Icon,
    label,
    value,
    isLink = false,
    isStatus = false,
  }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <Icon
        className={`mt-1 flex-shrink-0 ${
          isStatus
            ? value === t("profile.activated") || value === t("profile.active")
              ? "text-green-500"
              : "text-red-500"
            : "text-gray-500"
        }`}
      />
      <div className="flex-1">
        <span className="text-gray-600 text-sm font-medium">{label}:</span>
        {isLink && value && value !== t("common.notSpecified") ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-blue-600 hover:text-blue-700 hover:underline break-all"
          >
            {value}
          </a>
        ) : (
          <span className="block text-gray-900 break-words">
            {value || t("common.notSpecified")}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg overflow-hidden ${
        language === "ar" ? "rtl-direction" : "ltr-direction"
      }`}
      data-lang={language}
    >
      {/* Header with gradient */}
      <div className="bg-[#00183D] p-6 lg:p-8">
        <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-white flex items-center gap-3">
          <FaUser className="text-2xl lg:text-3xl" />
          {t("profile.profile")}
        </h1>
      </div>

      {/* Profile content */}
      <div className="p-6 lg:p-8">
        {/* User info header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b">
          {profileImageUrl ? (
            <div className="relative">
              <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
                <Image
                  src={profileImageUrl}
                  alt={user?.name || t("profile.userImage")}
                  width={120}
                  height={120}
                  className="w-full h-full object-cover"
                  priority
                  unoptimized
                  onError={(e) => {
                    // في حالة فشل تحميل الصورة، أخفيها
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement.innerHTML = `
                      <div class="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <svg class="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    `;
                  }}
                />
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <FaCheckCircle className="text-white text-xs" />
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-lg border-4 border-gray-200">
                <FaUser className="text-5xl text-gray-500" />
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <FaCheckCircle className="text-white text-xs" />
              </div>
            </div>
          )}

          <div
            className="text-center sm:text-right flex-1"
            style={{ textAlign: language === "ar" ? "right" : "left" }}
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {user?.name || t("profile.userName")}
            </h2>
            <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-2">
              <FaEnvelope className="text-sm" />
              {user?.email || t("profile.email")}
            </p>
            {user?.role && (
              <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                {user.role === "admin"
                  ? t("profile.admin")
                  : user.role === "user"
                  ? t("profile.user")
                  : user.role}
              </span>
            )}
          </div>
        </div>

        {/* Information grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          style={{ direction: language === "ar" ? "rtl" : "ltr" }}
        >
          <InfoItem
            icon={FaPhone}
            label={t("profile.phone")}
            value={user?.phone}
          />

          <InfoItem
            icon={FaUserTag}
            label={t("profile.bio")}
            value={user?.bio}
          />

          <InfoItem
            icon={FaCalendar}
            label={t("profile.accountCreationDate")}
            value={
              user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString(
                    language === "ar" ? "ar-EG" : "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )
                : t("common.notSpecified")
            }
          />

          <InfoItem
            icon={FaCalendar}
            label={t("profile.lastLogin")}
            value={
              user?.lastLogin
                ? new Date(user.lastLogin).toLocaleDateString(
                    language === "ar" ? "ar-EG" : "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )
                : t("common.notAvailable")
            }
          />

          <InfoItem
            icon={FaCheckCircle}
            label={t("profile.emailStatus")}
            value={
              user?.isEmailVerified
                ? t("profile.activated")
                : t("profile.notActivated")
            }
            isStatus
          />

          {/* <InfoItem
            icon={FaCheckCircle}
            label={t("profile.phoneStatus")}
            value={
              user?.isPhoneVerified
                ? t("profile.activated")
                : t("profile.notActivated")
            }
            isStatus
          /> */}

          <InfoItem
            icon={FaCheckCircle}
            label={t("profile.accountStatus")}
            value={user?.isActive ? t("profile.active") : t("profile.inactive")}
            isStatus
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
