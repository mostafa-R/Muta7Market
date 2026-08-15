import { Router } from "express";
import {
  generatePublicUrl,
  uploadMultiple,
  uploadSingle,
} from "../config/localStorage.js";
import {
  authMiddleware,
  authorize,
} from "../middleware/auth.middleware.js";
import { uploadLimiter } from "../middleware/rateLimiter.middleware.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { validateUploadedFiles } from "../utils/magicBytes.js";

const router = Router();

router.use(authMiddleware);
router.use(uploadLimiter);

router.post(
  "/",
  authorize("super_admin", "admin", "player", "coach", "club", "agent", "scout"),
  uploadSingle("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, "No file provided");
    }

    validateUploadedFiles(req);

    try {
      const url = generatePublicUrl(req, req.file.path);

      const response = {
        url,
        secure_url: url, 
        public_id: req.file.filename,
        resource_type: req.file.mimetype.startsWith("image/")
          ? "image"
          : req.file.mimetype.startsWith("video/")
          ? "video"
          : "raw",
        format: req.file.originalname
          ? req.file.originalname.split(".").pop()
          : null,
        bytes: req.file.size,
        created_at: new Date().toISOString(),
        version: 1, 
        type: "upload",
      };

      res
        .status(200)
        .json(new ApiResponse(200, response, "File uploaded successfully"));
    } catch (error) {
      console.error("Upload error:", error);
      throw new ApiError(500, `Failed to upload file: ${error.message}`);
    }
  })
);


router.post(
  "/multiple",
  authorize("super_admin", "admin", "player", "coach", "club", "agent", "scout"),
  uploadMultiple("files", 10), 
  asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      throw new ApiError(400, "No files provided");
    }

    validateUploadedFiles(req);

    try {
      const responses = req.files.map((file) => {
        const url = generatePublicUrl(req, file.path);

        return {
          url,
          secure_url: url,
          public_id: file.filename,
          resource_type: file.mimetype.startsWith("image/")
            ? "image"
            : file.mimetype.startsWith("video/")
            ? "video"
            : "raw",
          format: file.originalname ? file.originalname.split(".").pop() : null,
          bytes: file.size,
          created_at: new Date().toISOString(),
          version: 1,
          type: "upload",
        };
      });

      res
        .status(200)
        .json(new ApiResponse(200, responses, "Files uploaded successfully"));
    } catch (error) {
      console.error("Multiple upload error:", error);
      throw new ApiError(500, `Failed to upload files: ${error.message}`);
    }
  })
);


export default router;
