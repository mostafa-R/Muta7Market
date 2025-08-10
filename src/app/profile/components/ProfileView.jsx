// components/profile/ProfileView.jsx
import React from "react";
import Image from "next/image";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaBriefcase,
  FaGlobe,
  FaUserTag,
  FaBirthdayCake,
} from "react-icons/fa";

const ProfileView = ({ user }) => {
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
            ? value === "مفعّل" || value === "نشط"
              ? "text-green-500"
              : "text-red-500"
            : "text-gray-500"
        }`}
      />
      <div className="flex-1">
        <span className="text-gray-600 text-sm font-medium">{label}:</span>
        {isLink && value && value !== "غير محدد" ? (
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
            {value || "غير محدد"}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-[#00183D] p-6 lg:p-8">
        <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-white flex items-center gap-3">
          <FaUser className="text-2xl lg:text-3xl" />
          الملف الشخصي
        </h1>
      </div>

      {/* Profile content */}
      <div className="p-6 lg:p-8">
        {/* User info header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b">
          {user.profileImage ? (
            <div className="relative rounded-full">
              <Image
                src={user.profileImage}
                alt="صورة المستخدم"
                width={120}
                height={120}
                className="rounded-full border-4 border-gray-200 shadow-lg"
                priority
                unoptimized
              />
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
          ) : (
            <div className="relative">
              <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-lg">
                <FaUser className="text-5xl text-gray-500" />
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
          )}

          <div className="text-center sm:text-right flex-1">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {user.name}
            </h2>
            <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-2">
              <FaEnvelope className="text-sm" />
              {user.email}
            </p>
          </div>
        </div>

        {/* Information grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem icon={FaPhone} label="رقم الهاتف" value={user.phone} />
          <InfoItem
            icon={FaMapMarkerAlt}
            label="العنوان"
            value={user.address}
          />
          <InfoItem icon={FaBriefcase} label="المهنة" value={user.occupation} />
          <InfoItem
            icon={FaGlobe}
            label="الموقع الإلكتروني"
            value={user.website}
            isLink
          />
          <InfoItem
            icon={FaUserTag}
            label="النبذة التعريفية"
            value={user.bio}
          />
          <InfoItem
            icon={FaBirthdayCake}
            label="تاريخ الميلاد"
            value={
              user.dateOfBirth
                ? new Date(user.dateOfBirth).toLocaleDateString("ar-EG")
                : null
            }
          />
          <InfoItem
            icon={FaCalendar}
            label="تاريخ إنشاء الحساب"
            value={new Date(user.createdAt).toLocaleDateString("ar-EG")}
          />
          <InfoItem
            icon={FaCalendar}
            label="آخر تسجيل دخول"
            value={
              user.lastLogin
                ? new Date(user.lastLogin).toLocaleDateString("ar-EG")
                : "غير متوفر"
            }
          />
          <InfoItem
            icon={FaCheckCircle}
            label="حالة البريد الإلكتروني"
            value={user.isEmailVerified ? "مفعّل" : "غير مفعّل"}
            isStatus
          />
          <InfoItem
            icon={FaCheckCircle}
            label="حالة الحساب"
            value={user.isActive ? "نشط" : "غير نشط"}
            isStatus
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
