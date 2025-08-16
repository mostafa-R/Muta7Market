/**
 * Helper functions for handling media in forms
 */

/**
 * Process form media files and prepare them for submission
 * @param {Object} values - Form values
 * @param {Object} existingMedia - Existing media data (from profile)
 * @param {Object} formData - FormData instance to append files to
 */
export const prepareMediaFormData = (values, existingMedia, formData) => {
  // Handle profile image
  if (values.profilePictureFile) {
    if (existingMedia?.profileImage?.url) {
      console.info("Replacing existing profile image");
    }
    formData.append("profileImage", values.profilePictureFile);
  }

  // Handle document file - only send if there's a new file
  const documentFile =
    values.media?.document?.file || values.documentFile || null;
  if (documentFile) {
    formData.append("document", documentFile);
  }

  // Handle video file - only send if there's a new file
  const videoFile = values.media?.video?.file || null;
  if (videoFile) {
    formData.append("playerVideo", videoFile);
  }

  return formData;
};

/**
 * Process media response data from API
 * @param {Object} mediaData - Media data from API response
 * @returns {Object} - Formatted media object for frontend state
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
          // Add any frontend-specific properties
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
          // Add any frontend-specific properties
          isLoading: false,
          error: null,
          // Extract file extension from document title or URL
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
 * Create preview URL for a file
 * @param {File} file - File object
 * @returns {string} - Object URL for preview
 */
export const createFilePreview = (file) => {
  if (!file) return null;
  return URL.createObjectURL(file);
};

/**
 * Clean up media previews
 * @param {Object} media - Media object with previews
 */
export const cleanupMediaPreviews = (media) => {
  if (!media) return;

  // Cleanup video preview
  if (media.video && media.video.file && media.video.url?.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(media.video.url);
    } catch {}
  }

  // Cleanup document preview
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
