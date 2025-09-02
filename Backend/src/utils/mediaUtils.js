import { cloudinary } from "../config/cloudinary.js";
import ApiError from "./ApiError.js";

/**
 * @param {Object} file
 * @param {String} resourceType
 * @returns {Object}
 */
export const handleMediaUpload = async (file, resourceType = null) => {
  if (!file) return { url: null, publicId: null };

  if (!resourceType) {
    if (file.mimetype.startsWith("image/")) resourceType = "image";
    else if (file.mimetype.startsWith("video/")) resourceType = "video";
    else resourceType = "raw";
  }

  const MAX_SIZE = {
    image: 10 * 1024 * 1024,
    video: 100 * 1024 * 1024,
    raw: 10 * 1024 * 1024,
  };

  if (file.size && file.size > MAX_SIZE[resourceType]) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const maxSizeInMB = (MAX_SIZE[resourceType] / (1024 * 1024)).toFixed(2);
    throw new Error(
      `File size exceeds limit: ${sizeInMB}MB. Maximum allowed is ${maxSizeInMB}MB for ${resourceType} files.`
    );
  }

  try {
    let finalUrl = file.secure_url || file.path;

    if (resourceType === "raw" || resourceType === "auto") {
      const extension = file.originalname
        ? file.originalname.split(".").pop()
        : null;
      if (extension && !finalUrl.endsWith(`.${extension}`)) {
        finalUrl = `${finalUrl}.${extension}`;
      }
    }

    return {
      url: finalUrl,
      publicId: file.public_id || file.filename,
      type: file.mimetype,
      extension: file.originalname ? file.originalname.split(".").pop() : null,
      uploadedAt: new Date(),
    };
  } catch (error) {
    console.error(`Error in handleMediaUpload for ${resourceType}:`, error);
    throw new Error(`Failed to process uploaded file: ${error.message}`);
  }
};

/**
 * @param {String} publicId
 * @param {String} resourceType
 * @returns {Object}
 */
export const deleteMediaFromCloudinary = async (
  publicId,
  resourceType = "image"
) => {
  if (!publicId) return { result: "skipped", message: "No public ID provided" };

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return {
      result: result.result,
      message: `${resourceType} deleted successfully`,
    };
  } catch (error) {
    console.error(`Error deleting ${resourceType} from Cloudinary:`, error);
    throw new ApiError(500, `Failed to delete ${resourceType} from Cloudinary`);
  }
};

/**
 * @param {Object} media
 * @returns {Object}
 */
export const deleteAllPlayerMedia = async (media) => {
  const deletionResults = {
    successful: [],
    failed: [],
  };

  if (!media) return deletionResults;

  try {
    if (media.profileImage?.publicId) {
      try {
        await deleteMediaFromCloudinary(media.profileImage.publicId, "image");
        deletionResults.successful.push({
          type: "profile image",
          publicId: media.profileImage.publicId,
        });
      } catch (err) {
        console.warn("Failed to delete profile image:", err.message);
        deletionResults.failed.push({
          type: "profile image",
          publicId: media.profileImage.publicId,
          error: err.message,
        });
      }
    }

    if (media.video?.publicId) {
      try {
        await deleteMediaFromCloudinary(media.video.publicId, "video");
        deletionResults.successful.push({
          type: "video",
          publicId: media.video.publicId,
        });
      } catch (err) {
        console.warn("Failed to delete video:", err.message);
        deletionResults.failed.push({
          type: "video",
          publicId: media.video.publicId,
          error: err.message,
        });
      }
    }

    if (media.document?.publicId) {
      try {
        await deleteMediaFromCloudinary(media.document.publicId, "auto");
        deletionResults.successful.push({
          type: "document",
          publicId: media.document.publicId,
        });
      } catch (err) {
        console.warn("Failed to delete document:", err.message);
        deletionResults.failed.push({
          type: "document",
          publicId: media.document.publicId,
          error: err.message,
        });
      }
    }

    if (media.images && Array.isArray(media.images)) {
      for (let i = 0; i < media.images.length; i++) {
        const image = media.images[i];
        if (image?.publicId) {
          try {
            await deleteMediaFromCloudinary(image.publicId, "image");
            deletionResults.successful.push({
              type: `gallery image ${i + 1}`,
              publicId: image.publicId,
            });
          } catch (err) {
            console.warn(
              `Failed to delete gallery image ${i + 1}:`,
              err.message
            );
            deletionResults.failed.push({
              type: `gallery image ${i + 1}`,
              publicId: image.publicId,
              error: err.message,
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in media deletion process:", error);
  }

  return deletionResults;
};

/**
 * @param {Object} files
 * @param {Object} existingMedia
 * @returns {Object}
 */
export const processPlayerMedia = async (files, existingMedia = null) => {
  const defaultMedia = {
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
    images: [],
  };

  const validExistingMedia =
    existingMedia && typeof existingMedia === "object" ? existingMedia : {};

  const media = {
    profileImage: validExistingMedia.profileImage || defaultMedia.profileImage,
    video: validExistingMedia.video || defaultMedia.video,
    document: validExistingMedia.document || defaultMedia.document,
    images: Array.isArray(validExistingMedia.images)
      ? [...validExistingMedia.images]
      : [],
  };

  if (files?.profileImage?.[0]) {
    if (existingMedia?.profileImage?.publicId) {
      await deleteMediaFromCloudinary(
        existingMedia.profileImage.publicId,
        "image"
      );
    }
    media.profileImage = await handleMediaUpload(
      files.profileImage[0],
      "image"
    );
  }

  if (files?.playerVideo?.[0]) {
    if (existingMedia?.video?.publicId) {
      await deleteMediaFromCloudinary(
        existingMedia.video.publicId,
        "video"
      ).catch((err) =>
        console.warn("Failed to delete old video:", err.message)
      );
    }

    const videoData = await handleMediaUpload(files.playerVideo[0], "video");
    videoData.title = files.playerVideo[0].originalname || "video";
    videoData.duration = 0; // Can be updated later with actual duration if available
    videoData.uploadedAt = new Date();
    media.video = videoData;
  }

  if (files?.document?.[0]) {
    if (existingMedia?.document?.publicId) {
      await deleteMediaFromCloudinary(
        existingMedia.document.publicId,
        "auto"
      ).catch((err) =>
        console.warn("Failed to delete old document:", err.message)
      );
    }

    const documentData = await handleMediaUpload(files.document[0], "auto");
    documentData.title = files.document[0].originalname || "document";
    documentData.size = files.document[0].size || 0;
    documentData.type = files.document[0].mimetype || null;
    documentData.uploadedAt = new Date();
    media.document = documentData;
  }

  if (files?.images && files.images.length > 0) {
    const existingImages =
      existingMedia?.images && Array.isArray(existingMedia.images)
        ? [...existingMedia.images]
        : [];

    const newImages = [];
    for (const imageFile of files.images) {
      const imageData = await handleMediaUpload(imageFile, "image");
      imageData.title = imageFile.originalname || "image";
      imageData.size = imageFile.size || 0;
      imageData.type = imageFile.mimetype || null;
      imageData.uploadedAt = new Date();
      newImages.push(imageData);
    }

    media.images = [...existingImages, ...newImages].slice(0, 5);
  } else if (existingMedia?.images) {
    // If no new images but existingMedia provided, use existing images as is
    media.images = Array.isArray(existingMedia.images)
      ? [...existingMedia.images]
      : [];
  }

  return media;
};

/**
 * @param {Object} file
 * @param {Object} existingItem
 * @param {String} resourceType
 * @returns {Object}
 */
export const replaceMediaItem = async (
  file,
  existingItem,
  resourceType = "image"
) => {
  if (!file) return existingItem || null;

  if (existingItem?.publicId) {
    await deleteMediaFromCloudinary(existingItem.publicId, resourceType).catch(
      (err) =>
        console.warn(`Failed to delete old ${resourceType}:`, err.message)
    );
  }

  return await handleMediaUpload(file, resourceType);
};

/**
 * @param {Object} files
 * @param {Object} existingMedia
 * @returns {Object}
 */
export const processPlayerMediaWithTracking = async (
  files,
  existingMedia = null
) => {
  const results = {
    media: null,
    operations: {
      updated: [],
      deleted: [],
      errors: [],
    },
  };

  try {
    const oldMediaSnapshot = existingMedia
      ? JSON.parse(JSON.stringify(existingMedia))
      : null;

    results.media = await processPlayerMedia(files, existingMedia);

    if (files?.profileImage?.[0] && results.media.profileImage?.publicId) {
      if (oldMediaSnapshot?.profileImage?.publicId) {
        results.operations.deleted.push({
          type: "profile image",
          publicId: oldMediaSnapshot.profileImage.publicId,
        });
      }
      results.operations.updated.push({
        type: "profile image",
        publicId: results.media.profileImage.publicId,
      });
    }

    if (files?.playerVideo?.[0] && results.media.video?.publicId) {
      if (oldMediaSnapshot?.video?.publicId) {
        results.operations.deleted.push({
          type: "video",
          publicId: oldMediaSnapshot.video.publicId,
        });
      }
      results.operations.updated.push({
        type: "video",
        publicId: results.media.video.publicId,
      });
    }

    if (files?.document?.[0] && results.media.document?.publicId) {
      if (oldMediaSnapshot?.document?.publicId) {
        results.operations.deleted.push({
          type: "document",
          publicId: oldMediaSnapshot.document.publicId,
        });
      }
      results.operations.updated.push({
        type: "document",
        publicId: results.media.document.publicId,
      });
    }

    if (files?.images && results.media.images?.length > 0) {
      // Track deleted images
      if (oldMediaSnapshot?.images && Array.isArray(oldMediaSnapshot.images)) {
        oldMediaSnapshot.images.forEach((img, index) => {
          if (img?.publicId) {
            results.operations.deleted.push({
              type: `gallery image ${index + 1}`,
              publicId: img.publicId,
            });
          }
        });
      }

      // Track new images
      results.media.images.forEach((img, index) => {
        if (img?.publicId) {
          results.operations.updated.push({
            type: `gallery image ${index + 1}`,
            publicId: img.publicId,
          });
        }
      });
    }
  } catch (error) {
    console.error("Error in processPlayerMediaWithTracking:", error);
    results.operations.errors.push({
      type: "media processing",
      error: error.message,
    });
    throw error;
  }

  return results;
};
