"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Joi from "joi";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaLock,
  FaImage,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

// تعريف مخططات Joi للتحقق من البيانات
const UserSchema = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string()
    .min(1)
    .required()
    .messages({ "string.empty": "الاسم الكامل مطلوب" }),
  profileImage: Joi.string().uri().allow("").optional(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({ "string.email": "البريد الإلكتروني غير صالح" }),
  phone: Joi.string().allow("").optional(),
  role: Joi.string().required(),
  isEmailVerified: Joi.boolean().required(),
  isPhoneVerified: Joi.boolean().required(),
  phoneVerificationOTP: Joi.string().allow("").optional(),
  phoneVerificationExpires: Joi.date().iso().allow(null).optional(),
  isActive: Joi.boolean().required(),
  refreshTokens: Joi.array().items(Joi.string()).optional(),
  __v: Joi.number().optional(),
  createdAt: Joi.date().iso().required(),
  updatedAt: Joi.date().iso().required(),
  lastLogin: Joi.date().iso().allow(null).optional(),
});

const PendingPaymentSchema = Joi.object({
  id: Joi.string().required(),
  itemName: Joi.string().required(),
  price: Joi.number().positive().required(),
  orderDate: Joi.date().iso().required(),
});

// تعريف أنواع البيانات
interface User {
  _id: string;
  name: string;
  profileImage?: string;
  email: string;
  phone?: string;
  role: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  phoneVerificationOTP?: string;
  phoneVerificationExpires?: string;
  isActive: boolean;
  refreshTokens?: string[];
  __v?: number;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

interface PendingPayment {
  id: string;
  itemName: string;
  price: number;
  orderDate: string;
}

// تعريف عنوان API
const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/profile`;

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const router = useRouter();

  // جلب بيانات المستخدم باستخدام useCallback
  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL, { withCredentials: true });
      // التحقق من وجود البيانات
      if (!response.data?.data?.user) {
        throw new Error("بيانات المستخدم غير متوفرة");
      }
      const { error: userError, value: userData } = UserSchema.validate(
        response.data.data.user,
        { abortEarly: false }
      );
      if (userError) {
        throw new Error(userError.details.map((d) => d.message).join(", "));
      }
      setUser(userData);
      const payments = response.data.data.pendingPayments || [];
      const validatedPayments = payments.map((p: any) => {
        const { error, value } = PendingPaymentSchema.validate(p, {
          abortEarly: false,
        });
        if (error)
          throw new Error(error.details.map((d) => d.message).join(", "));
        return value;
      });
      setPendingPayments(validatedPayments);
      setUsername(userData.name.split(" ")[0]);
    } catch (err) {
      setError("فشل جلب بيانات المستخدم. حاول مرة أخرى.");
      console.error("خطأ في جلب البيانات:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // التحقق من صحة اسم المستخدم باستخدام Joi
  const usernameSchema = Joi.string()
    .pattern(/^[a-zA-Z0-9_]{3,20}$/)
    .required()
    .messages({
      "string.pattern.base":
        "اسم المستخدم غير صالح. يجب أن يكون بين 3-20 حرفًا ويحتوي فقط على أحرف وأرقام و_",
    });

  // التحقق من صحة كلمة المرور باستخدام Joi
  const passwordSchema = Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .allow("")
    .optional()
    .messages({
      "string.pattern.base":
        "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير، حرف صغير، رقم، ورمز خاص",
    });

  // معالجة تحديث الملف الشخصي
  const handleUpdate = useCallback(async () => {
    setError("");
    setSuccess("");

    const { error: usernameError } = usernameSchema.validate(username);
    if (usernameError) {
      setError(usernameError.message);
      return;
    }

    if (password) {
      const { error: passwordError } = passwordSchema.validate(password);
      if (passwordError) {
        setError(passwordError.message);
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append("username", username);
      if (password) formData.append("password", password);
      if (profileImage) formData.append("profileImage", profileImage);

      await axios.patch("/api/user/profile", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("تم تحديث الملف الشخصي بنجاح!");
      fetchUserData();
      setShowConfirmModal(false);
    } catch (err) {
      setError("فشل تحديث المعلومات. حاول مرة أخرى.");
      console.error("خطأ في تحديث البيانات:", err);
    }
  }, [username, password, profileImage, fetchUserData]);

  // معالجة تحميل الصورة
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        setError("يرجى تحميل ملف صورة صالح (مثل JPG أو PNG)");
        return;
      }
      setProfileImage(file);
    }
  };

  // نافذة تأكيد
  const ConfirmModal = useMemo(() => {
    if (!showConfirmModal) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">تأكيد التغييرات</h3>
          <p className="mb-4 text-gray-600">هل أنت متأكد من حفظ التغييرات؟</p>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors duration-200"
            >
              إلغاء
            </button>
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              تأكيد
            </button>
          </div>
        </div>
      </div>
    );
  }, [showConfirmModal, handleUpdate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-100 to-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-red-500 flex items-center justify-center h-screen bg-gradient-to-r from-blue-100 to-gray-100">
        <FaExclamationCircle className="mr-2 text-2xl" /> خطأ في تحميل البيانات
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6  bg-primary min-h-screen grid">
      <h1 className="text-4xl font-extrabold  mb-8 flex items-center">
        <FaUser className="mr-3 text-3xl ml-3" />
        الملف الشخصي
      </h1>

      {/* عرض معلومات المستخدم */}
      <div className="bg-white p-8 rounded-xl shadow-xl mb-8 transform transition-all hover:scale-[1.01]">
        <div className="flex items-center mb-6">
          {user.profileImage ? (
            <Image
              src={user.profileImage}
              alt="صورة المستخدم"
              width={150}
              height={180}
              className="rounded-full w-[150px] h-[150px] border-2 border-muted mr-4 ml-4 shadow-sm"
              priority
              unoptimized
            />
          ) : (
            <div className="w-[100px] h-[100px] rounded-full mr-4 bg-gray-200 flex items-center justify-center">
              <FaUser className="text-4xl text-gray-500" />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-gray-500 flex items-center">
              <FaEnvelope className="mr-2" /> {user.email}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <p className="flex items-center">
            <FaPhone className="mr-2 text-gray-600" />
            <strong className="text-gray-600">رقم الهاتف:</strong>{" "}
            {user.phone || "غير محدد"}
          </p>
          <p className="flex items-center">
            <FaCalendar className="mr-2 text-gray-600" />
            <strong className="text-gray-600">تاريخ إنشاء الحساب:</strong>{" "}
            {new Date(user.createdAt).toLocaleDateString("ar-EG")}
          </p>
          <p className="flex items-center">
            <FaCalendar className="mr-2 text-gray-600" />
            <strong className="text-gray-600">آخر تسجيل دخول:</strong>{" "}
            {user.lastLogin
              ? new Date(user.lastLogin).toLocaleDateString("ar-EG")
              : "غير متوفر"}
          </p>
          <p className="flex items-center">
            <FaCheckCircle
              className={`mr-2 ${
                user.isEmailVerified ? "text-green-500" : "text-red-500"
              }`}
            />
            <strong className="text-gray-600 ml-2 mr-2">حالة البريد الألكتروني :</strong>{" "}
            {user.isEmailVerified ? "مفعّل" : "غير مفعّل"}
          </p>
        
          <p className="flex items-center">
            <FaCheckCircle
              className={`mr-2 ${
                user.isActive ? "text-green-500" : "text-red-500"
              }`}
            />
            <strong className="text-gray-600">حالة الحساب:</strong>{" "}
            {user.isActive ? "نشط" : "غير نشط"}
          </p>
        </div>
      </div>

      {/* تعديل المعلومات */}
      <div className="bg-white p-8 rounded-xl shadow-xl mb-8 transform transition-all hover:scale-[1.01]">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <FaLock className="mr-2" /> تعديل المعلومات
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-gray-600 mb-2 flex items-center">
              <FaUser className="mr-2" /> اسم المستخدم
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="أدخل اسم المستخدم"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-2 flex items-center">
              <FaLock className="mr-2" /> كلمة المرور الجديدة
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="أدخل كلمة المرور الجديدة"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-2 flex items-center">
              <FaImage className="mr-2" /> الصورة الشخصية
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-3 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          {error && (
            <p className="text-red-500 flex items-center">
              <FaExclamationCircle className="mr-2" /> {error}
            </p>
          )}
          {success && (
            <p className="text-green-500 flex items-center">
              <FaCheckCircle className="mr-2" /> {success}
            </p>
          )}
          <button
            onClick={() => setShowConfirmModal(true)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center"
            disabled={isLoading}
          >
            <FaCheckCircle className="mr-2" /> حفظ التغييرات
          </button>
        </div>
      </div>

      {/* المدفوعات المعلقة */}
      <div className="bg-white p-8 rounded-xl shadow-xl transform transition-all hover:scale-[1.01]">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <FaCalendar className="mr-2" /> المدفوعات المعلقة
        </h2>
        {pendingPayments.length === 0 ? (
          <p className="text-gray-500">لا توجد مدفوعات معلقة</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingPayments.map((payment) => (
              <div
                key={payment.id}
                className="p-6 border rounded-lg hover:shadow-lg transition-shadow duration-300 bg-gray-50"
              >
                <p className="flex items-center">
                  <strong className="text-gray-600">اسم العنصر:</strong>{" "}
                  <span className="mr-2">{payment.itemName}</span>
                </p>
                <p className="flex items-center">
                  <strong className="text-gray-600">السعر:</strong>{" "}
                  <span className="mr-2">{payment.price} $</span>
                </p>
                <p className="flex items-center">
                  <strong className="text-gray-600">تاريخ الطلب:</strong>{" "}
                  <span className="mr-2">
                    {new Date(payment.orderDate).toLocaleDateString("ar-EG")}
                  </span>
                </p>
                <button
                  onClick={() => router.push(`/payment/${payment.id}`)}
                  className="mt-4 text-blue-500 underline hover:text-blue-700 transition-colors"
                >
                  استكمال الدفع الآن
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {ConfirmModal}
    </div>
  );
};

export default UserProfile;
