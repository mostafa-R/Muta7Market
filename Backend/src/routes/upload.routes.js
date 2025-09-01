import { Router } from "express";
import {
  generatePublicUrl,
  uploadMultiple,
  uploadSingle,
} from "../config/localStorage.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.post(
  "/",
  uploadSingle("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, "No file provided");
    }

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
  uploadMultiple("files", 10), 
  asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      throw new ApiError(400, "No files provided");
    }

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


router.get("/debug-url", (req, res) => {
  try {
    const testPath = "/test/path/file.jpg";
    const generatedUrl = generatePublicUrl(req, testPath);

    res.json({
      protocol: req.protocol,
      host: req.get("host"),
      headers: req.headers,
      generatedUrl,
      env: process.env.NODE_ENV,
      port: process.env.PORT,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
