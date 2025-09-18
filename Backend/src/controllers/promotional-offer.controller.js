import mongoose from "mongoose";
import { OFFER_STATUS } from "../config/constants.js";
import { deleteFromCloudinary } from "../middleware/localUpload.middleware.js";
import PromotionalOffer from "../models/promotional-offer.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { handleMediaUpload } from "../utils/localMediaUtils.js";

export const getAllPromotionalOffers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    status,
    isActive,
    search,
  } = req.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 },
  };

  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  if (search) {
    filter.$or = [
      { "name.ar": { $regex: search, $options: "i" } },
      { "name.en": { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } },
    ];
  }

  const offers = await PromotionalOffer.find(filter)
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email")
    .sort(options.sort)
    .skip((options.page - 1) * options.limit)
    .limit(options.limit);

  const totalOffers = await PromotionalOffer.countDocuments(filter);

  const pagination = {
    totalDocs: totalOffers,
    totalPages: Math.ceil(totalOffers / options.limit),
    currentPage: options.page,
    hasNextPage: options.page < Math.ceil(totalOffers / options.limit),
    hasPrevPage: options.page > 1,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { offers, pagination },
        "تم الحصول على قائمة العروض الترويجية بنجاح"
      )
    );
});

export const getPromotionalOfferById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "معرف العرض غير صالح");
  }

  const offer = await PromotionalOffer.findById(id)
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email");

  if (!offer) {
    throw new ApiError(404, "العرض الترويجي غير موجود");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, offer, "تم الحصول على العرض الترويجي بنجاح"));
});

export const createPromotionalOffer = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    code,
    type,
    value,
    maxDiscount,
    applicableTo,
    validityPeriod,
    usageLimit,
    minimumPurchase,
    status,
    isActive,
  } = req.body;

  if (
    !name ||
    !code ||
    !type ||
    (type !== "free" && !value) ||
    !applicableTo ||
    !validityPeriod
  ) {
    throw new ApiError(400, "يرجى توفير جميع البيانات المطلوبة");
  }

  const existingOffer = await PromotionalOffer.findOne({
    code: code.toUpperCase(),
  });

  if (existingOffer) {
    throw new ApiError(400, "يوجد عرض ترويجي بنفس الرمز بالفعل");
  }

  const newOffer = await PromotionalOffer.create({
    name,
    description,
    code: code.toUpperCase(),
    type,
    value: type === "free" ? 0 : value,
    maxDiscount,
    applicableTo,
    validityPeriod,
    usageLimit: usageLimit || { perUser: 1 },
    minimumPurchase: minimumPurchase || 0,
    status: status || OFFER_STATUS.PENDING,
    isActive: isActive !== undefined ? isActive : true,
    createdBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newOffer, "تم إنشاء العرض الترويجي بنجاح"));
});

export const updatePromotionalOffer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    type,
    value,
    maxDiscount,
    applicableTo,
    validityPeriod,
    usageLimit,
    minimumPurchase,
    status,
    isActive,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "معرف العرض غير صالح");
  }

  const offer = await PromotionalOffer.findById(id);

  if (!offer) {
    throw new ApiError(404, "العرض الترويجي غير موجود");
  }

  if (name) {
    if (name.ar) offer.name.ar = name.ar;
    if (name.en) offer.name.en = name.en;
  }

  if (description) {
    if (description.ar) offer.description.ar = description.ar;
    if (description.en) offer.description.en = description.en;
  }

  if (type) {
    offer.type = type;
  }

  if (value !== undefined && type !== "free") {
    offer.value = value;
  }

  if (maxDiscount !== undefined) {
    offer.maxDiscount = maxDiscount;
  }

  if (applicableTo) {
    offer.applicableTo = applicableTo;
  }

  if (validityPeriod) {
    if (validityPeriod.startDate)
      offer.validityPeriod.startDate = validityPeriod.startDate;
    if (validityPeriod.endDate)
      offer.validityPeriod.endDate = validityPeriod.endDate;
  }

  if (usageLimit) {
    offer.usageLimit = {
      ...offer.usageLimit,
      ...usageLimit,
    };
  }

  if (minimumPurchase !== undefined) {
    offer.minimumPurchase = minimumPurchase;
  }

  if (status) {
    offer.status = status;
  }

  if (isActive !== undefined) {
    offer.isActive = isActive;
  }

  offer.updatedBy = req.user._id;

  await offer.save();

  return res
    .status(200)
    .json(new ApiResponse(200, offer, "تم تحديث العرض الترويجي بنجاح"));
});

export const updatePromotionalOfferImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "معرف العرض غير صالح");
  }

  const offer = await PromotionalOffer.findById(id);

  if (!offer) {
    throw new ApiError(404, "العرض الترويجي غير موجود");
  }

  if (!req.file) {
    throw new ApiError(400, "يرجى تحميل صورة العرض");
  }

  if (offer.media && offer.media.image && offer.media.image.publicId) {
    await deleteFromCloudinary(offer.media.image.publicId);
  }

  const imageUploadResult = await handleMediaUpload(req.file, req, "image");

  if (!imageUploadResult.url) {
    throw new ApiError(500, "فشل في تحميل صورة العرض");
  }

  offer.media = {
    image: {
      url: imageUploadResult.url,
      publicId: imageUploadResult.publicId,
    },
  };

  offer.updatedBy = req.user._id;

  await offer.save();

  return res
    .status(200)
    .json(new ApiResponse(200, offer, "تم تحديث صورة العرض الترويجي بنجاح"));
});

export const deletePromotionalOffer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "معرف العرض غير صالح");
  }

  const offer = await PromotionalOffer.findById(id);

  if (!offer) {
    throw new ApiError(404, "العرض الترويجي غير موجود");
  }

  if (offer.media && offer.media.image && offer.media.image.publicId) {
    await deleteFromCloudinary(offer.media.image.publicId);
  }

  await PromotionalOffer.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "تم حذف العرض الترويجي بنجاح"));
});

export const validatePromotionalOfferCode = asyncHandler(async (req, res) => {
  const { code, serviceType, price } = req.body;

  if (!code || !serviceType || price === undefined) {
    throw new ApiError(400, "يرجى توفير جميع البيانات المطلوبة");
  }

  const result = await PromotionalOffer.validateCode(
    code,
    req.user._id,
    serviceType,
    price
  );

  if (!result.valid) {
    return res.status(400).json(new ApiResponse(400, null, result.message));
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        offer: {
          code: result.offer.code,
          type: result.offer.type,
          value: result.offer.value,
          originalPrice: result.originalPrice,
          discountedPrice: result.discountedPrice,
          discount: result.discount,
        },
      },
      "تم التحقق من رمز العرض الترويجي بنجاح"
    )
  );
});

export const usePromotionalOfferCode = asyncHandler(async (req, res) => {
  const { code, serviceType, price } = req.body;

  if (!code || !serviceType || price === undefined) {
    throw new ApiError(400, "يرجى توفير جميع البيانات المطلوبة");
  }

  const result = await PromotionalOffer.validateCode(
    code,
    req.user._id,
    serviceType,
    price
  );

  if (!result.valid) {
    return res.status(400).json(new ApiResponse(400, null, result.message));
  }

  await result.offer.recordUsage(req.user._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        offer: {
          code: result.offer.code,
          type: result.offer.type,
          value: result.offer.value,
          originalPrice: result.originalPrice,
          discountedPrice: result.discountedPrice,
          discount: result.discount,
        },
      },
      "تم استخدام رمز العرض الترويجي بنجاح"
    )
  );
});
