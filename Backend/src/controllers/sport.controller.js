import mongoose from "mongoose";
import { deleteFromCloudinary } from "../middleware/localUpload.middleware.js";
import Sport from "../models/sport.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { handleMediaUpload } from "../utils/localMediaUtils.js";

// الحصول على قائمة الألعاب الرياضية
export const getAllSports = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "displayOrder",
    sortOrder = "asc",
    isActive,
    search,
  } = req.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 },
  };

  const filter = {};

  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  if (search) {
    filter.$or = [
      { "name.ar": { $regex: search, $options: "i" } },
      { "name.en": { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
    ];
  }

  const sports = await Sport.find(filter)
    .sort(options.sort)
    .skip((options.page - 1) * options.limit)
    .limit(options.limit);

  const totalSports = await Sport.countDocuments(filter);

  const pagination = {
    totalDocs: totalSports,
    totalPages: Math.ceil(totalSports / options.limit),
    currentPage: options.page,
    hasNextPage: options.page < Math.ceil(totalSports / options.limit),
    hasPrevPage: options.page > 1,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { sports, pagination },
        "تم الحصول على قائمة الألعاب الرياضية بنجاح"
      )
    );
});

// الحصول على لعبة رياضية محددة
export const getSportById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "معرف اللعبة غير صالح");
  }

  const sport = await Sport.findById(id);

  if (!sport) {
    throw new ApiError(404, "اللعبة الرياضية غير موجودة");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, sport, "تم الحصول على اللعبة الرياضية بنجاح"));
});

// إنشاء لعبة رياضية جديدة
export const createSport = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    positions,
    roleTypes,
    isActive,
    displayOrder,
    seo,
  } = req.body;

  if (!name || !name.ar || !name.en) {
    throw new ApiError(
      400,
      "يرجى توفير اسم اللعبة باللغتين العربية والإنجليزية"
    );
  }

  // التحقق من عدم وجود لعبة بنفس الاسم
  const existingSport = await Sport.findOne({
    $or: [{ "name.ar": name.ar }, { "name.en": name.en }],
  });

  if (existingSport) {
    throw new ApiError(400, "توجد لعبة رياضية بنفس الاسم بالفعل");
  }

  // إنشاء لعبة جديدة
  const newSport = await Sport.create({
    name,
    description,
    positions: positions || [],
    roleTypes: roleTypes || [],
    isActive: isActive !== undefined ? isActive : true,
    displayOrder: displayOrder || 0,
    seo: seo || {},
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newSport, "تم إنشاء اللعبة الرياضية بنجاح"));
});

// تحديث لعبة رياضية
export const updateSport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    positions,
    roleTypes,
    isActive,
    displayOrder,
    seo,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "معرف اللعبة غير صالح");
  }

  const sport = await Sport.findById(id);

  if (!sport) {
    throw new ApiError(404, "اللعبة الرياضية غير موجودة");
  }

  // التحقق من عدم وجود لعبة أخرى بنفس الاسم
  if (name && (name.ar || name.en)) {
    const query = {
      _id: { $ne: id },
      $or: [],
    };

    if (name.ar) {
      query.$or.push({ "name.ar": name.ar });
    }

    if (name.en) {
      query.$or.push({ "name.en": name.en });
    }

    if (query.$or.length > 0) {
      const existingSport = await Sport.findOne(query);

      if (existingSport) {
        throw new ApiError(400, "توجد لعبة رياضية أخرى بنفس الاسم");
      }
    }
  }

  // تحديث بيانات اللعبة
  if (name) {
    if (name.ar) sport.name.ar = name.ar;
    if (name.en) sport.name.en = name.en;
  }

  if (description) {
    if (description.ar) sport.description.ar = description.ar;
    if (description.en) sport.description.en = description.en;
  }

  if (positions) {
    sport.positions = positions;
  }

  if (roleTypes) {
    sport.roleTypes = roleTypes;
  }

  if (isActive !== undefined) {
    sport.isActive = isActive;
  }

  if (displayOrder !== undefined) {
    sport.displayOrder = displayOrder;
  }

  if (seo) {
    sport.seo = {
      ...sport.seo,
      ...seo,
    };
  }

  await sport.save();

  return res
    .status(200)
    .json(new ApiResponse(200, sport, "تم تحديث اللعبة الرياضية بنجاح"));
});

// تحديث أيقونة اللعبة الرياضية
export const updateSportIcon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "معرف اللعبة غير صالح");
  }

  const sport = await Sport.findById(id);

  if (!sport) {
    throw new ApiError(404, "اللعبة الرياضية غير موجودة");
  }

  if (!req.file) {
    throw new ApiError(400, "يرجى تحميل أيقونة اللعبة");
  }

  // حذف الأيقونة القديمة إذا كانت موجودة
  if (sport.icon && sport.icon.publicId) {
    await deleteFromCloudinary(sport.icon.publicId);
  }

  // رفع الأيقونة الجديدة
  const iconUploadResult = await handleMediaUpload(req.file, req, "image");

  if (!iconUploadResult.url) {
    throw new ApiError(500, "فشل في تحميل أيقونة اللعبة");
  }

  // تحديث معلومات الأيقونة
  sport.icon = {
    url: iconUploadResult.url,
    publicId: iconUploadResult.publicId,
  };

  await sport.save();

  return res
    .status(200)
    .json(new ApiResponse(200, sport, "تم تحديث أيقونة اللعبة الرياضية بنجاح"));
});

// حذف لعبة رياضية
export const deleteSport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "معرف اللعبة غير صالح");
  }

  const sport = await Sport.findById(id);

  if (!sport) {
    throw new ApiError(404, "اللعبة الرياضية غير موجودة");
  }

  // حذف الأيقونة إذا كانت موجودة
  if (sport.icon && sport.icon.publicId) {
    await deleteFromCloudinary(sport.icon.publicId);
  }

  await Sport.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "تم حذف اللعبة الرياضية بنجاح"));
});

// الحصول على قائمة الألعاب الرياضية النشطة (للواجهة الأمامية)
export const getActiveSports = asyncHandler(async (req, res) => {
  const sports = await Sport.find({ isActive: true })
    .select("name slug icon description positions roleTypes")
    .sort({ displayOrder: 1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        sports,
        "تم الحصول على قائمة الألعاب الرياضية النشطة بنجاح"
      )
    );
});

// الحصول على لعبة رياضية بواسطة الـ slug (للواجهة الأمامية)
export const getSportBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const sport = await Sport.findOne({ slug, isActive: true });

  if (!sport) {
    throw new ApiError(404, "اللعبة الرياضية غير موجودة");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, sport, "تم الحصول على اللعبة الرياضية بنجاح"));
});
