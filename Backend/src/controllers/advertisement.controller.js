import mongoose from "mongoose";
import { deleteFromCloudinary } from "../middleware/localUpload.middleware.js";
import Advertisement from "../models/advertisement.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { handleMediaUpload } from "../utils/localMediaUtils.js";

// الحصول على قائمة الإعلانات
export const getAllAdvertisements = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    type,
    position,
    isActive,
    search,
  } = req.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 },
  };

  const filter = {};

  if (type) {
    filter.type = type;
  }

  if (position) {
    filter.position = position;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  if (search) {
    filter.$or = [
      { "title.ar": { $regex: search, $options: "i" } },
      { "title.en": { $regex: search, $options: "i" } },
      { "advertiser.name": { $regex: search, $options: "i" } },
    ];
  }

  const advertisements = await Advertisement.find(filter)
    .sort(options.sort)
    .skip((options.page - 1) * options.limit)
    .limit(options.limit);

  const totalAdvertisements = await Advertisement.countDocuments(filter);

  const pagination = {
    totalDocs: totalAdvertisements,
    totalPages: Math.ceil(totalAdvertisements / options.limit),
    currentPage: options.page,
    hasNextPage: options.page < Math.ceil(totalAdvertisements / options.limit),
    hasPrevPage: options.page > 1,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { advertisements, pagination },
        "تم الحصول على قائمة الإعلانات بنجاح"
      )
    );
});

// الحصول على إعلان محدد
export const getAdvertisementById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "معرف الإعلان غير صالح");
  }

  const advertisement = await Advertisement.findById(id);

  if (!advertisement) {
    throw new ApiError(404, "الإعلان غير موجود");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, advertisement, "تم الحصول على الإعلان بنجاح"));
});

// إنشاء إعلان جديد
export const createAdvertisement = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    type,
    position,
    link,
    displayPeriod,
    isActive,
    priority,
    advertiser,
    pricing,
    targeting,
  } = req.body;

  if (!title || !type || !position || !displayPeriod || !advertiser) {
    throw new ApiError(400, "يرجى توفير جميع البيانات المطلوبة");
  }

  if (!req.files || !req.files.desktop) {
    throw new ApiError(400, "يرجى تحميل صورة الإعلان للنسخة المكتبية");
  }

  // رفع صورة الإعلان للنسخة المكتبية
  const desktopImageUploadResult = await handleMediaUpload(
    req.files.desktop[0],
    req,
    "image"
  );

  if (!desktopImageUploadResult.url) {
    throw new ApiError(500, "فشل في تحميل صورة الإعلان للنسخة المكتبية");
  }

  // رفع صورة الإعلان للنسخة المحمولة (إذا وجدت)
  let mobileImageUploadResult = null;

  if (req.files.mobile && req.files.mobile[0]) {
    mobileImageUploadResult = await handleMediaUpload(
      req.files.mobile[0],
      req,
      "image"
    );

    if (!mobileImageUploadResult.url) {
      throw new ApiError(500, "فشل في تحميل صورة الإعلان للنسخة المحمولة");
    }
  }

  // إنشاء إعلان جديد
  const newAdvertisement = await Advertisement.create({
    title,
    description,
    type,
    position,
    media: {
      desktop: {
        url: desktopImageUploadResult.url,
        publicId: desktopImageUploadResult.publicId,
        width: desktopImageUploadResult.width || 0,
        height: desktopImageUploadResult.height || 0,
      },
      mobile: mobileImageUploadResult
        ? {
            url: mobileImageUploadResult.url,
            publicId: mobileImageUploadResult.publicId,
            width: mobileImageUploadResult.width || 0,
            height: mobileImageUploadResult.height || 0,
          }
        : undefined,
    },
    link,
    displayPeriod,
    isActive: isActive !== undefined ? isActive : true,
    priority: priority || 0,
    advertiser,
    pricing: pricing || { cost: 0, currency: "SAR" },
    targeting: targeting || {},
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newAdvertisement, "تم إنشاء الإعلان بنجاح"));
});

// تحديث إعلان
export const updateAdvertisement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    type,
    position,
    link,
    displayPeriod,
    isActive,
    priority,
    advertiser,
    pricing,
    targeting,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "معرف الإعلان غير صالح");
  }

  const advertisement = await Advertisement.findById(id);

  if (!advertisement) {
    throw new ApiError(404, "الإعلان غير موجود");
  }

  // تحديث بيانات الإعلان
  if (title) {
    if (title.ar) advertisement.title.ar = title.ar;
    if (title.en) advertisement.title.en = title.en;
  }

  if (description) {
    if (description.ar) advertisement.description.ar = description.ar;
    if (description.en) advertisement.description.en = description.en;
  }

  if (type) {
    advertisement.type = type;
  }

  if (position) {
    advertisement.position = position;
  }

  if (link) {
    advertisement.link = {
      ...advertisement.link,
      ...link,
    };
  }

  if (displayPeriod) {
    if (displayPeriod.startDate)
      advertisement.displayPeriod.startDate = displayPeriod.startDate;
    if (displayPeriod.endDate)
      advertisement.displayPeriod.endDate = displayPeriod.endDate;
  }

  if (isActive !== undefined) {
    advertisement.isActive = isActive;
  }

  if (priority !== undefined) {
    advertisement.priority = priority;
  }

  if (advertiser) {
    advertisement.advertiser = {
      ...advertisement.advertiser,
      ...advertiser,
    };
  }

  if (pricing) {
    advertisement.pricing = {
      ...advertisement.pricing,
      ...pricing,
    };
  }

  if (targeting) {
    advertisement.targeting = {
      ...advertisement.targeting,
      ...targeting,
    };
  }

  await advertisement.save();

  return res
    .status(200)
    .json(new ApiResponse(200, advertisement, "تم تحديث الإعلان بنجاح"));
});

// تحديث صور الإعلان
export const updateAdvertisementMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "معرف الإعلان غير صالح");
  }

  const advertisement = await Advertisement.findById(id);

  if (!advertisement) {
    throw new ApiError(404, "الإعلان غير موجود");
  }

  // تحديث صورة الإعلان للنسخة المكتبية
  if (req.files && req.files.desktop && req.files.desktop[0]) {
    // حذف الصورة القديمة
    if (advertisement.media.desktop && advertisement.media.desktop.publicId) {
      await deleteFromCloudinary(advertisement.media.desktop.publicId);
    }

    // رفع الصورة الجديدة
    const desktopImageUploadResult = await handleMediaUpload(
      req.files.desktop[0],
      req,
      "image"
    );

    if (!desktopImageUploadResult.url) {
      throw new ApiError(500, "فشل في تحميل صورة الإعلان للنسخة المكتبية");
    }

    advertisement.media.desktop = {
      url: desktopImageUploadResult.url,
      publicId: desktopImageUploadResult.publicId,
      width: desktopImageUploadResult.width || 0,
      height: desktopImageUploadResult.height || 0,
    };
  }

  // تحديث صورة الإعلان للنسخة المحمولة
  if (req.files && req.files.mobile && req.files.mobile[0]) {
    // حذف الصورة القديمة
    if (advertisement.media.mobile && advertisement.media.mobile.publicId) {
      await deleteFromCloudinary(advertisement.media.mobile.publicId);
    }

    // رفع الصورة الجديدة
    const mobileImageUploadResult = await handleMediaUpload(
      req.files.mobile[0],
      req,
      "image"
    );

    if (!mobileImageUploadResult.url) {
      throw new ApiError(500, "فشل في تحميل صورة الإعلان للنسخة المحمولة");
    }

    advertisement.media.mobile = {
      url: mobileImageUploadResult.url,
      publicId: mobileImageUploadResult.publicId,
      width: mobileImageUploadResult.width || 0,
      height: mobileImageUploadResult.height || 0,
    };
  }

  await advertisement.save();

  return res
    .status(200)
    .json(new ApiResponse(200, advertisement, "تم تحديث صور الإعلان بنجاح"));
});

// حذف إعلان
export const deleteAdvertisement = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "معرف الإعلان غير صالح");
  }

  const advertisement = await Advertisement.findById(id);

  if (!advertisement) {
    throw new ApiError(404, "الإعلان غير موجود");
  }

  // حذف صور الإعلان
  if (advertisement.media.desktop && advertisement.media.desktop.publicId) {
    await deleteFromCloudinary(advertisement.media.desktop.publicId);
  }

  if (advertisement.media.mobile && advertisement.media.mobile.publicId) {
    await deleteFromCloudinary(advertisement.media.mobile.publicId);
  }

  await Advertisement.findByIdAndDelete(id);

  return res.status(200).json(new ApiResponse(200, {}, "تم حذف الإعلان بنجاح"));
});

// تسجيل نقرة على الإعلان
export const registerAdvertisementClick = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "معرف الإعلان غير صالح");
  }

  const advertisement = await Advertisement.findById(id);

  if (!advertisement) {
    throw new ApiError(404, "الإعلان غير موجود");
  }

  await advertisement.registerClick();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { url: advertisement.link.url },
        "تم تسجيل النقرة بنجاح"
      )
    );
});

// الحصول على الإعلانات النشطة حسب الموقع (للواجهة الأمامية)
export const getActiveAdvertisementsByPosition = asyncHandler(
  async (req, res) => {
    const { position } = req.params;
    const { limit = 5 } = req.query;

    const advertisements = await Advertisement.getActiveAds(
      position,
      parseInt(limit, 10)
    );

    // تسجيل مشاهدة للإعلانات
    for (const ad of advertisements) {
      await ad.registerView();
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          advertisements,
          "تم الحصول على الإعلانات النشطة بنجاح"
        )
      );
  }
);
