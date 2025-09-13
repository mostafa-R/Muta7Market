import mongoose from "mongoose";
import { deleteFromCloudinary } from "../middleware/localUpload.middleware.js";
import Sport from "../models/sport.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { handleMediaUpload } from "../utils/localMediaUtils.js";

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

const sanitizeI18n = (v = {}) => ({
  ar: isNonEmptyString(v.ar) ? v.ar.trim() : "",
  en: isNonEmptyString(v.en) ? v.en.trim() : "",
});

const sanitizePositions = (positions = []) => {
  if (!Array.isArray(positions)) return [];
  return positions
    .map((p) => ({ name: sanitizeI18n(p?.name) }))
    .filter((p) => isNonEmptyString(p.name.ar) && isNonEmptyString(p.name.en));
};

const normalizeJop = (v) => {
  if (!v) return null;
  const t = String(v).trim().toLowerCase();
  if (t === "player" || t === "لاعب") return "player";
  if (t === "coach" || t === "مدرب") return "coach";
  return null;
};

const sanitizeRoleTypes = (roleTypes = []) => {
  if (!Array.isArray(roleTypes)) return [];
  return roleTypes
    .map((r) => ({
      jop: normalizeJop(r?.jop),
      name: {
        ar: typeof r?.name?.ar === "string" ? r.name.ar.trim() : "",
        en: typeof r?.name?.en === "string" ? r.name.en.trim() : "",
      },
    }))
    .filter((r) => r.jop && r.name.ar && r.name.en);
};

const sanitizeSEO = (seo = {}) => {
  const metaTitle = seo?.metaTitle
    ? sanitizeI18n(seo.metaTitle)
    : { ar: null, en: null };
  const metaDescription = seo?.metaDescription
    ? sanitizeI18n(seo.metaDescription)
    : { ar: null, en: null };
  const keywords = Array.isArray(seo?.keywords)
    ? seo.keywords
        .map(String)
        .map((k) => k.trim())
        .filter(Boolean)
    : [];

  return {
    metaTitle: {
      ar: metaTitle.ar || null,
      en: metaTitle.en || null,
    },
    metaDescription: {
      ar: metaDescription.ar || null,
      en: metaDescription.en || null,
    },
    keywords,
  };
};

export const getAllSports = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "asc",
    search,
  } = req.query;

  const options = {
    page: Math.max(parseInt(page, 10) || 1, 1),
    limit: Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100),
  };

  const allowedSort = new Set(["createdAt", "updatedAt", "name.en", "name.ar"]);
  const sortKey = allowedSort.has(sortBy) ? sortBy : "createdAt";
  const sort = { [sortKey]: sortOrder === "desc" ? -1 : 1 };

  const filter = {};

  if (isNonEmptyString(search)) {
    filter.$or = [
      { "name.ar": { $regex: search, $options: "i" } },
      { "name.en": { $regex: search, $options: "i" } },
    ];
  }

  const [sports,totalSports] = await Promise.all([
    Sport.find(filter)
      .select("-__v -createdAt -updatedAt -seo ")
      .sort(sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit),
    Sport.countDocuments(filter),
  ]);

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
        { sports,  pagination },
        "تم الحصول على قائمة الألعاب الرياضية بنجاح"
      )
    );
});

export const getSportById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "معرف اللعبة غير صالح");
  }

  const sport = await Sport.findById(id);
  if (!sport) throw new ApiError(404, "اللعبة الرياضية غير موجودة");

  return res
    .status(200)
    .json(new ApiResponse(200, sport, "تم الحصول على اللعبة الرياضية بنجاح"));
});

export const createSport = asyncHandler(async (req, res) => {
  let data;
  if (req.validatedBody) {
    data = req.validatedBody;
  } else {
    data = req.body;

    let name = {};
    let positions = [];
    let roleTypes = [];
    let seo = {};

    try {
      if (data.name) {
        name =
          typeof data.name === "string" ? JSON.parse(data.name) : data.name;
      }

      if (data.positions) {
        positions =
          typeof data.positions === "string"
            ? JSON.parse(data.positions)
            : data.positions;
      }

      if (data.roleTypes) {
        roleTypes =
          typeof data.roleTypes === "string"
            ? JSON.parse(data.roleTypes)
            : data.roleTypes;
      }

      if (data.seo) {
        seo = typeof data.seo === "string" ? JSON.parse(data.seo) : data.seo;
      }

      data = { name, positions, roleTypes, seo };
    } catch (error) {
      throw new ApiError(400, "خطأ في تنسيق البيانات المرسلة");
    }
  }

  if (
    !data.name ||
    !isNonEmptyString(data.name.ar) ||
    !isNonEmptyString(data.name.en)
  ) {
    throw new ApiError(
      400,
      "يرجى توفير اسم اللعبة باللغتين العربية والإنجليزية"
    );
  }

  const existingSport = await Sport.findOne({
    $or: [
      { "name.ar": data.name.ar.trim() },
      { "name.en": data.name.en.trim() },
    ],
  });
  if (existingSport)
    throw new ApiError(400, "توجد لعبة رياضية بنفس الاسم بالفعل");

  const cleanedPositions = sanitizePositions(data.positions);
  const cleanedRoleTypes = sanitizeRoleTypes(data.roleTypes);
  const cleanedSEO = sanitizeSEO(data.seo);

  let icon = { url: null, publicId: null };
  if (req.file) {
    const iconUploadResult = await handleMediaUpload(req.file, req, "image");
    if (iconUploadResult?.url) {
      icon = {
        url: iconUploadResult.url,
        publicId: iconUploadResult.publicId,
      };
    }
  }

  const newSport = await Sport.create({
    name: { ar: data.name.ar.trim(), en: data.name.en.trim() },
    positions: cleanedPositions,
    roleTypes: cleanedRoleTypes,
    seo: cleanedSEO,
    icon: icon,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newSport, "تم إنشاء اللعبة الرياضية بنجاح"));
});

export const updateSport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let data;
  if (req.validatedBody) {
    data = req.validatedBody;
  } else {
    data = {};

    try {
      if (req.body.name) {
        data.name =
          typeof req.body.name === "string"
            ? JSON.parse(req.body.name)
            : req.body.name;
      }

      if (req.body.positions) {
        data.positions =
          typeof req.body.positions === "string"
            ? JSON.parse(req.body.positions)
            : req.body.positions;
      }

      if (req.body.roleTypes) {
        data.roleTypes =
          typeof req.body.roleTypes === "string"
            ? JSON.parse(req.body.roleTypes)
            : req.body.roleTypes;
      }

      if (req.body.seo) {
        data.seo =
          typeof req.body.seo === "string"
            ? JSON.parse(req.body.seo)
            : req.body.seo;
      }
    } catch (error) {
      throw new ApiError(400, "خطأ في تنسيق البيانات المرسلة");
    }
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "معرف اللعبة غير صالح");
  }

  const sport = await Sport.findById(id);
  if (!sport) {
    throw new ApiError(404, "اللعبة الرياضية غير موجودة");
  }

  if (
    data.name &&
    (isNonEmptyString(data.name.ar) || isNonEmptyString(data.name.en))
  ) {
    const query = { _id: { $ne: id }, $or: [] };
    if (isNonEmptyString(data.name.ar))
      query.$or.push({ "name.ar": data.name.ar.trim() });
    if (isNonEmptyString(data.name.en))
      query.$or.push({ "name.en": data.name.en.trim() });
    if (query.$or.length && (await Sport.findOne(query))) {
      throw new ApiError(400, "توجد لعبة رياضية أخرى بنفس الاسم");
    }
  }

  if (data.name) {
    if (isNonEmptyString(data.name.ar)) sport.name.ar = data.name.ar.trim();
    if (isNonEmptyString(data.name.en)) sport.name.en = data.name.en.trim();
  }
  if (data.positions !== undefined)
    sport.positions = sanitizePositions(data.positions);
  if (data.roleTypes !== undefined)
    sport.roleTypes = sanitizeRoleTypes(data.roleTypes);
  if (data.seo !== undefined)
    sport.seo = { ...sport.seo, ...sanitizeSEO(data.seo) };

  if (req.file) {
    if (sport.icon?.publicId) {
      await deleteFromCloudinary(sport.icon.publicId);
    }

    const iconUploadResult = await handleMediaUpload(req.file, req, "image");
    if (iconUploadResult?.url) {
      sport.icon = {
        url: iconUploadResult.url,
        publicId: iconUploadResult.publicId,
      };
    }
  }

  await sport.save();
  return res
    .status(200)
    .json(new ApiResponse(200, sport, "تم تحديث اللعبة الرياضية بنجاح"));
});

export const updateSportIcon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ApiError(400, "معرف اللعبة غير صالح");

  const sport = await Sport.findById(id);
  if (!sport) throw new ApiError(404, "اللعبة الرياضية غير موجودة");

  if (!req.file) throw new ApiError(400, "يرجى تحميل أيقونة اللعبة");

  // delete old icon (if any)
  if (sport.icon?.publicId) {
    await deleteFromCloudinary(sport.icon.publicId);
  }

  const iconUploadResult = await handleMediaUpload(req.file, req, "image");
  if (!iconUploadResult?.url)
    throw new ApiError(500, "فشل في تحميل أيقونة اللعبة");

  sport.icon = {
    url: iconUploadResult.url,
    publicId: iconUploadResult.publicId,
  };
  await sport.save();

  return res
    .status(200)
    .json(new ApiResponse(200, sport, "تم تحديث أيقونة اللعبة الرياضية بنجاح"));
});

export const deleteSport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ApiError(400, "معرف اللعبة غير صالح");

  const sport = await Sport.findById(id);
  if (!sport) throw new ApiError(404, "اللعبة الرياضية غير موجودة");

  if (sport.icon?.publicId) {
    await deleteFromCloudinary(sport.icon.publicId);
  }

  await Sport.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "تم حذف اللعبة الرياضية بنجاح"));
});

export const getActiveSports = asyncHandler(async (_req, res) => {
  const sports = await Sport.find({})
    .select("name icon positions roleTypes slug")
    .sort({ "name.en": 1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, sports, "تم الحصول على قائمة الألعاب الرياضية بنجاح")
    );
});

export const getSportBySlug = asyncHandler(async (_req, _res) => {
  throw new ApiError(410, "تم إزالة خاصية الـ slug من نموذج اللعبة.");
});
