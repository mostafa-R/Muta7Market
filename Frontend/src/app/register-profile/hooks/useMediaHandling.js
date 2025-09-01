import { cleanupMediaPreviews } from "@/app/utils/mediaUtils";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export const useMediaHandling = (formik) => {
  const { t } = useTranslation();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);

  const cleanupRef = useRef();
  cleanupRef.current = {
    profilePicturePreview: formik.values.profilePicturePreview,
    media: formik.values.media,
  };

  useEffect(() => {
    return () => {
      if (cleanupRef.current.profilePicturePreview?.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(cleanupRef.current.profilePicturePreview);
        } catch {}
      }

      cleanupMediaPreviews(cleanupRef.current.media);
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
