// uploads/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Export cloudinary instance
export { cloudinary };
export default cloudinary;

// Helpers
const isImage = (m) => m.startsWith("image/");
const isVideo = (m) => m.startsWith("video/");
const isDoc = (m) =>
  [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ].includes(m);

// Folders by type
const folderFor = (file) => {
  if (isImage(file.mimetype)) return "images";
  if (isVideo(file.mimetype)) return "videos";
  if (isDoc(file.mimetype)) return "documents";
  return "others";
};

// Allowed formats (for safety)
const ALLOWED_IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp"];
const ALLOWED_VIDEO_EXTS = ["mp4", "avi", "mov", "wmv", "mkv"];
const ALLOWED_DOC_EXTS = ["pdf", "doc", "docx"];

// Single mixed storage (auto resource_type)
export const mixedStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const folder = `sports-platform/${folderFor(file)}`;

    // تحديد resource_type بناءً على نوع الملف
    let resource_type;
    let format;

    if (isImage(file.mimetype)) {
      resource_type = "image";
    } else if (isVideo(file.mimetype)) {
      resource_type = "video";
    } else if (isDoc(file.mimetype)) {
      // للمستندات، نستخدم "raw" مع الحفاظ على الامتداد
      resource_type = "raw";
      // استخراج امتداد الملف من الاسم الأصلي
      format = file.originalname.split(".").pop().toLowerCase();
    } else {
      resource_type = "auto";
    }

    const allowed_formats = isImage(file.mimetype)
      ? ALLOWED_IMAGE_EXTS
      : isVideo(file.mimetype)
      ? ALLOWED_VIDEO_EXTS
      : isDoc(file.mimetype)
      ? ALLOWED_DOC_EXTS
      : undefined;

    const transformation = isImage(file.mimetype)
      ? [{ width: 1000, height: 1000, crop: "limit" }]
      : undefined;

    const params = {
      folder,
      resource_type,
      allowed_formats,
      transformation,
    };

    // إضافة format للمستندات للحفاظ على الامتداد
    if (format && resource_type === "raw") {
      params.format = format;
    }

    return params;
  },
});

// Uploaders
export const uploadMixed = multer({
  storage: mixedStorage,
  limits: {
    fileSize: 120 * 1024 * 1024, // 120MB file size limit
    fieldSize: 10 * 1024 * 1024, // 10MB field size limit for form fields
  },
  fileFilter: (req, file, cb) => {
    if (
      isImage(file.mimetype) ||
      isVideo(file.mimetype) ||
      isDoc(file.mimetype)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"), false);
    }
  },
});

// Dedicated uploader for video-only endpoint
export const uploadVideoOnly = multer({
  storage: mixedStorage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB file size limit for videos
    fieldSize: 10 * 1024 * 1024, // 10MB field size limit for form fields
  },
  fileFilter: (req, file, cb) => {
    if (isVideo(file.mimetype)) return cb(null, true);
    cb(new Error("Not a video! Please upload only videos."), false);
  },
});

// Delete helper with resource_type
export const deleteFromCloudinary = async (
  publicId,
  resource_type = "image"
) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type,
    });
    return result;
  } catch (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

export const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};
