"use client";
import axios from "axios";
import { Eye, EyeOff, FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const PlayerProfile = ({
  player,
  handleSubmit,
  isLoading,
  error,
  success,
  router,
  onChange,
  t,
  language,
}) => {
  const [isEditing, setIsEditing] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({});

  const togglePassword = () => setShowPassword((prev) => !prev);

  const FormField = ({
    label,
    value,
    isPassword = false,
    isDisabled = false,
    onChange,
  }) => (
    <div className="mb-6">
      <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
        {label}
      </label>
      {isPassword ? (
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={value}
            disabled={isDisabled}
            onChange={onChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00183D] focus:border-transparent transition-all"
          />
          <button
            type="button"
            onClick={togglePassword}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      ) : (
        <input
          type="text"
          value={value}
          disabled={isDisabled}
          onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00183D] focus:border-transparent transition-all"
        />
      )}
    </div>
  );

  // تحقق مما إذا كانت بيانات اللاعب موجودة
  if (!player) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-[#00183D] p-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <i className="fas fa-user"></i>
            {t("profile.profile")}
          </h1>
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 h-full">
              <i className="fas fa-user text-[#00183D]"></i>
              {t("profile.notRegisteredYet")}
            </h3>
            <Link href="/register-profile">
              <button
                type="button"
                className="inline-flex items-center justify-center bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg text-lg px-8 py-4 hover:bg-[hsl(var(--primary)/0.9)] transition"
              >
                <FileText className="w-5 h-5 ml-2" />
                {t("profile.registerNow")}
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // إعداد البيانات الأولية للحقول
  useEffect(() => {
    if (player) {
      setFormData({
        name: player.name || "",
        age: player.age || "",
        gender: player.gender || "",
        nationality: player.nationality || "",
        jop: player.jop || "",
        position: player.position || "",
        status: player.status || "",
        expreiance: player.expreiance || "",
        monthlySalary: player.monthlySalary.amount || "",
        yearSalary: player.yearSalary.amount || "",
        password: "", // لا نعرض كلمة المرور
      });
    }
  }, [player]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit(formData);
  };

  const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePlayerProfile = async () => {
    // Show confirmation dialog
    const isConfirmed = window.confirm(t("profile.confirmDeletePlayerProfile"));

    if (!isConfirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        toast.error(t("profile.mustLoginFirst"));
        setIsDeleting(false);
        return;
      }

      // Show notification that deletion is in progress
      toast.info(t("profile.deletingPlayerProfile"));

      const response = await axios.delete(
        `${API_URL}/players/delete-player-profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success(t("profile.playerProfileDeletedSuccessfully"));

        // Remove player data from local storage if stored there
        localStorage.removeItem("playerProfile");

        // Redirect to homepage after successful deletion
        setTimeout(() => {
          window.location.href = "/profile";
        }, 1500);
      }
    } catch (error) {
      console.error("Error deleting profile:", error);

      if (error.response?.status === 404) {
        toast.error(t("profile.playerProfileNotFound"));
      } else if (error.response?.status === 403) {
        toast.error(t("profile.noPermissionToDelete"));
      } else {
        toast.error(
          error.response?.data?.message || t("profile.errorDeletingProfile")
        );
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-[#00183D] p-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <i className="fas fa-user"></i>
          {t("profile.playerProfile")}
        </h1>
      </div>

      <div className="p-6 lg:p-8">
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Player Information Section */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-user text-[#00183D]"></i>
              {t("profile.playerInformation")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label={t("profile.name")}
                value={formData.name}
                onChange={handleChange}
                isDisabled={!isEditing}
                name="name"
              />
              <FormField
                label={t("player.age")}
                value={formData.age}
                onChange={handleChange}
                isDisabled={!isEditing}
                name="age"
              />
              <FormField
                label={t("profile.gender")}
                value={formData.gender}
                onChange={handleChange}
                isDisabled={!isEditing}
                name="gender"
              />
              <FormField
                label={t("playerDetail.nationality")}
                value={formData.nationality}
                onChange={handleChange}
                isDisabled={!isEditing}
                name="nationality"
              />
              <FormField
                label={t("profile.job")}
                value={formData.jop}
                onChange={handleChange}
                isDisabled={!isEditing}
                name="jop"
              />
              <FormField
                label={t("player.position")}
                value={formData.position}
                onChange={handleChange}
                isDisabled={!isEditing}
                name="position"
              />
              <FormField
                label={t("profile.playerStatus")}
                value={formData.status}
                onChange={handleChange}
                isDisabled={!isEditing}
                name="status"
              />
              <FormField
                label={t("profile.experience")}
                value={formData.expreiance}
                onChange={handleChange}
                isDisabled={!isEditing}
                name="expreiance"
              />
              <FormField
                label={t("player.monthlySalary")}
                value={`${formData.monthlySalary} $`}
                isDisabled={true} // لا يمكن تعديل الراتب
              />
              <FormField
                label={t("player.annualContract")}
                value={`${formData.yearSalary} $`}
                isDisabled={true} // لا يمكن تعديل الراتب
              />
            </div>
          </div>

          {/* Security Section
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-lock text-purple-600"></i>
              الأمان
            </h3>
            <FormField
              label="كلمة المرور"
              value={formData.password}
              isPassword={true}
              isDisabled={!isEditing}
              onChange={handleChange}
              name="password"
            />
          </div> */}

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

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="px-6 py-3 bg-[#00183D] text-white rounded-xl hover:bg-[#001a3d] transition-colors"
              onClick={() => router.push(`/register-profile?id=${player._id}`)}
            >
              {t("common.edit")}
            </button>
            <button
              type="button"
              className="px-6 py-3 bg-red-950 text-white rounded-xl hover:bg-red-900 transition-colors flex items-center gap-2"
              onClick={handleDeletePlayerProfile}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  {t("profile.deleting")}
                </>
              ) : (
                <>
                  <i className="fas fa-trash-alt"></i>
                  {t("profile.deletePlayerProfile")}
                </>
              )}
            </button>
            {/* {isEditing && (
              <button
                type="submit"
                className="px-6 py-3 bg-[#00183D] text-white rounded-xl hover:bg-[#001a3d] transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
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
            )} */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlayerProfile;
