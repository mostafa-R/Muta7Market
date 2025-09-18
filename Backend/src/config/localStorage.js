import fs from "fs";
import multer from "multer";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import ApiError from "../utils/ApiError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadDir = join(__dirname, "../../uploads");
const createUploadDirs = () => {
  const dirs = ["images", "videos", "documents", "others"];
  dirs.forEach((dir) => {
    const dirPath = join(uploadDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};

createUploadDirs();

const isImage = (mimetype) => mimetype.startsWith("image/");
const isVideo = (mimetype) => mimetype.startsWith("video/");
const isDocument = (mimetype) =>
  [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ].includes(mimetype);

const getFileParams = (file) => {
  let folder = "";

  if (isImage(file.mimetype)) {
    folder = "images";
  } else if (isVideo(file.mimetype)) {
    folder = "videos";
  } else if (isDocument(file.mimetype)) {
    folder = "documents";
  } else {
    folder = "others";
  }

  return { folder };
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { folder } = getFileParams(file);
    const destinationPath = join(uploadDir, folder);
    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = file.originalname.split(".").pop();
    const filename = `${file.fieldname}-${uniqueSuffix}.${extension}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-ms-wmv",
    "video/x-matroska",
    "video/webm",
    "video/3gpp",
    "video/x-flv",
    "application/octet-stream",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  const fileExtension = file.originalname
    ? file.originalname.split(".").pop().toLowerCase()
    : "";

  const allowedExtensions = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "svg",
    "mp4",
    "avi",
    "mov",
    "wmv",
    "mkv",
    "webm",
    "3gp",
    "flv",
    "mpg",
    "mpeg",
    "pdf",
    "doc",
    "docx",
    "txt",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else if (
    file.mimetype === "application/octet-stream" &&
    allowedExtensions.includes(fileExtension)
  ) {
    console.log(
      `⚠️  Accepting file based on extension: ${fileExtension} (MIME: ${file.mimetype})`
    );
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Invalid file type: ${file.mimetype} (.${fileExtension}). Allowed types: images, videos, documents`
      ),
      false
    );
  }
};

export const uploadLocal = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

export const generatePublicUrl = (req, filePath) => {
  try {
    let protocol = "http";
    if (req && req.protocol) {
      protocol = req.protocol;
    } else if (req && req.headers && req.headers["x-forwarded-proto"]) {
      protocol = req.headers["x-forwarded-proto"];
    } else if (req && req.secure) {
      protocol = "https";
    } else if (process.env.NODE_ENV === "production") {
      protocol = "https";
    }

    let host = `localhost:${process.env.PORT || 5000}`;
    if (req && typeof req.get === "function" && req.get("host")) {
      host = req.get("host");
    } else if (req && req.headers && req.headers["x-forwarded-host"]) {
      host = req.headers["x-forwarded-host"];
    } else if (req && req.headers && req.headers["host"]) {
      host = req.headers["host"];
    } else if (process.env.BASE_URL) {
      const baseUrl = process.env.BASE_URL.replace(/^https?:\/\//, "");
      host = baseUrl;
    }

    const relativePath = filePath.replace(/\\/g, "/");
    const urlPath = relativePath.replace(uploadDir.replace(/\\/g, "/"), "");

    const fullUrl = `${protocol}://${host}/uploads${urlPath}`;

    if (
      (!req || !req.protocol || !req.get || !req.get("host")) &&
      process.env.NODE_ENV === "development"
    ) {
      console.warn(`⚠️  generatePublicUrl used fallbacks: ${fullUrl}`);
    }

    return fullUrl;
  } catch (error) {
    console.error("Error generating public URL:", error);
    const filename = filePath.split(/[\\/]/).pop();
    return `http://localhost:5000/uploads/images/${filename}`;
  }
};

export const uploadSingle = (fieldName) => uploadLocal.single(fieldName);
export const uploadMultiple = (fieldName, maxCount) =>
  uploadLocal.array(fieldName, maxCount);
export const uploadFields = (fields) => uploadLocal.fields(fields);

export default uploadLocal;
