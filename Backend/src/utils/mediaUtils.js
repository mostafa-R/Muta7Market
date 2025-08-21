/**
 * Media Utility Functions for Cloudinary Operations
 * This file centralizes all Cloudinary-related functionality for player profiles
 */
import { cloudinary } from "../config/cloudinary.js";
import ApiError from "./ApiError.js";

/**
 * Handle media file upload to Cloudinary
 * @param {Object} file - The file object from multer
 * @param {String} resourceType - The resource type (image, video, raw)
 * @returns {Object} - Object with URL and publicId
 */
export const handleMediaUpload = async (file, resourceType = null) => {
  if (!file) return { url: null, publicId: null };

  // Determine the resource type if not provided
  if (!resourceType) {
    if (file.mimetype.startsWith("image/")) resourceType = "image";
    else if (file.mimetype.startsWith("video/")) resourceType = "video";
    else resourceType = "raw"; // Default to raw for documents
  }

  // Check file size before proceeding
  const MAX_SIZE = {
    image: 10 * 1024 * 1024, // 10MB for images
    video: 100 * 1024 * 1024, // 100MB for videos
    raw: 10 * 1024 * 1024, // 10MB for documents
  };

  if (file.size && file.size > MAX_SIZE[resourceType]) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const maxSizeInMB = (MAX_SIZE[resourceType] / (1024 * 1024)).toFixed(2);
    throw new Error(
      `File size exceeds limit: ${sizeInMB}MB. Maximum allowed is ${maxSizeInMB}MB for ${resourceType} files.`
    );
  }

  // Make sure we're using the Cloudinary URL, not local path
  // Add timeout handling if needed in the future
  try {
    return {
      url: file.secure_url || file.path,
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
 * Delete media from Cloudinary
 * @param {String} publicId - The public ID of the media to delete
 * @param {String} resourceType - The resource type (image, video, raw)
 * @returns {Object} - Result of deletion
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
 * Delete all media files for a player profile from Cloudinary
 * @param {Object} media - The media object from player profile
 * @returns {Object} - Deletion results with successful and failed arrays
 */
export const deleteAllPlayerMedia = async (media) => {
  const deletionResults = {
    successful: [],
    failed: [],
  };

  if (!media) return deletionResults;

  try {
    // Delete profile image
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

    // Delete video
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

    // Delete document
    if (media.document?.publicId) {
      try {
        await deleteMediaFromCloudinary(media.document.publicId, "raw");
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

    // Delete all images from the images array
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
 * Process media for player profiles (create or update)
 * @param {Object} files - The files object from multer
 * @param {Object} existingMedia - Existing media object (for updates)
 * @returns {Object} - Processed media object
 */
export const processPlayerMedia = async (files, existingMedia = null) => {
  // Initialize media object
  const media = existingMedia || {
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
    images: [], // Empty array when no images uploaded
  };

  // Handle profile image
  if (files?.profileImage?.[0]) {
    // Delete existing image if updating
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

  // Handle video - replace with new one
  if (files?.playerVideo?.[0]) {
    // Delete existing video if updating
    if (existingMedia?.video?.publicId) {
      await deleteMediaFromCloudinary(
        existingMedia.video.publicId,
        "video"
      ).catch((err) =>
        console.warn("Failed to delete old video:", err.message)
      );
    }

    // Set new video
    const videoData = await handleMediaUpload(files.playerVideo[0], "video");
    videoData.title = files.playerVideo[0].originalname || "video";
    videoData.duration = 0; // Can be updated later with actual duration if available
    videoData.uploadedAt = new Date();
    media.video = videoData;
  }

  // Handle document - replace with new one
  if (files?.document?.[0]) {
    // Delete existing document if updating
    if (existingMedia?.document?.publicId) {
      await deleteMediaFromCloudinary(
        existingMedia.document.publicId,
        "raw"
      ).catch((err) =>
        console.warn("Failed to delete old document:", err.message)
      );
    }

    // Set new document
    const documentData = await handleMediaUpload(files.document[0], "raw");
    documentData.title = files.document[0].originalname || "document";
    documentData.size = files.document[0].size || 0;
    documentData.type = files.document[0].mimetype || null;
    documentData.uploadedAt = new Date();
    media.document = documentData;
  }

  // Handle multiple images - ADD to existing instead of replacing all
  if (files?.images && files.images.length > 0) {
    console.log("📸 Processing new images - ADDITIVE approach");
    console.log(
      `📸 Existing images count: ${existingMedia?.images?.length || 0}`
    );
    console.log(`📸 New images to add: ${files.images.length}`);

    // Keep existing images and add new ones
    const existingImages =
      existingMedia?.images && Array.isArray(existingMedia.images)
        ? [...existingMedia.images]
        : [];

    // Process new images and add to existing
    const newImages = [];
    for (const imageFile of files.images) {
      const imageData = await handleMediaUpload(imageFile, "image");
      imageData.title = imageFile.originalname || "image";
      imageData.size = imageFile.size || 0;
      imageData.type = imageFile.mimetype || null;
      imageData.uploadedAt = new Date();
      newImages.push(imageData);
    }

    // Combine existing + new images (limit to 5 total)
    media.images = [...existingImages, ...newImages].slice(0, 5);

    console.log(`📸 Final images count: ${media.images.length}`);
    console.log("📸 Image update completed successfully");
  }

  return media;
};

/**
 * Process single media item replacement
 * @param {Object} file - The file object from multer
 * @param {Object} existingItem - Existing media item (for updates)
 * @param {String} resourceType - The resource type (image, video, raw)
 * @returns {Object} - Processed media item
 */
export const replaceMediaItem = async (
  file,
  existingItem,
  resourceType = "image"
) => {
  if (!file) return existingItem || null;

  // Delete existing item if updating
  if (existingItem?.publicId) {
    await deleteMediaFromCloudinary(existingItem.publicId, resourceType).catch(
      (err) =>
        console.warn(`Failed to delete old ${resourceType}:`, err.message)
    );
  }

  // Process new file
  return await handleMediaUpload(file, resourceType);
};

/**
 * Process player media with detailed tracking (for updates)
 * @param {Object} files - The files object from multer
 * @param {Object} existingMedia - Existing media object (for updates)
 * @returns {Object} - Object with updated media and operation results
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
    // Track old media before processing
    const oldMediaSnapshot = existingMedia
      ? JSON.parse(JSON.stringify(existingMedia))
      : null;

    // Process media using existing function
    results.media = await processPlayerMedia(files, existingMedia);

    // Track what was updated and deleted
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
