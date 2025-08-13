"use client";

import { joiResolver } from "@hookform/resolvers/joi";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// Import Components
import ConfirmModal from "./components/ConfirmModal";
import EditProfile from "./components/EditProfile";
import ErrorMessage from "./components/ErrorMessage";
import LoadingSpinner from "./components/LoadingSpinner";
import PaymentsSection from "./components/PaymentsSection";
import ProfileView from "./components/ProfileView";
import Sidebar from "./components/Sidebar";
// Import Schemas
import { IoMdMenu } from "react-icons/io";
import PlayerProfile from "./components/PlayerProfile";
import { ProfileFormSchema } from "./components/validation.js";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [player, setPlayer] = useState(null);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: joiResolver(ProfileFormSchema),
  });

  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data?.user) {
        throw new Error("بيانات المستخدم غير متوفرة");
      }

      const userData = response.data.user;
      setUser(userData);

      // تعيين القيم في النموذج
      reset({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        bio: userData.bio || "",
        newPassword: "",
        confirmPassword: "",
        oldPassword: "",
      });

      // تعيين معاينة الصورة الحالية
      if (userData.profileImage?.url) {
        setImagePreview(userData.profileImage.url);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        setError("فشل جلب بيانات المستخدم. حاول مرة أخرى.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [reset, router]);

  const fetchPendingPayments = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${API_URL}/user/notpaid`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPendingPayments(response.data ? [response.data] : []);
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  }, []);

  const fetchPlayerData = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios.get(`${API_URL}/players/playerprofile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // التحقق من وجود البيانات في الاستجابة
      if (response.data && response.data.data) {
        const playerData = response.data.data; // استخدام response.data.data
        console.log("Player Data:", playerData);
        setPlayer(playerData);
      } else {
        throw new Error("No player data found");
      }

      setError(""); // مسح أي أخطاء سابقة
    } catch (err) {
      console.error("Error fetching player data:", err);

      // معالجة الأخطاء بشكل أفضل
      if (err.response) {
        if (err.response.status === 401) {
          setError("غير مصرح لك بالوصول. يرجى تسجيل الدخول مرة أخرى.");
          localStorage.removeItem("token");
          router.push("/login");
        } else if (err.response.status === 404) {
          setError("لم يتم العثور على بيانات اللاعب.");
        } else {
          setError(err.response.data?.message || "حدث خطأ في جلب البيانات.");
        }
      } else if (err.request) {
        setError("فشل الاتصال بالخادم. تحقق من اتصالك بالإنترنت.");
      } else {
        setError(err.message || "حدث خطأ غير متوقع.");
      }
    } finally {
      setIsLoading(false); // إيقاف التحميل في جميع الحالات
    }
  }, [router]);

  useEffect(() => {
    fetchUserData();
    fetchPendingPayments();
    fetchPlayerData();
  }, [fetchUserData, fetchPendingPayments, fetchPlayerData]);

  const onSubmit = useCallback(
    async (data) => {
      setError("");
      setSuccess("");
      setIsUpdating(true);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const formData = new FormData();

        if (data.name && data.name.trim()) {
          formData.append("name", data.name.trim());
        }

        if (data.phone && data.phone.trim()) {
          formData.append("phone", data.phone.trim());
        }

        if (data.bio) {
          formData.append("bio", data.bio.trim());
        }

        if (data.newPassword && data.newPassword.trim()) {
          formData.append("newPassword", data.newPassword);
          formData.append("confirmPassword", data.confirmPassword);
          formData.append("oldPassword", data.oldPassword);
        }

        if (profileImage) {
          formData.append("profileImage", profileImage);
        }

        const response = await axios.patch(`${API_URL}/user/update`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.user) {
          setUser(response.data.user);

          const updatedUser = {
            ...response.data.user,
            profileImage: response.data.user.profileImage || null,
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));

          setSuccess("تم تحديث الملف الشخصي بنجاح!");

          setProfileImage(null);

          if (response.data.user.profileImage?.url) {
            setImagePreview(response.data.user.profileImage.url);
          }

          setShowConfirmModal(false);

          setTimeout(() => {
            fetchUserData();
          }, 1000);
        }
      } catch (err) {
        console.error("Update error:", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
        } else if (err.response?.data?.errors) {
          const validationErrors = err.response.data.errors;
          const errorMessages = Object.values(validationErrors).join(", ");
          setError(errorMessages);
        } else if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError("فشل تحديث المعلومات. حاول مرة أخرى.");
        }
      } finally {
        setIsUpdating(false);
      }
    },
    [profileImage, fetchUserData, reset, router]
  );

  const handleImageChange = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (!file.type.startsWith("image/")) {
        setError("يرجى تحميل ملف صورة صالح (JPG, PNG, GIF, WebP)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("حجم الصورة يجب أن لا يتجاوز 5 ميجابايت");
        return;
      }

      setProfileImage(file);
      setError("");

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleCancelImage = useCallback(() => {
    setProfileImage(null);
    if (user?.profileImage?.url) {
      setImagePreview(user.profileImage.url);
    } else {
      setImagePreview(null);
    }
  }, [user]);

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <ErrorMessage message="خطأ في تحميل البيانات" />;

  return (
    <div className="min-h-screen bg-[#ffffff]">
      <div className="flex relative">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <button
            className="lg:hidden mb-4 p-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="فتح القائمة"
          >
            <IoMdMenu className="text-xl text-gray-700" />
          </button>

          <div className="animate-fadeIn">
            {activeSection === "profile" && <ProfileView user={user} />}

            {activeSection === "edit" && (
              <EditProfile
                register={register}
                handleSubmit={handleSubmit}
                errors={errors}
                onSubmit={() => setShowConfirmModal(true)}
                handleImageChange={handleImageChange}
                handleCancelImage={handleCancelImage}
                imagePreview={imagePreview}
                profileImage={profileImage}
                error={error}
                success={success}
                isLoading={isUpdating}
              />
            )}

            {activeSection === "payments" && (
              <PaymentsSection payments={pendingPayments} router={router} />
            )}
            {activeSection === "playerProfile" && (
              <PlayerProfile
                player={player}
                handleSubmit={onSubmit}
                isLoading={isUpdating}
                error={error}
                success={success}
              />
            )}
          </div>
        </main>
      </div>

      {showConfirmModal && (
        <ConfirmModal
          title="تأكيد التغييرات"
          message="هل أنت متأكد من حفظ التغييرات؟"
          onConfirm={handleSubmit(onSubmit)}
          onCancel={() => setShowConfirmModal(false)}
          isLoading={isUpdating}
        />
      )}
    </div>
  );
};

export default UserProfile;
