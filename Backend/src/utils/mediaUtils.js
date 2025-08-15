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

  // Make sure we're using the Cloudinary URL, not local path
  return {
    url: file.secure_url || file.path,
    publicId: file.public_id || file.filename,
    type: file.mimetype,
    extension: file.originalname ? file.originalname.split(".").pop() : null,
    uploadedAt: new Date(),
  };
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
