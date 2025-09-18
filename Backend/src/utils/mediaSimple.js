import { cloudinary } from "../config/cloudinary.js";

/**

 * @param {String} publicId 
 * @param {String} resourceType 
 * @returns {Object} 
 */
export const deleteFile = async (publicId, resourceType = "image") => {
  if (!publicId) {
    return { success: false, message: "لا يوجد معرف للملف" };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return { success: true, message: `تم حذف ${resourceType} بنجاح` };
  } catch (error) {
    console.error(`خطأ في حذف ${resourceType}:`, error.message);
    return { success: false, message: error.message };
  }
};

/**
 * @param {Object} file
 * @param {String} resourceType
 * @returns {Object}
 */
export const uploadFile = async (file, resourceType = null) => {
  if (!file) {
    return null;
  }

  if (!resourceType) {
    if (file.mimetype.startsWith("image/")) resourceType = "image";
    else if (file.mimetype.startsWith("video/")) resourceType = "video";
    else resourceType = "raw";
  }

  const MAX_SIZES = {
    image: 10 * 1024 * 1024,
    video: 100 * 1024 * 1024,
    raw: 10 * 1024 * 1024,
  };

  if (file.size > MAX_SIZES[resourceType]) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const maxSizeInMB = (MAX_SIZES[resourceType] / (1024 * 1024)).toFixed(2);
    console.error(
      ` حجم الملف يتجاوز الحد: ${sizeInMB}MB / الحد الأقصى: ${maxSizeInMB}MB`
    );
    return null;
  }

  try {
    let finalUrl;

    if (file.secure_url) {
      finalUrl = file.secure_url;
    } else if (file.path) {
      const fileName = file.filename || file.originalname;

      let baseUrl = process.env.BASE_URL;
      if (!baseUrl) {
        const port = process.env.PORT || 5000;
        baseUrl = `http://localhost:${port}`;
      }

      let folder = "images";
      if (resourceType === "video") {
        folder = "videos";
      } else if (resourceType === "raw") {
        folder = "documents";
      }

      finalUrl = `${baseUrl}/uploads/${folder}/${fileName}`;
    } else {
      console.error(`❌ لا يوجد URL أو مسار للملف: ${file.originalname}`);
      return null;
    }

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
      title: file.originalname || null,
      type: file.mimetype,
      size: file.size,
      extension: file.originalname ? file.originalname.split(".").pop() : null,
      uploadedAt: new Date(),
      duration: resourceType === "video" ? 0 : undefined,
    };
  } catch (error) {
    console.error(`❌ خطأ في تحميل ${resourceType}:`, error.message);
    return null;
  }
};

/**
 * @param {Object} files
 * @param {Object} existingPlayerData
 * @param {Object} clientProvidedMedia
 * @returns {Object}
 */
export const safelyUpdatePlayerMedia = async (
  files,
  existingPlayerData,
  clientProvidedMedia
) => {
  let mediaData = {
    profileImage: null,
    video: null,
    document: null,
    images: [],
  };

  if (existingPlayerData && existingPlayerData.media) {
    try {
      const playerMedia = existingPlayerData.media.toObject
        ? existingPlayerData.media.toObject()
        : existingPlayerData.media;

      mediaData = {
        profileImage: playerMedia.profileImage || null,
        video: playerMedia.video || null,
        document: playerMedia.document || null,
        images: Array.isArray(playerMedia.images)
          ? [...playerMedia.images]
          : [],
      };
    } catch (error) {
      console.error("❌ خطأ في استخراج بيانات الوسائط الحالية:", error.message);
    }
  }

  if (clientProvidedMedia) {
    try {
      const parsedMedia =
        typeof clientProvidedMedia === "string"
          ? JSON.parse(clientProvidedMedia)
          : clientProvidedMedia;

      if (parsedMedia.profileImage === null && mediaData.profileImage) {
        mediaData.profileImage = null;
      }

      if (parsedMedia.video === null && mediaData.video) {
        mediaData.video = null;
      }

      if (parsedMedia.document === null && mediaData.document) {
        mediaData.document = null;
      }

      if (Array.isArray(parsedMedia.images)) {
        mediaData.images = [...parsedMedia.images];
      }
    } catch (error) {
      console.error(" خطأ في معالجة بيانات الوسائط من العميل:", error.message);
    }
  }

  if (files) {
    if (files.profileImage && files.profileImage[0]) {
      if (mediaData.profileImage?.publicId) {
        await deleteFile(mediaData.profileImage.publicId, "image");
      }

      const newProfileImage = await uploadFile(files.profileImage[0], "image");
      if (newProfileImage) {
        mediaData.profileImage = newProfileImage;
      }
    }

    if (files.playerVideo && files.playerVideo[0]) {
      if (mediaData.video?.publicId) {
        await deleteFile(mediaData.video.publicId, "video");
      }

      const newVideo = await uploadFile(files.playerVideo[0], "video");
      if (newVideo) {
        newVideo.duration = 0;
        mediaData.video = newVideo;
      }
    }

    if (files.document && files.document[0]) {
      if (mediaData.document?.publicId) {
        await deleteFile(mediaData.document.publicId, "raw");
      }

      const newDocument = await uploadFile(files.document[0], "raw");
      if (newDocument) {
        mediaData.document = newDocument;
      }
    }

    if (files.images && files.images.length > 0) {
      const newImages = [];
      for (const imageFile of files.images) {
        const newImage = await uploadFile(imageFile, "image");
        if (newImage) {
          newImages.push(newImage);
        }
      }

      mediaData.images = [...mediaData.images, ...newImages].slice(0, 5);
    }
  }
  return mediaData;
};
