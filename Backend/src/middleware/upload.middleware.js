import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../config/cloudinary.js";
import ApiError from "../utils/ApiError.js";

// Helper functions to determine file types
const isImage = (mimetype) => mimetype.startsWith("image/");
const isVideo = (mimetype) => mimetype.startsWith("video/");
const isDocument = (mimetype) =>
  [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ].includes(mimetype);

// Determine folder and resource type based on file
const getFileParams = (file) => {
  let folder = "sports-platform/";
  let resource_type = "auto";
  let format;

  if (isImage(file.mimetype)) {
    folder += "images";
    resource_type = "image";
  } else if (isVideo(file.mimetype)) {
    folder += "videos";
    resource_type = "video";
  } else if (isDocument(file.mimetype)) {
    folder += "documents";
    // استخدام "auto" بدلاً من "raw" للحفاظ على امتداد الملف
    resource_type = "auto";
    // Preserve original file extension for documents
    format = file.originalname.split(".").pop().toLowerCase();
    
    // التأكد من أن الامتداد صحيح
    if (!format || format.length > 4) {
      // إذا لم يكن هناك امتداد، استخدم mimetype لتحديد الامتداد
      if (file.mimetype === "application/pdf") format = "pdf";
      else if (file.mimetype === "application/msword") format = "doc";
      else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") format = "docx";
      else if (file.mimetype === "text/plain") format = "txt";
    }
  } else {
    folder += "others";
    resource_type = "auto";
  }

  return { folder, resource_type, format };
};

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const { folder, resource_type, format } = getFileParams(file);

    const params = {
      folder,
      resource_type,
      allowed_formats: [
        // Images
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        // Videos
        "mp4",
        "mov",
        "avi",
        "wmv",
        "mkv",
        // Documents
        "pdf",
        "doc",
        "docx",
        "txt",
      ],
    };

    // Add format for documents to preserve extension
    if (format && resource_type === "auto") {
      params.format = format;
      // إضافة معاملات إضافية لضمان الحفاظ على الامتداد
      params.overwrite = false;
      params.invalidate = true;
      // إضافة fetch_format لضمان الحفاظ على الامتداد عند التحميل
      params.fetch_format = format;
    }

    // Add transformation for images
    if (isImage(file.mimetype)) {
      params.transformation = [{ width: 1000, height: 1000, crop: "limit" }];
    }

    return params;
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    // Videos
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-ms-wmv",
    "video/x-matroska",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Invalid file type: ${file.mimetype}. Allowed types: images, videos, documents`
      ),
      false
    );
  }
};

// Create multer instance with mixed upload support
export const uploadMixed = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// Export individual upload middlewares
export const uploadSingle = (fieldName) => uploadMixed.single(fieldName);
export const uploadMultiple = (fieldName, maxCount) =>
  uploadMixed.array(fieldName, maxCount);
export const uploadFields = (fields) => uploadMixed.fields(fields);

// Helper function to delete files from Cloudinary
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

export default uploadMixed;
