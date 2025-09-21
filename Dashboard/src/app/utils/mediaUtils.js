
/**
 * @param {Object} values 
 * @param {Object} existingMedia
 * @param {Object} formData
 */
export const prepareMediaFormData = (values, existingMedia, formData) => {
  if (values.profilePictureFile) {
    if (existingMedia?.profileImage?.url) {
      console.info("Replacing existing profile image");
    }
    formData.append("profileImage", values.profilePictureFile);
  }

  const documentFile =
    values.media?.document?.file || values.documentFile || null;
  if (documentFile) {
    formData.append("document", documentFile);
  }

  const videoFile = values.media?.video?.file || null;
  if (videoFile) {
    formData.append("playerVideo", videoFile);
  }

  return formData;
};

/**
 * @param {Object} mediaData 
 * @returns {Object} 
 */
export const processMediaResponse = (mediaData) => {
  if (!mediaData)
    return {
      profileImage: { url: null, publicId: null },
      video: {
        url: null,
        publicId: null,
        title: null,
        duration: 0,
        uploadedAt: null,
      },
      document: {
        url: null,
        publicId: null,
        title: null,
        type: null,
        size: 0,
        uploadedAt: null,
      },
    };

  return {
    profileImage: mediaData.profileImage || { url: null, publicId: null },
    video: mediaData.video
      ? {
          ...mediaData.video,
          isLoading: false,
          error: null,
        }
      : {
          url: null,
          publicId: null,
          title: null,
          duration: 0,
          uploadedAt: null,
        },
    document: mediaData.document
      ? {
          ...mediaData.document,
          isLoading: false,
          error: null,
          extension:
            mediaData.document.type?.split("/")[1] ||
            mediaData.document.title?.split(".").pop() ||
            mediaData.document.url?.split(".").pop() ||
            "unknown",
        }
      : {
          url: null,
          publicId: null,
          title: null,
          type: null,
          size: 0,
          uploadedAt: null,
        },
  };
};

/**
 * @param {File} file 
 * @returns {string} w
 */
export const createFilePreview = (file) => {
  if (!file) return null;
  return URL.createObjectURL(file);
};

/**
 * @param {Object} media 
 */
export const cleanupMediaPreviews = (media) => {
  if (!media) return;

  if (media.video && media.video.file && media.video.url?.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(media.video.url);
    } catch {}
  }

  if (
    media.document &&
    media.document.file &&
    media.document.url?.startsWith("blob:")
  ) {
    try {
      URL.revokeObjectURL(media.document.url);
    } catch {}
  }
};
