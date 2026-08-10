import { KYC_STATUS } from "../config/constants.js";
import Kyc from "../models/kyc.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

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
  const { entityName, entityType, documents } = req.body;

  if (!Array.isArray(documents) || documents.length === 0) {
    throw new ApiError(400, "Please provide at least one document");
  }

  const sanitizedDocs = documents
    .filter((d) => d && typeof d.url === "string" && d.url)
    .map((d) => ({
      documentType: String(d.documentType || "other"),
      url: d.url,
      publicId: d.publicId || null,
    }));

  if (sanitizedDocs.length === 0) {
    throw new ApiError(400, "Documents must include a valid url");
  }

  const existing = await Kyc.findOne({ user: userId });
  const kyc =
    existing ||
    new Kyc({
      user: userId,
    });

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
