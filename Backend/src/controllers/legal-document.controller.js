import mongoose from "mongoose";
import LegalDocument from "../models/legal-document.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// الحصول على قائمة المستندات القانونية
export const getAllLegalDocuments = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    type,
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
  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }
  if (search) {
    filter.$or = [
      { "title.ar": { $regex: search, $options: "i" } },
      { "title.en": { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
    ];
  }

  const documents = await LegalDocument.find(filter)
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email")
    .sort(options.sort)
    .skip((options.page - 1) * options.limit)
    .limit(options.limit);

  const totalDocuments = await LegalDocument.countDocuments(filter);

  const pagination = {
    totalDocs: totalDocuments,
    totalPages: Math.ceil(totalDocuments / options.limit),
    currentPage: options.page,
    hasNextPage: options.page < Math.ceil(totalDocuments / options.limit),
    hasPrevPage: options.page > 1,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { documents, pagination },
        "تم الحصول على قائمة المستندات القانونية بنجاح"
      )
    );
});

// الحصول على مستند قانوني محدد
export const getLegalDocumentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "معرف المستند غير صالح");
  }

  const document = await LegalDocument.findById(id)
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email")
    .populate("revisions.updatedBy", "name email");

  if (!document) {
    throw new ApiError(404, "المستند القانوني غير موجود");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, document, "تم الحصول على المستند القانوني بنجاح")
    );
});

// إنشاء مستند قانوني جديد
export const createLegalDocument = asyncHandler(async (req, res) => {
  const {
    type,
    title,
    content,
    version,
    isActive,
    isDefault,
    effectiveDate,
    seo,
  } = req.body;

  if (!type || !title || !content || !version) {
    throw new ApiError(400, "يرجى توفير جميع البيانات المطلوبة");
  }

  // التحقق من عدم وجود مستند بنفس النوع وإعداد افتراضي
  if (isDefault) {
    const existingDefault = await LegalDocument.findOne({
      type,
      isDefault: true,
    });

    if (existingDefault) {
      throw new ApiError(
        400,
        "يوجد بالفعل مستند افتراضي لهذا النوع. يرجى تعديل المستند الموجود أو إلغاء الإعداد الافتراضي"
      );
    }
  }

  // إنشاء مستند جديد
  const newDocument = await LegalDocument.create({
    type,
    title,
    content,
    version,
    isActive: isActive !== undefined ? isActive : true,
    isDefault: isDefault !== undefined ? isDefault : false,
    effectiveDate: effectiveDate || Date.now(),
    createdBy: req.user._id,
    seo: seo || {},
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newDocument, "تم إنشاء المستند القانوني بنجاح"));
});

// تحديث مستند قانوني
export const updateLegalDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    content,
    version,
    isActive,
    isDefault,
    effectiveDate,
    changeDescription,
    seo,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "معرف المستند غير صالح");
  }

  const document = await LegalDocument.findById(id);

  if (!document) {
    throw new ApiError(404, "المستند القانوني غير موجود");
  }

  // التحقق من عدم وجود مستند آخر بنفس النوع وإعداد افتراضي
  if (isDefault) {
    const existingDefault = await LegalDocument.findOne({
      _id: { $ne: id },
      type: document.type,
      isDefault: true,
    });

    if (existingDefault) {
      throw new ApiError(
        400,
        "يوجد بالفعل مستند افتراضي لهذا النوع. يرجى تعديل المستند الموجود أو إلغاء الإعداد الافتراضي"
      );
    }
  }

  // إضافة النسخة الحالية إلى سجل التحديثات إذا تم تغيير المحتوى
  if (
    content &&
    (content.ar !== document.content.ar || content.en !== document.content.en)
  ) {
    document.revisions.push({
      version: document.version,
      content: document.content,
      publishedDate: document.publishedDate,
      updatedBy: document.updatedBy || document.createdBy,
      changeDescription,
    });

    document.content = content;
    document.version = version || document.version;
    document.publishedDate = new Date();
  }

  // تحديث بيانات المستند
  if (title) {
    if (title.ar) document.title.ar = title.ar;
    if (title.en) document.title.en = title.en;
  }

  if (isActive !== undefined) {
    document.isActive = isActive;
  }

  if (isDefault !== undefined) {
    document.isDefault = isDefault;
  }

  if (effectiveDate) {
    document.effectiveDate = effectiveDate;
  }

  if (seo) {
    document.seo = {
      ...document.seo,
      ...seo,
    };
  }

  document.updatedBy = req.user._id;

  await document.save();

  return res
    .status(200)
    .json(new ApiResponse(200, document, "تم تحديث المستند القانوني بنجاح"));
});

// حذف مستند قانوني
export const deleteLegalDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "معرف المستند غير صالح");
  }

  const document = await LegalDocument.findById(id);

  if (!document) {
    throw new ApiError(404, "المستند القانوني غير موجود");
  }

  // التحقق من أن المستند ليس افتراضياً
  if (document.isDefault) {
    throw new ApiError(
      400,
      "لا يمكن حذف المستند الافتراضي. يرجى تعيين مستند آخر كافتراضي أولاً"
    );
  }

  await LegalDocument.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "تم حذف المستند القانوني بنجاح"));
});

// الحصول على المستند القانوني الافتراضي حسب النوع (للواجهة الأمامية)
export const getDefaultLegalDocumentByType = asyncHandler(async (req, res) => {
  const { type } = req.params;

  const document = await LegalDocument.findOne({
    type,
    isActive: true,
    isDefault: true,
  }).select("title content version effectiveDate publishedDate");

  if (!document) {
    throw new ApiError(404, "المستند القانوني غير موجود");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, document, "تم الحصول على المستند القانوني بنجاح")
    );
});

// الحصول على مستند قانوني بواسطة الـ slug (للواجهة الأمامية)
export const getLegalDocumentBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const document = await LegalDocument.findOne({
    slug,
    isActive: true,
  }).select("title content version effectiveDate publishedDate seo");

  if (!document) {
    throw new ApiError(404, "المستند القانوني غير موجود");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, document, "تم الحصول على المستند القانوني بنجاح")
    );
});
