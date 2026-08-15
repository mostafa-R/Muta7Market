import fs from "fs";
import multer from "multer";
import { basename, dirname, join } from "path";
import { fileURLToPath } from "url";
import ApiError from "../utils/ApiError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Private directory (NOT served by express.static under /uploads)
const KYC_UPLOADS_DIR = join(__dirname, "../../privateUploads/kyc");
const KYC_DOCUMENT_ROUTE = "/api/v1/kyc/document";

if (!fs.existsSync(KYC_UPLOADS_DIR)) {
  fs.mkdirSync(KYC_UPLOADS_DIR, { recursive: true });
}

const KYC_ALLOWED_MIMETYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const KYC_ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "pdf", "doc", "docx"];

const kycStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = String(req.user?._id || req.user?.id || "anonymous");
    const userDir = join(KYC_UPLOADS_DIR, userId);
    fs.mkdirSync(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = file.originalname.split(".").pop().toLowerCase();
    cb(null, `kyc-document-${uniqueSuffix}.${extension}`);
  },
});

const kycFileFilter = (req, file, cb) => {
  const extension = file.originalname.split(".").pop().toLowerCase();
  if (
    KYC_ALLOWED_MIMETYPES.includes(file.mimetype) &&
    KYC_ALLOWED_EXTENSIONS.includes(extension)
  ) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Invalid KYC document type: ${file.mimetype} (.${extension}). Allowed: images (jpg/png/webp) and documents (pdf/doc/docx)`
      ),
      false
    );
  }
};

export const kycDocumentUpload = multer({
  storage: kycStorage,
  fileFilter: kycFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("document");

export const generateKycDocumentUrl = (req, filename) => {
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
    host = process.env.BASE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }

  return `${protocol}://${host}${KYC_DOCUMENT_ROUTE}/${encodeURIComponent(filename)}`;
};

export const getKycDocumentPath = (filename, userId) => {
  if (typeof filename !== "string" || !/^[\w.-]+$/.test(filename)) {
    throw new ApiError(400, "Invalid file name");
  }
  const safeName = basename(filename);
  if (safeName !== filename) {
    throw new ApiError(400, "Invalid file name");
  }
  if (userId) {
    return join(KYC_UPLOADS_DIR, String(userId), safeName);
  }
  return join(KYC_UPLOADS_DIR, safeName);
};

export const deleteKycDocument = (filename, userId) => {
  try {
    const filePath = getKycDocumentPath(filename, userId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return;
    }
    if (userId) {
      const legacyPath = getKycDocumentPath(filename);
      if (fs.existsSync(legacyPath)) {
        fs.unlinkSync(legacyPath);
      }
    }
  } catch (error) {
    console.error("Error deleting KYC document:", error);
  }
};