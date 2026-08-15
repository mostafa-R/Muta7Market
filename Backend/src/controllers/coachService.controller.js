import mongoose from "mongoose";
import Coach from "../models/coach.model.js";
import CoachService from "../models/coachService.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const STAFF_ROLES = ["admin", "super_admin"];

export const createCoachService = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;

  if (!STAFF_ROLES.includes(req.user.role) && req.user.role !== "coach") {
    throw new ApiError(403, "Only coaches can offer training services");
  }

  const coach = await Coach.findOne({ user: userId }).select("_id").lean();

  const { title, description, category, price, durationMinutes, mode, location, isActive } = req.body;

  const service = await CoachService.create({
    user: userId,
    coach: coach ? coach._id : null,
    title: title || { en: "Training Session", ar: "جلسة تدريبية" },
    description: description || { en: null, ar: null },
    category: category || "other",
    price: price || { amount: 0, currency: "SAR" },
    durationMinutes: durationMinutes || 60,
    mode: mode || "in_person",
    location: location || { city: null, area: null },
    isActive: isActive !== undefined ? isActive : true,
  });

  res.status(201).json(
    new ApiResponse(201, service, "Training service created successfully")
  );
});

export const getMyServices = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const services = await CoachService.find({ user: userId }).sort({ createdAt: -1 });
  res.status(200).json(
    new ApiResponse(200, services, "Your training services fetched successfully")
  );
});

export const listCoachServices = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    mode,
    minPrice,
    maxPrice,
    search,
  } = req.query;

  const filter = { isActive: true };

  if (category) filter.category = category;
  if (mode) filter.mode = mode;

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter["price.amount"] = {};
    if (minPrice !== undefined) filter["price.amount"].$gte = Number(minPrice);
    if (maxPrice !== undefined) filter["price.amount"].$lte = Number(maxPrice);
  }

  if (search) {
    filter.$or = [
      { "title.en": { $regex: search, $options: "i" } },
      { "title.ar": { $regex: search, $options: "i" } },
      { "description.en": { $regex: search, $options: "i" } },
      { "description.ar": { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [services, total] = await Promise.all([
    CoachService.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip)
      .populate("coach", "name category nationality")
      .lean(),
    CoachService.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        services,
        pagination: {
          total,
          pages: Math.ceil(total / Number(limit)),
          page: Number(page),
          limit: Number(limit),
        },
      },
      "Training services fetched successfully"
    )
  );
});

export const getCoachServiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid service ID");
  }

  const service = await CoachService.findById(id)
    .populate("coach", "name category nationality experience")
    .populate("user", "name verifiedBadge");

  if (!service) throw new ApiError(404, "Training service not found");

  if (service.isActive) {
    service.views += 1;
    await service.save();
  }

  res.status(200).json(
    new ApiResponse(200, service, "Training service fetched successfully")
  );
});

const loadOwnedService = async (id, userId, userRole) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid service ID");
  }

  const service = await CoachService.findById(id);
  if (!service) throw new ApiError(404, "Training service not found");

  const isOwner = String(service.user) === String(userId);
  const isStaff = STAFF_ROLES.includes(userRole);
  if (!isOwner && !isStaff) {
    throw new ApiError(403, "You do not own this service");
  }
  return service;
};

export const updateCoachService = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const service = await loadOwnedService(req.params.id, userId, req.user.role);

  const allowed = [
    "title",
    "description",
    "category",
    "price",
    "durationMinutes",
    "mode",
    "location",
    "isActive",
  ];

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      service[key] = req.body[key];
    }
  }

  await service.save();

  res.status(200).json(
    new ApiResponse(200, service, "Training service updated successfully")
  );
});

export const deleteCoachService = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const service = await loadOwnedService(req.params.id, userId, req.user.role);

  await service.deleteOne();

  res.status(200).json(
    new ApiResponse(200, null, "Training service deleted successfully")
  );
});