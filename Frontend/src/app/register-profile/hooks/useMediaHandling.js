import { cleanupMediaPreviews } from "@/app/utils/mediaUtils";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export const useMediaHandling = (formik) => {
  const { t } = useTranslation();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);

  // Cleanup function for media previews when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup any object URLs when component unmounts
      if (formik.values.profilePicturePreview?.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(formik.values.profilePicturePreview);
        } catch {}
      }

      // Use our utility to clean up all media previews
      cleanupMediaPreviews(formik.values.media);
    };
  }, []);

  const handleUploadProgress = (progressEvent) => {
    const percentCompleted = Math.round(
      (progressEvent.loaded * 100) / (progressEvent.total || 100)
    );
    setUploadProgress(percentCompleted);
  };

  const startUpload = () => {
    setUploadProgress(10);
    setUploadStatus(null);

    // Simulate progress for better UX since the API might not report progress correctly
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.floor(Math.random() * 8) + 2;
      });
    }, 800);

    return progressInterval;
  };

  const completeUpload = (progressInterval) => {
    clearInterval(progressInterval);
    setUploadProgress(100);
    setUploadStatus("success");
  };

  const handleUploadError = (progressInterval) => {
    clearInterval(progressInterval);
    setUploadProgress(0);
    setUploadStatus("error");
  };

  const showMediaUpdateNotifications = (values, player) => {
    if (values.profilePictureFile && player?.media?.profileImage?.url) {
      toast.info(t("mediaNotifications.profileImageReplaced"));
    }

    const hasNewDocument = values.media?.document?.file || values.documentFile;
    if (hasNewDocument && player?.media?.document?.url) {
      toast.info(t("mediaNotifications.documentReplaced"));
    }

    const hasNewVideo = values.media?.video?.file;
    if (hasNewVideo && player?.media?.video?.url) {
      toast.info(t("mediaNotifications.videoReplaced"));
    }
  };

  return {
    uploadProgress,
    uploadStatus,
    handleUploadProgress,
    startUpload,
    completeUpload,
    handleUploadError,
    showMediaUpdateNotifications,
  };
};
