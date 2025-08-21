/**
 * Helper functions for handling media in forms
 */

// Maximum file sizes in bytes
export const MAX_FILE_SIZES = {
  profileImage: 10 * 1024 * 1024, // 10MB
  document: 10 * 1024 * 1024, // 10MB
  playerVideo: 100 * 1024 * 1024, // 100MB
  images: 10 * 1024 * 1024, // 10MB per image
};

/**
 * Validate file size
 * @param {File} file - The file to validate
 * @param {String} type - Type of file (profileImage, document, playerVideo, images)
 * @returns {Object} - {valid: boolean, message: string}
 */
export const validateFileSize = (file, type) => {
  if (!file) return { valid: true };

  const maxSize = MAX_FILE_SIZES[type] || 10 * 1024 * 1024; // Default to 10MB

  if (file.size > maxSize) {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      message: `File too large: ${file.name} (${fileSizeMB}MB). Maximum size is ${maxSizeMB}MB.`,
    };
  }

  return { valid: true };
};

/**
 * Process form media files and prepare them for submission
 * @param {Object} values - Form values
 * @param {Object} existingMedia - Existing media data (from profile)
 * @param {Object} formData - FormData instance to append files to
 */
export const prepareMediaFormData = (values, existingMedia, formData) => {
  console.log("🎬 prepareMediaFormData called with:", {
    hasProfilePictureFile: !!values.profilePictureFile,
    hasDocumentFile: !!(values.media?.document?.file || values.documentFile),
    hasVideoFile: !!values.media?.video?.file,
    imagesCount: values.media?.images ? values.media.images.length : 0,
    imagesWithFiles: values.media?.images
      ? values.media.images.filter((img) => img.file).length
      : 0,
  });

  // Validate all files before proceeding
  const invalidFiles = [];

  // Handle profile image
  if (values.profilePictureFile) {
    const validation = validateFileSize(
      values.profilePictureFile,
      "profileImage"
    );
    if (!validation.valid) {
      invalidFiles.push(validation.message);
    } else {
      if (existingMedia?.profileImage?.url) {
        console.info("🖼️ Replacing existing profile image");
      } else {
        console.info("🖼️ Adding new profile image");
      }
      formData.append("profileImage", values.profilePictureFile);
      console.log("✅ Added profileImage to FormData");
    }
  }

  // Handle document file - only send if there's a new file
  const documentFile =
    values.media?.document?.file || values.documentFile || null;
  if (documentFile) {
    const validation = validateFileSize(documentFile, "document");
    if (!validation.valid) {
      invalidFiles.push(validation.message);
    } else {
      if (existingMedia?.document?.url) {
        console.info("📄 Replacing existing document");
      } else {
        console.info("📄 Adding new document");
      }
      formData.append("document", documentFile);
      console.log("✅ Added document to FormData");
    }
  }

  // Handle video file - only send if there's a new file
  const videoFile = values.media?.video?.file || null;
  if (videoFile) {
    const validation = validateFileSize(videoFile, "playerVideo");
    if (!validation.valid) {
      invalidFiles.push(validation.message);
    } else {
      if (existingMedia?.video?.url) {
        console.info("🎥 Replacing existing video");
      } else {
        console.info("🎥 Adding new video");
      }
      formData.append("playerVideo", videoFile);
      console.log("✅ Added playerVideo to FormData");
    }
  }

  // Handle images array - append each image file
  if (values.media?.images && Array.isArray(values.media.images)) {
    const imagesWithFiles = values.media.images.filter((img) => img.file);
    if (imagesWithFiles.length > 0) {
      if (existingMedia?.images && existingMedia.images.length > 0) {
        console.info(
          `🖼️ Replacing ${existingMedia.images.length} existing images with ${imagesWithFiles.length} new images`
        );
      } else {
        console.info(`🖼️ Adding ${imagesWithFiles.length} new images`);
      }

      imagesWithFiles.forEach((image, index) => {
        const validation = validateFileSize(image.file, "images");
        if (!validation.valid) {
          invalidFiles.push(validation.message);
        } else {
          formData.append("images", image.file);
          console.log(
            `✅ Added image ${index + 1} to FormData: ${image.file.name}`
          );
        }
      });
    }
  }

  // If any file validation failed, throw an error
  if (invalidFiles.length > 0) {
    const errorMessage =
      "File size validation failed:\n" + invalidFiles.join("\n");
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  console.log("🎬 prepareMediaFormData completed");
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

  // Cleanup images previews
  if (media.images && Array.isArray(media.images)) {
    media.images.forEach((image) => {
      if (image.file && image.url?.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(image.url);
        } catch {}
      }
    });
  }
};
