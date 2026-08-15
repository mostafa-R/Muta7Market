import { KYC_STATUS, STAFF_ROLES } from "../config/constants.js";
import {
  deleteKycDocument,
  generateKycDocumentUrl,
  getKycDocumentPath,
} from "../config/kycStorage.js";
import Kyc from "../models/kyc.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import fs from "fs";

const KYC_DOCUMENT_PATH = "/api/v1/kyc/document/";

export const uploadKycDocument = asyncHandler(async (req, res) => {
  if (req.user.role !== "club") {
    throw new ApiError(
      403,
      "KYC verification is only available for club accounts"
    );
  }

  if (!req.file) {
    throw new ApiError(400, "No file provided");
  }

  const url = generateKycDocumentUrl(req, req.file.filename);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        url,
        secure_url: url,
        public_id: req.file.filename,
        publicId: req.file.filename,
        resource_type: req.file.mimetype.startsWith("image/")
          ? "image"
          : "raw",
        format: req.file.originalname
          ? req.file.originalname.split(".").pop()
          : null,
        bytes: req.file.size,
        created_at: new Date().toISOString(),
      },
      "KYC document uploaded successfully"
    )
  );
});

export const getKycDocument = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  const userId = req.user._id || req.user.id;
  const isStaff = STAFF_ROLES.includes(req.user.role);

  if (!isStaff) {
    const kyc = await Kyc.findOne({ user: userId }).lean();
    const ownsDocument = (kyc?.documents || []).some(
      (d) =>
        d.publicId === filename ||
        (typeof d.url === "string" &&
          (d.url.endsWith(`/${filename}`) ||
            d.url.includes(`${KYC_DOCUMENT_PATH}${encodeURIComponent(filename)}`)))
    );

    if (!ownsDocument) {
      throw new ApiError(403, "You do not have access to this document");
    }
  }

  const filePath = getKycDocumentPath(filename);
  if (!fs.existsSync(filePath)) {
    throw new ApiError(404, "Document not found");
  }

  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.sendFile(filePath);
});

export const getMyKyc = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;

  const kyc = await Kyc.findOne({ user: userId }).lean();
  const user = await User.findById(userId).select("kycStatus verifiedBadge").lean();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        kyc: kyc || null,
        kycStatus: user?.kycStatus || "not_submitted",
        verifiedBadge: Boolean(user?.verifiedBadge),
      },
      "KYC status fetched successfully"
    )
  );
});

export const submitKyc = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;

  if (req.user.role !== "club") {
    throw new ApiError(
      403,
      "KYC verification is only available for club accounts"
    );
  }

  const { entityName, entityType, documents } = req.body;

  if (!Array.isArray(documents) || documents.length === 0) {
    throw new ApiError(400, "Please provide at least one document");
  }

  const sanitizedDocs = documents
    .filter((d) => d && typeof d.url === "string" && d.url)
    .map((d) => {
      const rawUrl = String(d.url);

      if (!rawUrl.includes(KYC_DOCUMENT_PATH)) {
        throw new ApiError(
          400,
          "KYC documents must be uploaded through the secure KYC upload endpoint (/api/v1/kyc/upload). Public /uploads URLs are not allowed."
        );
      }

      let filenameFromUrl;
      try {
        filenameFromUrl = decodeURIComponent(rawUrl.split("/").pop().split("?")[0]);
      } catch {
        throw new ApiError(400, "KYC document url is invalid");
      }

      return {
        documentType: String(d.documentType || "other"),
        url: rawUrl,
        publicId: d.publicId || filenameFromUrl || null,
      };
    });

  if (sanitizedDocs.length === 0) {
    throw new ApiError(400, "Documents must include a valid url");
  }

  const existing = await Kyc.findOne({ user: userId });
  const kyc =
    existing ||
    new Kyc({
      user: userId,
    });

  if (existing && Array.isArray(existing.documents)) {
    const keptIds = new Set(sanitizedDocs.map((d) => d.publicId));
    for (const oldDoc of existing.documents) {
      if (oldDoc.publicId && !keptIds.has(oldDoc.publicId)) {
        deleteKycDocument(oldDoc.publicId);
      }
    }
  }

  if (entityName !== undefined) kyc.entityName = String(entityName);
  if (entityType !== undefined) kyc.entityType = String(entityType);
  kyc.documents = sanitizedDocs;
  kyc.status = KYC_STATUS.PENDING;
  kyc.rejectionReason = null;
  kyc.submittedAt = new Date();
  kyc.reviewedAt = null;
  kyc.reviewedBy = null;
  await kyc.save();

  await User.updateOne(
    { _id: userId },
    { $set: { kycStatus: KYC_STATUS.PENDING } }
  );

  res.status(200).json(
    new ApiResponse(200, kyc, "KYC submitted for review")
  );
});

export const listPendingKyc = asyncHandler(async (req, res) => {
  const status = req.query.status || KYC_STATUS.PENDING;
  const page = Math.max(1, Number(req.query.page || 1));
  const pageSize = Math.max(1, Math.min(100, Number(req.query.pageSize || 20)));
  const skip = (page - 1) * pageSize;

  const q = { status };
  const [items, total] = await Promise.all([
    Kyc.find(q)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate("user", "name email phone role")
      .lean(),
    Kyc.countDocuments(q),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      { items, total, page, pageSize },
      "KYC submissions fetched successfully"
    )
  );
});

export const reviewKyc = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action } = req.params; // "approve" | "reject"
  const { rejectionReason } = req.body;

  const kyc = await Kyc.findById(id);
  if (!kyc) throw new ApiError(404, "KYC submission not found");
  if (kyc.status !== KYC_STATUS.PENDING) {
    throw new ApiError(400, "This submission was already reviewed");
  }

  const reviewerId = req.user._id || req.user.id;

  const targetUser = await User.findById(kyc.user).select("role").lean();
  if (!targetUser) throw new ApiError(404, "KYC user not found");
  if (targetUser.role !== "club") {
    throw new ApiError(
      400,
      "KYC can only be approved for club accounts"
    );
  }

  if (action === "approve") {
    kyc.status = KYC_STATUS.APPROVED;
    await kyc.save();
    await User.updateOne(
      { _id: kyc.user },
      { $set: { kycStatus: KYC_STATUS.APPROVED, verifiedBadge: true } }
    );
  } else if (action === "reject") {
    if (!rejectionReason) {
      throw new ApiError(400, "Rejection reason is required");
    }
    kyc.status = KYC_STATUS.REJECTED;
    kyc.rejectionReason = String(rejectionReason);
    await kyc.save();
    await User.updateOne(
      { _id: kyc.user },
      { $set: { kycStatus: KYC_STATUS.REJECTED, verifiedBadge: false } }
    );
  } else {
    throw new ApiError(400, "Invalid action");
  }

  kyc.reviewedBy = reviewerId;
  kyc.reviewedAt = new Date();
  await kyc.save();

  res.status(200).json(
    new ApiResponse(200, kyc, `KYC ${action}ed successfully`)
  );
});
