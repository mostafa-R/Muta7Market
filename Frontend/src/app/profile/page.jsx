"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { joiResolver } from "@hookform/resolvers/joi";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

// Import Components
import LoadingSpinner from "../component/LoadingSpinner";
import ConfirmModal from "./components/ConfirmModal";
import EditProfile from "./components/EditProfile";
import ErrorMessage from "./components/ErrorMessage";
import PaymentsSection from "./components/PaymentsSection";
import ProfileView from "./components/ProfileView";
import Sidebar from "./components/Sidebar";
// Import Schemas
import { IoMdMenu } from "react-icons/io";
import PlayerProfile from "./components/PlayerProfile";
import { createProfileFormSchema } from "./components/validation.js";

// Ensure API base includes /api/v1
const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}`;

const UserProfile = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [user, setUser] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [pricing, setPricing] = useState(null);
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
    resolver: joiResolver(createProfileFormSchema(t)),
  });

  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/signin");
        return;
      }

      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data?.user) {
        throw new Error(t("profile.userDataUnavailable"));
      }

      const userData = response.data.user;
      setUser(userData);

      // Set values in the form
      reset({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        bio: userData.bio || "",
        newPassword: "",
        confirmPassword: "",
        oldPassword: "",
      });

      // Set current image preview
      if (userData.profileImage?.url) {
        setImagePreview(userData.profileImage.url);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/signin");
      } else {
        setError(t("profile.failedToFetchUserData"));
      }
    } finally {
      setIsLoading(false);
    }
  }, [reset, router, t]);

  const fetchPendingPayments = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${API_URL}/user/notpaid`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data || {};
      const items = [];
      const source = Array.isArray(data.unpaidPayments)
        ? data.unpaidPayments
        : Array.isArray(data.payments)
        ? data.payments
        : [];
      if (source.length) {
        items.push(
          ...source.map((p) => ({
            _id: p._id,
            type: p.type,
            amount: p.amount,
            currency: p.currency,
            status: p.status,
            createdAt: p.createdAt,
            relatedPlayer: p.relatedPlayer,
            description: p.description,
            invoice: p.invoice,
            gateway: p.gateway,
          }))
        );
      } else if (Array.isArray(data.pendingPayments)) {
        items.push(
          ...data.pendingPayments.map((p) => ({
            _id: p._id,
            type: p.type,
            amount: p.amount,
            currency: p.currency,
            status: p.status,
            createdAt: p.createdAt,
            relatedPlayer: p.relatedPlayer,
            description: p.description,
          }))
        );
      }
      if (data.inactivePlayer) {
        items.push({ ...data.inactivePlayer, isActive: false });
      }
      const unpaid = items.filter((p) => {
        const s = String(p.status || "").toLowerCase();
        return s !== "completed" && s !== "refunded"; // show pending/failed/cancelled etc.
      });
      setPendingPayments(unpaid);
      setInvoices(Array.isArray(data.invoices) ? data.invoices : []);
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  }, []);

  const fetchPricing = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/config/pricing`);
      setPricing(res.data?.data || null);
    } catch (e) {
      // ignore; frontend will fallback
    }
  }, []);

  const fetchPlayerData = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/signin");
        return;
      }

      const response = await axios.get(`${API_URL}/players/playerprofile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Check if data exists in the response
      if (response.data && response.data.data) {
        const playerData = response.data.data;
        setPlayer(playerData);
      } else {
        throw new Error(t("profile.noPlayerDataFound"));
      }

      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("Error fetching player data:", err);

      // Better error handling
      if (err.response) {
        if (err.response.status === 401) {
          setError(t("profile.unauthorizedAccess"));
          localStorage.removeItem("token");
          router.push("/signin");
        } else if (err.response.status === 404) {
          setError(t("profile.playerDataNotFound"));
        } else {
          setError(
            err.response.data?.message || t("profile.errorFetchingData")
          );
        }
      } else if (err.request) {
        setError(t("profile.connectionFailed"));
      } else {
        setError(err.message || t("profile.unexpectedError"));
      }
    } finally {
      setIsLoading(false); // Stop loading in all cases
    }
  }, [router, t]);

  useEffect(() => {
    fetchUserData();
    fetchPendingPayments();
    fetchPlayerData();
    fetchPricing();
  }, [fetchUserData, fetchPendingPayments, fetchPlayerData, fetchPricing]);

  // Handle Paylink return (/?pid=...&paid=1)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const pid = params.get("pid");
      const paid = params.get("paid");
      const txn =
        params.get("transactionNo") ||
        params.get("TransactionNo") ||
        params.get("transactionID");
      if (pid && paid) {
        // If payment completed or cancelled, refresh status from backend
        const token = localStorage.getItem("token");
        fetch(`${API_URL}/payments/${pid}/status`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
          .then((r) => r.json())
          .then((j) => {
            const status = String(j?.data?.status || "").toUpperCase();
            if (status.includes("COMPLETED")) {
              setSuccess(t("profile.paymentSuccess"));
            } else if (
              status.includes("FAILED") ||
              status.includes("CANCELLED")
            ) {
              setError(t("profile.paymentFailed"));
            }
          })
          .catch(() => {});
      }
      // If we have a transaction number from Paylink, confirm by transaction
      if (txn) {
        fetch(`${API_URL}/payments/status/transaction/${txn}`)
          .then((r) => r.json())
          .then((j) => {
            const status = String(j?.data?.status || "").toUpperCase();
            if (status.includes("COMPLETED")) {
              setSuccess(t("profile.paymentSuccess"));
            } else if (
              status.includes("FAILED") ||
              status.includes("CANCELLED")
            ) {
              setError(t("profile.paymentFailed"));
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, []);

  const onSubmit = useCallback(
    async (data) => {
      setError("");
      setSuccess("");
      setIsUpdating(true);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/signin");
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

          setSuccess(t("profile.profileUpdatedSuccessfully"));

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
          router.push("/signin");
        } else if (err.response?.data?.errors) {
          const validationErrors = err.response.data.errors;
          const errorMessages = Object.values(validationErrors).join(", ");
          setError(errorMessages);
        } else if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError(t("profile.updateFailed"));
        }
      } finally {
        setIsUpdating(false);
      }
    },
    [profileImage, fetchUserData, router, t]
  );

  const handleImageChange = useCallback(
    (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];

        if (!file.type.startsWith("image/")) {
          setError(t("profile.pleaseUploadValidImage"));
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          setError(t("profile.imageSizeLimitExceeded"));
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
    },
    [t]
  );

  const handleCancelImage = useCallback(() => {
    setProfileImage(null);
    if (user?.profileImage?.url) {
      setImagePreview(user.profileImage.url);
    } else {
      setImagePreview(null);
    }
  }, [user]);

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <ErrorMessage message={t("profile.errorLoadingData")} />;

  return (
    <div
      className="min-h-screen bg-[#ffffff]"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="flex relative">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          t={t}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <button
            className="lg:hidden mb-4 p-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
            onClick={() => setIsSidebarOpen(true)}
            aria-label={t("common.openMenu")}
          >
            <IoMdMenu className="text-xl text-gray-700" />
          </button>

          <div className="animate-fadeIn">
            {activeSection === "profile" && (
              <ProfileView user={user} t={t} language={language} />
            )}

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
                t={t}
                language={language}
              />
            )}

            {activeSection === "payments" && (
              <PaymentsSection
                payments={pendingPayments}
                invoices={invoices}
                pricing={pricing}
                router={router}
                t={t}
                language={language}
              />
            )}
            {activeSection === "playerProfile" && (
              <PlayerProfile
                player={player}
                handleSubmit={onSubmit}
                isLoading={isUpdating}
                error={error}
                success={success}
                router={router}
                t={t}
                language={language}
              />
            )}
          </div>
        </main>
      </div>

      {showConfirmModal && (
        <ConfirmModal
          title={t("profile.confirmChanges")}
          message={t("profile.areYouSureToSaveChanges")}
          onConfirm={handleSubmit(onSubmit)}
          onCancel={() => setShowConfirmModal(false)}
          isLoading={isUpdating}
          t={t}
        />
      )}
    </div>
  );
};

export default UserProfile;
