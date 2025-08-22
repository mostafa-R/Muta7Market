"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { joiResolver } from "@hookform/resolvers/joi";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
// Import Components
import LoadingSpinner from "../component/LoadingSpinner";
import ConfirmModal from "./components/ConfirmModal";
import EditProfile from "./components/EditProfile";
import ErrorMessage from "./components/ErrorMessage";
import PaymentsSection from "./components/PaymentsSection.jsx";
import ProfileView from "./components/ProfileView";
import Sidebar from "./components/Sidebar";
// Import Schemas
import { IoMdMenu } from "react-icons/io";
import PlayerProfile from "./components/PlayerProfile";
import { createProfileFormSchema } from "./components/validation.js";
import PromoteNowButton from "./components/PromoteNowButton";

// Ensure API base includes /api/v1
const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}`.replace(/\/$/, "").endsWith("/api/v1")
  ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}`.replace(/\/$/, "")
  : `${(process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "")}/api/v1`;

const UserProfile = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [user, setUser] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [pricingError, setPricingError] = useState("");
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
  const [paymentBanner, setPaymentBanner] = useState(null); // { type: 'success'|'info'|'error', message: string }

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
      const headers = { Authorization: `Bearer ${token}` };

      // PENDING invoices → feed the “payments” list (cards with Pay buttons)
      const pendingRes = await axios.get(
        `${API_URL}/payments/invoices?status=pending`,
        { headers }
      );
      const pendingItems = (pendingRes.data?.data?.items || []).map((inv) => ({
        _id: inv.id, // use invoice id
        type:
          inv.product === "player_listing"
            ? "publish_profile"
            : "unlock_contacts",
        status: inv.status, // 'pending'
        amount: inv.amount,
        currency: inv.currency || "SAR",
        createdAt: inv.createdAt,
        relatedPlayer: inv.playerProfileId, // needed for listing payments
        invoice: { orderNumber: inv.orderNumber },
        gateway: "paylink",
        paymentUrl: inv.paymentUrl || null, // handy if you want a direct Pay link
      }));
      setPendingPayments(pendingItems);

      // PAID invoices → feed “invoices” list in the tab
      const paidRes = await axios.get(
        `${API_URL}/payments/invoices?status=paid`,
        { headers }
      );
      setInvoices(paidRes.data?.data?.items || []);
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  }, [API_URL]);

  const fetchPricing = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/config/pricing`);
      const data = res.data?.data; 
      if (!data) throw new Error(t("formErrors.missingPricingData"));
      setPricing(data);
      setPricingError("");
    } catch (e) {
      setPricing(null);
      setPricingError(t("formErrors.failedToLoadPricing"));
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
    // Respect tab query param on initial load
    try {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab && ["profile", "edit", "payments", "playerProfile"].includes(tab)) {
        setActiveSection(tab);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const paid = params.get("paid");
      if (paid === "1") {
        setSuccess(t("profile.paymentSuccess"));
        setPaymentBanner({ type: "success", message: t("formErrors.paymentSuccess") });
        toast.success(t("formErrors.paymentSuccess"));
        // Refresh user, invoices, and player data after webhook processes
        fetchUserData();
        fetchPendingPayments();
        fetchPlayerData();
      } else if (paid === "0") {
        setError(t("profile.paymentFailed"));
        setPaymentBanner({ type: "error", message: t("profile.paymentFailed") });
        toast.error(t("formErrors.paymentFailed"));
        fetchPendingPayments();
      }
    } catch { }
  }, [fetchUserData, fetchPendingPayments, fetchPlayerData, t]);

  // Handle Paylink callback with invoiceId/orderNumber/transactionNo → one-time reconcile + recheck
  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const invoiceId = params.get("invoiceId");
      const orderNumber = params.get("orderNumber");
      const transactionNo = params.get("transactionNo");
      if (!invoiceId && !orderNumber && !transactionNo) return;

      // Ensure payments tab is visible for user
      setActiveSection("payments");

      // Let user know we are processing callback
      toast.info(t("formErrors.paymentPending"));

      // Clean URL params ASAP to avoid duplicate triggers in StrictMode
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete("invoiceId");
      currentUrl.searchParams.delete("orderNumber");
      currentUrl.searchParams.delete("transactionNo");
      currentUrl.searchParams.delete("paid");
      window.history.replaceState({}, "", currentUrl.toString());

      // Session guard to ensure one-time handling
      const guardKey = `paylink_cb_${orderNumber || invoiceId || transactionNo}`;
      if (sessionStorage.getItem(guardKey)) return;
      sessionStorage.setItem(guardKey, "1");

      const token = localStorage.getItem("token");
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };

      // Prefer Paylink-backed recheck first; only fall back to DB status if no orderNumber
      let decided = false;
      if (orderNumber) {
        try {
          const res = await axios.post(
            `${API_URL}/payments/invoices/recheck/${encodeURIComponent(orderNumber)}`,
            {},
            { headers }
          );
          const status = String(res.data?.data?.status || "").toLowerCase();
          const paid = Boolean(res.data?.data?.paid) || status === "paid";
          if (paid) {
            toast.success(t("formErrors.paymentSuccess"));
          } else {
            const backendMsg = res.data?.data?.error || "";
            if (backendMsg) {
              toast.error(String(backendMsg));
            } else {
              toast.info(t("formErrors.paymentPending"));
            }
          }
          decided = true;
        } catch (e) {
          console.warn("recheck failed", e);
        }
      }

      if (!decided && invoiceId) {
        try {
          const res = await axios.get(`${API_URL}/payments/status/${invoiceId}`, { headers });
          const status = String(res.data?.data?.status || "").toLowerCase();
          if (status === "paid") {
            toast.success(t("formErrors.paymentSuccess"));
          } else {
            const errs = res.data?.data?.paymentErrors || [];
            const firstErr = Array.isArray(errs) && errs.length ? (errs[0]?.message || errs[0]?.title || "") : "";
            if (firstErr) {
              toast.error(String(firstErr));
            } else {
              toast.info(t("formErrors.paymentPending"));
            }
          }
          decided = true;
        } catch (e) {
          console.warn("status check failed", e);
        }
      }

      if (!decided) {
        toast.info(t("formErrors.paymentPending"));
      }

      // Refresh UI regardless
      fetchUserData();
      fetchPendingPayments();
      fetchPlayerData();

      // Best-effort reconcile in the background to sync any other invoices
      try {
        axios.post(`${API_URL}/payments/reconcile`, {}, { headers }).catch(() => {});
      } catch {}
    };
    run();
    // Intentionally run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    {/* {!player?.isPromoted?.status && (
  <PromoteNowButton profileId={player?._id} />
)} */}

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
              <div className="mt-6">
           
                <PaymentsSection />
              </div>
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

      {pricingError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-rose-50 text-rose-700 border border-rose-200 px-4 py-2 rounded-xl shadow">
          {pricingError}
        </div>
      )}
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
