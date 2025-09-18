import fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { generatePublicUrl } from "../config/localStorage.js";
import ApiError from "./ApiError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @param {Object} file
 * @param {Object} req
 * @param {String} resourceType
 * @returns {Object}
 */
export const handleMediaUpload = async (file, req, resourceType = null) => {
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
    const publicUrl = generatePublicUrl(req, file.path);

    return {
      url: publicUrl,
      publicId: file.filename,
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
export const deleteMediaFromLocal = async (
  publicId,
  resourceType = "image"
) => {
  if (!publicId) return { result: "skipped", message: "No public ID provided" };

  try {
    let folder = "others";
    if (resourceType === "image") folder = "images";
    else if (resourceType === "video") folder = "videos";
    else if (resourceType === "raw" || resourceType === "auto")
      folder = "documents";

    const uploadDir = join(__dirname, "../../uploads");
    const filePath = join(uploadDir, folder, publicId);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return {
        result: "ok",
        message: `${resourceType} deleted successfully`,
      };
    } else {
      return {
        result: "not found",
        message: `${resourceType} file not found`,
      };
    }
  } catch (error) {
    console.error(`Error deleting ${resourceType} from local storage:`, error);
    throw new ApiError(
      500,
      `Failed to delete ${resourceType} from local storage`
    );
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
        await deleteMediaFromLocal(media.profileImage.publicId, "image");
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
        await deleteMediaFromLocal(media.video.publicId, "video");
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
        await deleteMediaFromLocal(media.document.publicId, "auto");
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
            await deleteMediaFromLocal(image.publicId, "image");
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
 * @param {Object} req
 * @param {Object} existingMedia
 * @returns {Object}
 */
export const processPlayerMedia = async (files, req, existingMedia = null) => {
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
    images: [],
  };

  if (files?.profileImage?.[0]) {
    if (existingMedia?.profileImage?.publicId) {
      await deleteMediaFromLocal(existingMedia.profileImage.publicId, "image");
    }
    media.profileImage = await handleMediaUpload(
      files.profileImage[0],
      req,
      "image"
    );
  }

  if (files?.playerVideo?.[0]) {
    if (existingMedia?.video?.publicId) {
      await deleteMediaFromLocal(existingMedia.video.publicId, "video").catch(
        (err) => console.warn("Failed to delete old video:", err.message)
      );
    }

    const videoData = await handleMediaUpload(
      files.playerVideo[0],
      req,
      "video"
    );
    videoData.title = files.playerVideo[0].originalname || "video";
    videoData.duration = 0;
    videoData.uploadedAt = new Date();
    media.video = videoData;
  }

  if (files?.document?.[0]) {
    if (existingMedia?.document?.publicId) {
      await deleteMediaFromLocal(existingMedia.document.publicId, "auto").catch(
        (err) => console.warn("Failed to delete old document:", err.message)
      );
    }

    const documentData = await handleMediaUpload(
      files.document[0],
      req,
      "auto"
    );
    documentData.title = files.document[0].originalname || "document";
    documentData.size = files.document[0].size || 0;
    documentData.type = files.document[0].mimetype || null;
    documentData.uploadedAt = new Date();
    media.document = documentData;
  }

  if (files?.images && files.images.length > 0) {
    console.log("📸 Processing new images - Using existingMedia as base");
    console.log(
      `📸 Existing images count: ${existingMedia?.images?.length || 0}`
    );
    console.log(`📸 New images to add: ${files.images.length}`);

    const existingImages =
      existingMedia?.images && Array.isArray(existingMedia.images)
        ? [...existingMedia.images]
        : [];

    const newImages = [];
    for (const imageFile of files.images) {
      const imageData = await handleMediaUpload(imageFile, req, "image");
      imageData.title = imageFile.originalname || "image";
      imageData.size = imageFile.size || 0;
      imageData.type = imageFile.mimetype || null;
      imageData.uploadedAt = new Date();
      newImages.push(imageData);
    }

    media.images = [...existingImages, ...newImages].slice(0, 5);

    console.log(`📸 Final images count: ${media.images.length}`);
    console.log("📸 Image update completed successfully");
  } else if (existingMedia?.images) {
    media.images = Array.isArray(existingMedia.images)
      ? [...existingMedia.images]
      : [];
  }

  return media;
};

/**
 * @param {Object} file
 * @param {Object} req
 * @param {Object} existingItem
 * @param {String} resourceType
 * @returns {Object}
 */
export const replaceMediaItem = async (
  file,
  req,
  existingItem,
  resourceType = "image"
) => {
  if (!file) return existingItem || null;

  if (existingItem?.publicId) {
    await deleteMediaFromLocal(existingItem.publicId, resourceType).catch(
      (err) =>
        console.warn(`Failed to delete old ${resourceType}:`, err.message)
    );
  }

  return await handleMediaUpload(file, req, resourceType);
};

/**
 * @param {Object} files
 * @param {Object} req
 * @param {Object} existingMedia
 * @returns {Object}
 */
export const processPlayerMediaWithTracking = async (
  files,
  req,
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

    results.media = await processPlayerMedia(files, req, existingMedia);

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
