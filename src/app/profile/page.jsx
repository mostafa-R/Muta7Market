// app/profile/page.jsx
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
import { ProfileFormSchema } from "./components/validation.js";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
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
    try {
      const response = await axios.get(`${API_URL}/auth/profile`, {
        withCredentials: true,
      });
      if (!response.data?.data?.user) {
        throw new Error("بيانات المستخدم غير متوفرة");
      }

      const userData = response.data.data.user;
      setUser(userData);
      reset({
        name: userData.name,
        email: userData.email,
        phone: userData.phone || "",
        address: userData.address || "",
        occupation: userData.occupation || "",
        website: userData.website || "",
        bio: userData.bio || "",
        dateOfBirth: userData.dateOfBirth
          ? new Date(userData.dateOfBirth).toISOString().split("T")[0]
          : "",
      });

      setPendingPayments(response.data.data.pendingPayments || []);
    } catch (err) {
      setError("فشل جلب بيانات المستخدم. حاول مرة أخرى.");
      console.error("خطأ في جلب البيانات:", err);
    } finally {
      setIsLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const onSubmit = useCallback(
    async (data) => {
      setError("");
      setSuccess("");
      try {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
          if (data[key]) formData.append(key, data[key]);
        });
        if (profileImage) formData.append("profileImage", profileImage);

        await axios.patch(`${API_URL}/user/update`, formData, {
          withCredentials: true,
        });

        setSuccess("تم تحديث الملف الشخصي بنجاح!");
        fetchUserData();
        setShowConfirmModal(false);
      } catch (err) {
        setError("فشل تحديث المعلومات. حاول مرة أخرى.");
        console.error("خطأ في تحديث البيانات:", err);
      }
    },
    [profileImage, fetchUserData]
  );

  const handleImageChange = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        setError("يرجى تحميل ملف صورة صالح (مثل JPG أو PNG)");
        return;
      }
      setProfileImage(file);
    }
  }, []);

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
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden mb-4 p-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="فتح القائمة"
          >
            <IoMdMenu className=" text-xl text-gray-700"></IoMdMenu>
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
                error={error}
                success={success}
                isLoading={isLoading}
              />
            )}

            {activeSection === "payments" && (
              <PaymentsSection payments={pendingPayments} router={router} />
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
        />
      )}
    </div>
  );
};

export default UserProfile;
