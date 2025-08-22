import coachModel from "../models/coach.model.js";
import Player from "../models/player.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { processPlayerMedia } from "../utils/mediaUtils.js";

function escapeRegex(s = "") {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ================================
// USER MANAGEMENT
// ================================

// ✅ Get All Users
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, role, isActive } = req.query;

  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (role) {
    filter.role = role;
  }

  // Filter by active status
  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  const users = await User.find(filter)
    .select("-password -refreshTokens")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await User.countDocuments(filter);

  const response = {
    users,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };

  res
    .status(200)
    .json(new ApiResponse(200, response, "Users retrieved successfully"));
});

// ✅ Get User By ID
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select("-password -refreshTokens")
    .lean();

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, "User retrieved successfully"));
});

// ✅ Create User (Admin)
export const createUser = asyncHandler(async (req, res) => {
  const {
    email,
    name,
    password,
    role = "user",
    phone,
    isActive = true,
    isEmailVerified = true,
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingUser) {
    throw new ApiError(400, "User with this email or phone already exists");
  }

  const user = await User.create({
    email,
    name,
    password,
    role,
    phone,
    isActive,
    isEmailVerified,
    isPhoneVerified: true,
  });

  const createdUser = await User.findById(user._id)
    .select("-password -refreshTokens")
    .lean();

  res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User created successfully"));
});

export const verifyUserEmail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isEmailVerified } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    id,
    { isEmailVerified },
    { new: true, runValidators: true }
  )
    .select("-password -refreshTokens")
    .lean();

  if (!updatedUser) throw new ApiError(404, "User not found");

  res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Email verification toggled"));
});

// ✅ Update User (Admin Privileges)
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Remove sensitive fields that shouldn't be updated directly
  delete updates.password;
  delete updates.refreshTokens;

  const updatedUser = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  })
    .select("-password -refreshTokens")
    .lean();

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

// ✅ Delete User (Soft Delete Option Optional)
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { soft = false } = req.query;

  if (soft === "true") {
    // Soft delete - just deactivate
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false, deletedAt: new Date() },
      { new: true }
    ).select("-password -refreshTokens");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, user, "User deactivated successfully"));
  } else {
    // Hard delete
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      throw new ApiError(404, "User not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, null, "User deleted successfully"));
  }
});

// ================================
// PLAYER MANAGEMENT
// ================================

// ✅ Get All Players
export const getAllPlayers = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 10,
    search,
    position,
    status,
    nationality,
    minAge,
    maxAge,
    isActive,
    jop,
  } = req.query;

  // تأكد أنها أرقام
  page = parseInt(page) || 10;
  limit = parseInt(limit) || 10;

  const filter = {};

  filter.jop = jop || "player";

  // Search by name
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  // Filter by position
  if (position) {
    filter.position = position;
  }

  // Filter by status
  if (status) {
    filter.status = status;
  }

  // Filter by nationality
  if (nationality) {
    filter.nationality = nationality;
  }

  // Filter by age range
  if (minAge || maxAge) {
    filter.age = {};
    if (minAge) filter.age.$gte = parseInt(minAge, 10);
    if (maxAge) filter.age.$lte = parseInt(maxAge, 10);
  }

  // Filter by active status (لو أُرسلت)
  if (typeof isActive !== "undefined") {
    filter.isActive = isActive === "true";
  }

  // ✅ الترتيب المطلوب:
  // 1) المروّجون أولًا (isPromoted.status: true)
  // 2) ثم isActive: true
  // 3) ثم isActive: false
  // 4) الأحدث إنشاءً داخل كل مجموعة
  const sort = {
    "isPromoted.status": -1,
    isActive: -1,
    createdAt: -1,
  };

  const [players, total] = await Promise.all([
    Player.find(filter)
      .populate("user", "name email phone")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    Player.countDocuments(filter),
  ]);

  const response = {
    players,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPlayers: total,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };

  res
    .status(200)
    .json(new ApiResponse(200, response, "Players retrieved successfully"));
});

// ✅ Get Player By ID
export const getPlayerById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const player = await Player.findById(id).populate(
    "user",
    "name email phone role isActive"
  );

  if (!player) {
    throw new ApiError(404, "Player not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, player, "Player retrieved successfully"));
});

// ✅ Update Player isConfirmed (Admin)
export const updateConfirmation = asyncHandler(async (req, res, next) => {
  const p = await Player.findByIdAndUpdate(
    req.params.id,
    { $set: { isConfirmed: req.body.isConfirmed } },
    { new: true, runValidators: true, select: "-__v" }
  ).lean();
  if (!p)
    return res
      .status(404)
      .json({ success: false, message: "Player not found" });
  res.json({ success: true, message: "Confirmation updated", data: p });
});

// ✅ Update Player isActive (Admin)
export const updateActivation = asyncHandler(async (req, res, next) => {
  const p = await Player.findByIdAndUpdate(
    req.params.id,
    { $set: { isActive: req.body.isActive } },
    { new: true, runValidators: true, select: "-__v" }
  ).lean();
  if (!p)
    return res
      .status(404)
      .json({ success: false, message: "Player not found" });
  res.json({ success: true, message: "Active updated", data: p });
});

// ✅ Update Player isPromoted (Admin)
export const updatePromotion = asyncHandler(async (req, res, next) => {
  const { status, startDate, endDate, type } = req.body;
  const p = await Player.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        "isPromoted.status": status,
        "isPromoted.startDate": startDate ?? null,
        "isPromoted.endDate": endDate ?? null,
        "isPromoted.type": type ?? "featured",
      },
    },
    { new: true, runValidators: true, select: "-__v" }
  ).lean();
  if (!p)
    return res
      .status(404)
      .json({ success: false, message: "Player not found" });
  res.json({ success: true, message: "Promotion updated", data: p });
});

// controllers/player.controller.js
export const getRecentUnconfirmedPlayers = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 10,
    search,
    nationality,
    game,
    minAge,
    maxAge,
    jop = "all",
    isActive,
    isPromoted,
    days,
    from,
    to,
  } = req.query;

  page = parseInt(page, 10) || 1;
  limit = parseInt(limit, 10) || 10;

  const baseFilter = [];

  // فقط غير المؤكّدين
  baseFilter.push({
    $or: [{ isConfirmed: { $ne: true } }, { isConfirmed: { $exists: false } }],
  });

  // jop
  if (jop === "player" || jop === "coach") {
    baseFilter.push({ jop });
  } else {
    // all
    baseFilter.push({ jop: { $in: ["player", "coach"] } });
  }

  // search بالاسم
  if (search) {
    baseFilter.push({ name: { $regex: search, $options: "i" } });
  }

  // الجنسية
  if (nationality) {
    baseFilter.push({ nationality });
  }

  // اللعبة
  if (game) {
    baseFilter.push({ game });
  }

  // العمر
  if (minAge || maxAge) {
    const ageCond = {};
    if (minAge) ageCond.$gte = parseInt(minAge, 10);
    if (maxAge) ageCond.$lte = parseInt(maxAge, 10);
    baseFilter.push({ age: ageCond });
  }

  // isActive
  if (typeof isActive !== "undefined") {
    baseFilter.push({ isActive: isActive === "true" });
  }

  // isPromoted
  if (isPromoted === "true") {
    baseFilter.push({ "isPromoted.status": true });
  } else if (isPromoted === "false") {
    // يشمل غير الموجود أيضًا
    baseFilter.push({
      $or: [
        { "isPromoted.status": false },
        { isPromoted: { $exists: false } },
        { "isPromoted.status": { $exists: false } },
      ],
    });
  }

  // النافذة الزمنية للأحدث
  if (from || to) {
    const createdAt = {};
    if (from) createdAt.$gte = new Date(from);
    if (to) createdAt.$lte = new Date(to);
    baseFilter.push({ createdAt });
  } else if (days) {
    const since = new Date(Date.now() - Number(days) * 86400000);
    baseFilter.push({ createdAt: { $gte: since } });
  }

  const query = baseFilter.length ? { $and: baseFilter } : {};

  // الترتيب: الأحدث أولاً
  const sort = { createdAt: -1 };

  const [players, total] = await Promise.all([
    Player.find(query)
      .select(
        "name jop createdAt isActive isConfirmed status age nationality game media.profileImage contactInfo.email contactInfo.phone isPromoted"
      )
      .populate("user", "name email phone role isActive")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Player.countDocuments(query),
  ]);

  const response = {
    players, // تحتوي على كلٍ من اللاعبين والمدربين حسب jop
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit) || 1,
      totalPlayers: total,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        response,
        "Recent unconfirmed players/coaches retrieved successfully"
      )
    );
});

// ✅ Create Player (Admin)
export const createPlayer = asyncHandler(async (req, res) => {
  const { email, ...playerData } = req.body; // استخراج الـ email والبيانات الأخرى

  // الخطوة 1: التحقق من وجود الـ email في الطلب
  if (!email) {
    throw new ApiError(
      400,
      "Email is required to associate the player with a user"
    );
  }

  // الخطوة 2: البحث عن المستخدم بواسطة الـ email
  const user = await User.findOne({ email }).select("_id name email phone"); // حدد الحقول الضرورية للأداء
  if (!user) {
    throw new ApiError(404, "User not found with the provided email");
  }

  // الخطوة 3: التعامل مع الملفات إذا وجدت
  let media = {}; // افتراضيًا، media فارغ إذا لم يكن هناك ملفات
  if (req.files && Object.keys(req.files).length > 0) {
    try {
      media = await processPlayerMedia(req.files, {}); // لا يوجد media سابق لأنه إنشاء جديد
    } catch (error) {
      console.error("Error processing media files:", error);
      throw new ApiError(
        500,
        "Failed to process media files for player creation"
      );
    }
  }

  // الخطوة 4: إنشاء اللاعب الجديد
  const newPlayer = new Player({
    ...playerData, // البيانات الأخرى من req.body (مثل name, age, إلخ)
    user: user._id, // ربط اللاعب بالمستخدم
    media, // إضافة الميديا المعالجة
  });

  const savedPlayer = await newPlayer.save(); // حفظ في قاعدة البيانات

  // الخطوة 5: populate المستخدم للإرجاع
  const populatedPlayer = await Player.findById(savedPlayer._id)
    .populate("user", "name email phone")
    .lean();

  // الخطوة 6: إرجاع الرد
  res
    .status(201)
    .json(new ApiResponse(201, populatedPlayer, "Player created successfully"));
});

// ✅ Update Player (Admin)
export const updatePlayer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Get existing player to access old file references
  const existingPlayer = await Player.findById(id);
  if (!existingPlayer) {
    throw new ApiError(404, "Player not found");
  }

  // Handle file uploads and replacements
  try {
    if (req.files && Object.keys(req.files).length > 0) {
      // Process all media files using our centralized utility
      const processedMedia = await processPlayerMedia(
        req.files,
        existingPlayer.media
      );

      // Update the media object in the updates
      updates.media = processedMedia;
    } else {
      // No new files uploaded, keep existing media
      updates.media = existingPlayer.media;
    }
  } catch (error) {
    console.error("Error processing media files:", error);
    throw new ApiError(500, "Failed to process media files for player update");
  }

  const updatedPlayer = await Player.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  })
    .populate("user", "name email phone")
    .lean();

  if (!updatedPlayer) {
    throw new ApiError(404, "Player not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedPlayer, "Player updated successfully"));
});

// ✅ Delete Player
export const deletePlayer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { soft = false } = req.query;

  if (soft === "true") {
    // Soft delete - just deactivate
    const player = await Player.findByIdAndUpdate(
      id,
      { isActive: false, deletedAt: new Date() },
      { new: true }
    ).populate("user", "name email phone");

    if (!player) {
      throw new ApiError(404, "Player not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, player, "Player deactivated successfully"));
  } else {
    // Hard delete
    const deletedPlayer = await Player.findByIdAndDelete(id);

    if (!deletedPlayer) {
      throw new ApiError(404, "Player not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, null, "Player deleted successfully"));
  }
});

// ================================
// ANALYTICS & STATS
// ================================

// ✅ Get Dashboard Stats
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    activeUsers,
    totalPlayers,
    activePlayers,
    recentUsers,
    recentPlayers,
    totalCoaches,
    activeCoaches,
    recentCoaches,
    confirmedPlayers,
    confirmedCoaches,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Player.countDocuments(),
    Player.countDocuments({ isActive: true }),
    User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email createdAt")
      .lean(),
    Player.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .lean(),
    coachModel.countDocuments(),
    coachModel.countDocuments({ isActive: true }),
    coachModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .lean(),
    Player.countDocuments({ isConfirmed: true }),
    coachModel.countDocuments({ isConfirmed: true }),
  ]);

  const stats = {
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers,
    },
    players: {
      total: totalPlayers,
      active: activePlayers,
      inactive: totalPlayers - activePlayers,
      confirmed: confirmedPlayers,
    },
    coaches: {
      total: totalCoaches,
      active: activeCoaches,
      inactive: totalCoaches - activeCoaches,
      confirmed: confirmedCoaches,
    },
    recent: {
      users: recentUsers,
      players: recentPlayers,
      coaches: recentCoaches,
    },
  };

  res
    .status(200)
    .json(
      new ApiResponse(200, stats, "Dashboard stats retrieved successfully")
    );
});

// ✅ Bulk Actions
export const bulkUpdateUsers = asyncHandler(async (req, res) => {
  const { userIds, updates } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    throw new ApiError(400, "User IDs array is required");
  }

  // Remove sensitive fields
  delete updates.password;
  delete updates.refreshTokens;

  const result = await User.updateMany({ _id: { $in: userIds } }, updates, {
    runValidators: true,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
      `${result.modifiedCount} users updated successfully`
    )
  );
});

export const bulkUpdatePlayers = asyncHandler(async (req, res) => {
  const { playerIds, updates } = req.body;

  if (!playerIds || !Array.isArray(playerIds) || playerIds.length === 0) {
    throw new ApiError(400, "Player IDs array is required");
  }

  const result = await Player.updateMany({ _id: { $in: playerIds } }, updates, {
    runValidators: true,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
      `${result.modifiedCount} players updated successfully`
    )
  );
});
