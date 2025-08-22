"use client";
import axios from "axios";
import { Eye, EyeOff, FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import PromoteNowButton from "./PromoteNowButton";

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

  // Image modal state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);

  const handleImageClick = (imageUrl) => {
    setCurrentImageUrl(imageUrl);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setCurrentImageUrl(null);
  };

  // Helper function to get translated value with fallback
  const getTranslatedValue = (key, value, translationNamespace = null) => {
    if (!value) return "";

    // Try to get translation from the specified namespace
    let translatedValue = null;

    if (translationNamespace) {
      // Try with the namespace
      translatedValue = t(`${translationNamespace}.${value.toLowerCase()}`, {
        defaultValue: null,
      });

      // If not found and it's a sport, try sport-specific positions
      if (
        !translatedValue &&
        translationNamespace === "positions" &&
        formData.game
      ) {
        const sportKey = formData.game.toLowerCase();
        translatedValue = t(`positions.${sportKey}.${value.toLowerCase()}`, {
          defaultValue: null,
        });
      }
    }

    // If still not found, try without namespace
    if (!translatedValue) {
      translatedValue = t(value.toLowerCase(), { defaultValue: null });
    }

    // If translation found, return it, otherwise return original value
    return translatedValue || value;
  };

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
              {t("notRegisteredYet")}
            </h3>
            <Link href="/register-profile">
              <button
                type="button"
                className="inline-flex items-center justify-center bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg text-lg px-8 py-4 hover:bg-[hsl(var(--primary)/0.9)] transition"
              >
                <FileText className="w-5 h-5 ml-2" />
                {t("registerNow")}
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
        experience: player.experience || 0,
        game: player.game || "",
        monthlySalary: player.monthlySalary?.amount || "",
        monthlySalaryCurrency: player.monthlySalary?.currency || "SAR",
        yearSalary: player.yearSalary?.amount || "",
        yearSalaryCurrency: player.yearSalary?.currency || "SAR",
        contractEndDate: player.contractEndDate || "",
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
    const isConfirmed = window.confirm(t("confirmDeletePlayerProfile"));

    if (!isConfirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        toast.error(t("mustLoginFirst"));
        setIsDeleting(false);
        return;
      }

      // Show notification that deletion is in progress
      toast.info(t("deletingPlayerProfile"));

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
        toast.success(t("playerProfileDeletedSuccessfully"));

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
        toast.error(t("playerProfileNotFound"));
      } else if (error.response?.status === 403) {
        toast.error(t("noPermissionToDelete"));
      } else {
        toast.error(error.response?.data?.message || t("errorDeletingProfile"));
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-[#00183D] p-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <i className="fas fa-user"></i>
            {t("profile.playerProfile")}
          </h1>
        </div>

        <div className="p-6 lg:p-8">
          {player?.isActive && !player?.isPromoted?.status && (
            <div className="mb-6">
              <PromoteNowButton profileId={player?._id} />
            </div>
          )}
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
                  value={
                    formData.gender === "male"
                      ? t("common.male")
                      : formData.gender === "female"
                      ? t("common.female")
                      : formData.gender
                  }
                  onChange={handleChange}
                  isDisabled={!isEditing}
                  name="gender"
                />
                <FormField
                  label={t("nationality")}
                  value={getTranslatedValue(
                    "nationality",
                    formData.nationality,
                    "nationalities"
                  )}
                  onChange={handleChange}
                  isDisabled={!isEditing}
                  name="nationality"
                />
                <FormField
                  label={t("profile.job")}
                  value={
                    formData.jop === "player"
                      ? t("common.player")
                      : formData.jop === "coach"
                      ? t("common.coach")
                      : formData.jop
                  }
                  onChange={handleChange}
                  isDisabled={!isEditing}
                  name="jop"
                />
                <FormField
                  label={t("player.position")}
                  value={getTranslatedValue(
                    "position",
                    formData.position,
                    "positions"
                  )}
                  onChange={handleChange}
                  isDisabled={!isEditing}
                  name="position"
                />
                <FormField
                  label={t("profile.playerStatus")}
                  value={getTranslatedValue(
                    "status",
                    formData.status,
                    "player.status"
                  )}
                  onChange={handleChange}
                  isDisabled={!isEditing}
                  name="status"
                />
                <FormField
                  label={t("sport")}
                  value={getTranslatedValue("sport", formData.game, "sports")}
                  isDisabled={true}
                />
                {player?.roleType && (
                  <FormField
                    label={t("playerDetail.roleType")}
                    value={getTranslatedValue(
                      "roleType",
                      player.roleType,
                      player.jop === "player" ? "playerRoles" : "coachRoles"
                    )}
                    isDisabled={true}
                  />
                )}
                <FormField
                  label={t("yearsOfExperience")}
                  value={`${formData.experience} ${t("years")}`}
                  isDisabled={true}
                />
                <FormField
                  label={t("views")}
                  value={player?.views?.toLocaleString() || "0"}
                  isDisabled={true}
                />
                <FormField
                  label={t("monthlySalary")}
                  value={`${formData.monthlySalary?.toLocaleString()} ${
                    formData.monthlySalaryCurrency
                  }`}
                  isDisabled={true}
                />
                <FormField
                  label={t("annualContract")}
                  value={`${formData.yearSalary?.toLocaleString()} ${
                    formData.yearSalaryCurrency
                  }`}
                  isDisabled={true}
                />
                <FormField
                  label={t("contractEndDate")}
                  value={
                    formData.contractEndDate
                      ? new Date(formData.contractEndDate).toLocaleDateString()
                      : t("notSpecified")
                  }
                  isDisabled={true}
                />
              </div>
            </div>

            {/* Status Indicators */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-info-circle text-blue-600"></i>
                {t("accountStatus")}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      player?.isActive ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-sm">
                    {player?.isActive ? t("active") : t("inactive")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      player?.isConfirmed ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  ></div>
                  <span className="text-sm">
                    {player?.isConfirmed ? t("confirmed") : t("pending")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      player?.isListed ? "bg-green-500" : "bg-gray-500"
                    }`}
                  ></div>
                  <span className="text-sm">
                    {player?.isListed ? t("listed") : t("notListed")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      player?.isPromoted?.status
                        ? "bg-purple-500"
                        : "bg-gray-500"
                    }`}
                  ></div>
                  <span className="text-sm">
                    {player?.isPromoted?.status
                      ? t("promoted")
                      : t("notPromoted")}
                  </span>
                </div>
              </div>
            </div>

            {/* Transfer Information */}
            {player?.transferredTo && (
              <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fas fa-exchange-alt text-orange-600"></i>
                  {t("transferDetails")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label={t("transferredToClub")}
                    value={player.transferredTo.club}
                    isDisabled={true}
                  />
                  <FormField
                    label={t("transferAmount")}
                    value={`${player.transferredTo.amount?.toLocaleString()} SAR`}
                    isDisabled={true}
                  />
                  <FormField
                    label={t("transferStartDate")}
                    value={
                      player.transferredTo.startDate
                        ? new Date(
                            player.transferredTo.startDate
                          ).toLocaleDateString()
                        : t("notSpecified")
                    }
                    isDisabled={true}
                  />
                  <FormField
                    label={t("transferEndDate")}
                    value={
                      player.transferredTo.endDate
                        ? new Date(
                            player.transferredTo.endDate
                          ).toLocaleDateString()
                        : t("notSpecified")
                    }
                    isDisabled={true}
                  />
                </div>
              </div>
            )}

            {/* Social Links */}
            {player?.socialLinks &&
              Object.values(player.socialLinks).some((link) => link) && (
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-share-alt text-green-600"></i>
                    {t("socialLinks")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {player.socialLinks.instagram && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <i className="fab fa-instagram text-pink-500 text-xl"></i>
                        <div className="flex-1">
                          <span className="text-sm text-gray-600">
                            Instagram:
                          </span>
                          <a
                            href={player.socialLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-blue-600 hover:underline break-all"
                          >
                            {player.socialLinks.instagram}
                          </a>
                        </div>
                      </div>
                    )}
                    {player.socialLinks.twitter && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <i className="fab fa-twitter text-blue-400 text-xl"></i>
                        <div className="flex-1">
                          <span className="text-sm text-gray-600">
                            Twitter:
                          </span>
                          <a
                            href={player.socialLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-blue-600 hover:underline break-all"
                          >
                            {player.socialLinks.twitter}
                          </a>
                        </div>
                      </div>
                    )}
                    {player.socialLinks.youtube && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <i className="fab fa-youtube text-red-500 text-xl"></i>
                        <div className="flex-1">
                          <span className="text-sm text-gray-600">
                            YouTube:
                          </span>
                          <a
                            href={player.socialLinks.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-blue-600 hover:underline break-all"
                          >
                            {player.socialLinks.youtube}
                          </a>
                        </div>
                      </div>
                    )}
                    {player.socialLinks.whatsapp && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <i className="fab fa-whatsapp text-green-500 text-xl"></i>
                        <div className="flex-1">
                          <span className="text-sm text-gray-600">
                            WhatsApp:
                          </span>
                          <span className="block text-gray-800">
                            {player.socialLinks.whatsapp}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Media Section */}
            {player?.media && (
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fas fa-photo-video text-purple-600"></i>
                  {t("mediaFiles")}
                </h3>

                {/* Profile Image */}
                {player.media.profileImage && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-700 mb-3">
                      {t("profileImage")}
                    </h4>
                    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
                      <img
                        src={player.media.profileImage.url}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover cursor-pointer"
                        onClick={() =>
                          handleImageClick(player.media.profileImage.url)
                        }
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {t("profilePhoto")}
                        </p>
                        <a
                          href={player.media.profileImage.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {t("viewImage")}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Video */}
                {player.media.video && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-700 mb-3">
                      {t("playerVideo")}
                    </h4>
                    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
                      <i className="fas fa-play-circle text-red-500 text-2xl"></i>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {player.media.video.title || "Player Video"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t("uploadedAt")}:{" "}
                          {new Date(
                            player.media.video.uploadedAt
                          ).toLocaleDateString()}
                        </p>
                        <a
                          href={player.media.video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {t("watchVideo")}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Document */}
                {player.media.document && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-700 mb-3">
                      {t("document")}
                    </h4>
                    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
                      <i className="fas fa-file-pdf text-red-600 text-2xl"></i>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {player.media.document.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {player.media.document.type} •{" "}
                          {(player.media.document.size / 1024).toFixed(1)} KB
                        </p>
                        <a
                          href={player.media.document.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {t("downloadFile")}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Images Gallery */}
                {player.media.images && player.media.images.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-3">
                      {t("playerImages")} ({player.media.images.length})
                    </h4>
                    <div className="space-y-3">
                      {player.media.images.map((image, index) => (
                        <div
                          key={index}
                          className="p-3 bg-white rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-20 bg-gray-100 rounded border overflow-hidden flex-shrink-0">
                              <img
                                src={image.url}
                                alt={`صورة ${index + 1}`}
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() => handleImageClick(image.url)}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.parentElement.style.backgroundColor =
                                    "#fee2e2";
                                  e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-red-500 text-xs">صورة<br/>مكسورة</div>`;
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">
                                {image.title || `صورة رقم ${index + 1}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      {t("clickToViewFullSize")}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Contact Information */}
            {player?.contactInfo && (
              <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fas fa-address-book text-yellow-600"></i>
                  {t("contactInformation")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {player.contactInfo.email && (
                    <FormField
                      label={t("email")}
                      value={player.contactInfo.email}
                      isDisabled={true}
                    />
                  )}
                  {player.contactInfo.phone && (
                    <FormField
                      label={t("phone")}
                      value={player.contactInfo.phone}
                      isDisabled={true}
                    />
                  )}
                </div>

                {/* Agent Information */}
                {player.contactInfo.agent && (
                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <i className="fas fa-user-tie text-gray-600"></i>
                      {t("agentInformation")}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        label={t("agentName")}
                        value={player.contactInfo.agent.name}
                        isDisabled={true}
                      />
                      <FormField
                        label={t("agentPhone")}
                        value={player.contactInfo.agent.phone}
                        isDisabled={true}
                      />
                      <FormField
                        label={t("agentEmail")}
                        value={player.contactInfo.agent.email}
                        isDisabled={true}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

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
                onClick={() =>
                  router.push(`/register-profile?id=${player._id}`)
                }
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
                    {t("deleting")}
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash-alt"></i>
                    {t("deletePlayerProfile")}
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

      {/* Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
          <div className="bg-white rounded-xl max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white flex justify-between items-center">
              <h3 className="font-medium">{t("playerImages")}</h3>
              <button
                onClick={closeImageModal}
                className="p-1 hover:bg-white/20 rounded-full"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="relative aspect-auto max-h-[70vh] flex items-center justify-center bg-gray-100 p-2">
              <img
                src={currentImageUrl}
                alt="Full size image"
                className="max-w-full max-h-[65vh] object-contain"
              />
            </div>

            <div className="p-4 bg-gray-100 border-t">
              <button
                onClick={closeImageModal}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium float-right"
              >
                {t("common.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlayerProfile;
