import { default as Player } from "../models/player.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { buildSortQuery, paginate } from "../utils/helpers.js";
import {
  deleteMediaFromCloudinary,
  processPlayerMedia,
  replaceMediaItem,
} from "../utils/mediaUtils.js";
import { sendInternalNotification } from "./notification.controller.js";
import { PRICING } from "../config/constants.js";
import { ensurePendingInvoice } from "../services/invoice.service.js";
import { makeOrderNumber } from "../utils/orderNumber.js";
import Invoice from "../models/invoice.model.js";

// Create Player Profile

/* -------------------------------------------------------
 * Create Player Profile
 * ----------------------------------------------------- */
// Create Player Profile
// Create Player Profile (guaranteed invoice)
export const createPlayer = asyncHandler(async (req, res) => {
  // --- hard guard: must be authenticated ---
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized");
  }
  const userId = req.user._id;

  console.log("[createPlayer] START", { userId: String(userId) });

  // one profile per user
  const exists = await Player.findOne({ user: userId });
  if (exists) throw new ApiError(400, "Player profile already exists");

  // Process media files
  const media = await processPlayerMedia(req.files);

  // Create profile HIDDEN by default
  const player = await Player.create({
    isListed: false, // flips to true after paid
    isActive: false, // optional: keep disabled until paid
    user: userId,
    name: req.body.name,
    age: req.body.age,
    gender: req.body.gender,
    nationality: req.body.nationality,
    jop: req.body.jop,
    position: req.body.position,
    status: req.body.status,
    expreiance: req.body.expreiance,
    monthlySalary: req.body.monthlySalary,
    yearSalary: req.body.yearSalary,
    contractEndDate: req.body.contractEndDate,
    transferredTo: req.body.transferredTo,
    socialLinks: req.body.socialLinks,
    contactInfo: req.body.contactInfo,
    game: req.body.game,
    media,
  });

  console.log("[createPlayer] profile created", {
    playerId: String(player._id),
  });

  // ---- Inline upsert of pending invoice (no external helper dependencies) ----
  const amount = Number(process.env.PRICE_PLAYER_LISTING || 55);

  // 1) Check if a pending already exists for (user, player)
  let invoice = await Invoice.findOne({
    userId,
    product: "player_listing",
    playerProfileId: player._id,
    status: "pending",
  });

  if (invoice) {
    console.log("[createPlayer] reuse pending invoice", {
      invoiceId: String(invoice._id),
    });
  } else {
    // 2) Also check if already paid (rare but prevents duplicates)
    const alreadyPaid = await Invoice.findOne({
      userId,
      product: "player_listing",
      playerProfileId: player._id,
      status: "paid",
    });

    if (alreadyPaid) {
      console.log(
        "[createPlayer] invoice already PAID earlier; no new pending created",
        {
          invoiceId: String(alreadyPaid._id),
        }
      );
    } else {
      // 3) Create brand-new pending invoice
      const orderNumber = makeOrderNumber("player_listing", String(userId));
      try {
        invoice = await Invoice.create({
          orderNumber,
          userId,
          product: "player_listing",
          amount,
          currency: "SAR",
          status: "pending",
          playerProfileId: player._id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        console.log("[createPlayer] NEW pending invoice created", {
          invoiceId: String(invoice._id),
          orderNumber,
          amount,
        });
      } catch (err) {
        console.error(
          "[createPlayer] Invoice.create FAILED",
          err?.message || err
        );
      }
    }
  }

  // --- respond only after invoice step attempt ---
  return res.status(201).json(
    new ApiResponse(
      201,
      {
        player,
        pendingInvoiceId: invoice ? String(invoice._id) : null,
      },
      "Player profile created successfully"
    )
  );
});

// Get All Players (with advanced filtering)
export const getAllPlayers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy,
    search,
    nationality,
    jop,
    status,
    gender,
    ageMin,
    ageMax,
    salaryMin,
    salaryMax,
    isPromoted,
    game,
  } = req.query;

  // Build query
  const query = { isActive: true };

  // Handle search across name (English and Arabic), position, and skills
  if (search) {
    query.$or = [
      { "name.en": { $regex: search, $options: "i" } },
      { "name.ar": { $regex: search, $options: "i" } },
      { position: { $regex: search, $options: "i" } },
      { skills: { $in: [new RegExp(search, "i")] } },
    ];
  }

  // Add filters for nationality, jop, status, gender, and game
  if (nationality) {
    query.nationality = { $regex: nationality, $options: "i" };
  } // Case-insensitive
  if (jop) {
    query.jop = jop;
  }
  if (status) {
    query.status = status;
  }
  if (gender) {
    query.gender = gender;
  }
  if (game) {
    query.game = { $regex: game, $options: "i" };
  } // Case-insensitive for game

  // Handle age range filter
  if (ageMin || ageMax) {
    query.age = {};
    if (ageMin) {
      query.age.$gte = parseInt(ageMin);
    }
    if (ageMax) {
      query.age.$lte = parseInt(ageMax);
    }
  }

  // Handle salary range filter
  if (salaryMin || salaryMax) {
    query["monthlySalary.amount"] = {};
    if (salaryMin) {
      query["monthlySalary.amount"].$gte = parseInt(salaryMin);
    }
    if (salaryMax) {
      query["monthlySalary.amount"].$lte = parseInt(salaryMax);
    }
  }

  // Handle promotion status filter
  if (isPromoted !== undefined) {
    if (isPromoted === "true") {
      query["isPromoted.status"] = true;
      query["isPromoted.endDate"] = { $gt: new Date() };
    } else {
      query.$or = [
        { "isPromoted.status": { $ne: true } },
        { "isPromoted.endDate": { $lte: new Date() } },
        { isPromoted: { $exists: false } },
      ];
    }
  }

  // Pagination
  const { skip, limit: limitNum } = paginate(page, limit);
  let sort = buildSortQuery(sortBy);

  // Default sort: Promoted players first, then by creation date
  if (!sortBy) {
    sort = {
      "isPromoted.status": -1,
      "isPromoted.startDate": -1,
      createdAt: -1,
    };
  }

  try {
    // Execute query
    const [players, total] = await Promise.all([
      Player.find(query)
        .sort(sort)
        .limit(limitNum)
        .skip(skip)
        .populate("user", "name email")
        .lean(),
      Player.countDocuments(query),
    ]);

    // Check if no players are found
    if (!players.length && page === 1) {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            players: [],
            pagination: {
              total: 0,
              pages: 0,
              page: parseInt(page),
              limit: limitNum,
            },
          },
          "No players found for the given criteria"
        )
      );
    }

    res.status(200).json(
      new ApiResponse(
        200,
        {
          players,
          pagination: {
            total,
            pages: Math.ceil(total / limitNum),
            page: parseInt(page),
            limit: limitNum,
          },
        },
        "Players fetched successfully"
      )
    );
  } catch (error) {
    console.error("Error in getAllPlayers:", error);
    res
      .status(500)
      .json(
        new ApiResponse(
          500,
          null,
          "Internal server error while fetching players"
        )
      );
  }
});

// Get Single Player by ID
export const getPlayerById = asyncHandler(async (req, res) => {
  const playerId = req.params.id;

  const player = await Player.findById(playerId).populate(
    "user",
    "name email phone"
  );

  // if (!player || !player.isActive) {
  //   throw new ApiError(404, 'Player not found');
  // }

  // Increment views (only if not the owner)
  if (!req.user || player.user._id.toString() !== req.user._id.toString()) {
    player.views += 1;
    await player.save();
  }

  // Gate contact methods: only owner or active users can see contact info
  let canSeeContacts = false;
  try {
    const isOwner =
      req.user && player.user._id.toString() === req.user._id.toString();
    let requesterIsActive = false;
    if (req.user) {
      const requester = await User.findById(req.user._id).select("isActive");
      requesterIsActive = Boolean(requester?.isActive);
    }
    canSeeContacts = Boolean(isOwner || requesterIsActive);
  } catch {}

  const playerData = player.toObject();
  if (!canSeeContacts && playerData?.user) {
    delete playerData.user.email;
    delete playerData.user.phone;
  }

  res
    .status(200)
    .json(new ApiResponse(200, playerData, "Player fetched successfully"));
});

// Update Player Profile
export const updatePlayer = asyncHandler(async (req, res) => {
  const playerId = req.params.id;
  const userId = req.user._id;
  const userRole = req.user.role;

  const player = await Player.findById(playerId);
  if (!player) throw new ApiError(404, "Player not found");

  // صلاحيات
  if (userRole !== "admin" && String(player.user) !== String(userId)) {
    throw new ApiError(403, "You can only update your own profile");
  }

  // 1) تحديث الحقول النصية (نفس شكل create)
  if (req.body.name !== undefined) player.name = req.body.name;
  if (req.body.age !== undefined) player.age = req.body.age;
  if (req.body.gender !== undefined) player.gender = req.body.gender;
  if (req.body.nationality !== undefined)
    player.nationality = req.body.nationality;
  if (req.body.jop !== undefined) player.jop = req.body.jop;
  if (req.body.position !== undefined) player.position = req.body.position;
  if (req.body.status !== undefined) player.status = req.body.status;
  if (req.body.expreiance !== undefined)
    player.expreiance = req.body.expreiance;
  if (req.body.game !== undefined) player.game = req.body.game;
  if (req.body.views !== undefined) player.views = req.body.views;
  if (req.body.isActive !== undefined) player.isActive = req.body.isActive;

  // تواريخ
  if (req.body.contractEndDate !== undefined) {
    player.contractEndDate =
      req.body.contractEndDate === "" ? null : req.body.contractEndDate;
  }

  // كائنات متداخلة
  if (req.body.monthlySalary) {
    if (!player.monthlySalary) player.monthlySalary = {};
    if (req.body.monthlySalary.amount !== undefined)
      player.monthlySalary.amount = req.body.monthlySalary.amount;
    if (req.body.monthlySalary.currency !== undefined)
      player.monthlySalary.currency = req.body.monthlySalary.currency;
  }

  if (req.body.yearSalary) {
    if (!player.yearSalary) player.yearSalary = {};
    if (req.body.yearSalary.amount !== undefined)
      player.yearSalary.amount = req.body.yearSalary.amount;
    if (req.body.yearSalary.currency !== undefined)
      player.yearSalary.currency = req.body.yearSalary.currency;
  }

  if (req.body.transferredTo) {
    if (!player.transferredTo) player.transferredTo = {};
    if (req.body.transferredTo.club !== undefined)
      player.transferredTo.club = req.body.transferredTo.club;
    if (req.body.transferredTo.date !== undefined)
      player.transferredTo.date =
        req.body.transferredTo.date === "" ? null : req.body.transferredTo.date;
    if (req.body.transferredTo.amount !== undefined)
      player.transferredTo.amount = req.body.transferredTo.amount;
  }

  if (req.body.socialLinks) {
    if (!player.socialLinks) player.socialLinks = {};
    if (req.body.socialLinks.instagram !== undefined)
      player.socialLinks.instagram = req.body.socialLinks.instagram;
    if (req.body.socialLinks.twitter !== undefined)
      player.socialLinks.twitter = req.body.socialLinks.twitter;
    if (req.body.socialLinks.whatsapp !== undefined)
      player.socialLinks.whatsapp = req.body.socialLinks.whatsapp;
    if (req.body.socialLinks.youtube !== undefined)
      player.socialLinks.youtube = req.body.socialLinks.youtube;
  }

  if (req.body.isPromoted) {
    if (!player.isPromoted) player.isPromoted = {};
    if (req.body.isPromoted.status !== undefined)
      player.isPromoted.status = req.body.isPromoted.status;
    if (req.body.isPromoted.startDate !== undefined)
      player.isPromoted.startDate =
        req.body.isPromoted.startDate === ""
          ? null
          : req.body.isPromoted.startDate;
    if (req.body.isPromoted.endDate !== undefined)
      player.isPromoted.endDate =
        req.body.isPromoted.endDate === "" ? null : req.body.isPromoted.endDate;
    if (req.body.isPromoted.type !== undefined)
      player.isPromoted.type = req.body.isPromoted.type;
  }

  if (req.body.contactInfo) {
    if (!player.contactInfo) player.contactInfo = {};
    if (req.body.contactInfo.isHidden !== undefined)
      player.contactInfo.isHidden = req.body.contactInfo.isHidden;
    if (req.body.contactInfo.email !== undefined)
      player.contactInfo.email = req.body.contactInfo.email;
    if (req.body.contactInfo.phone !== undefined)
      player.contactInfo.phone = req.body.contactInfo.phone;

    if (req.body.contactInfo.agent) {
      if (!player.contactInfo.agent) player.contactInfo.agent = {};
      if (req.body.contactInfo.agent.name !== undefined)
        player.contactInfo.agent.name = req.body.contactInfo.agent.name;
      if (req.body.contactInfo.agent.phone !== undefined)
        player.contactInfo.agent.phone = req.body.contactInfo.agent.phone;
      if (req.body.contactInfo.agent.email !== undefined)
        player.contactInfo.agent.email = req.body.contactInfo.agent.email;
    }
  }

  // Process media files if any are provided
  try {
    if (req.files && Object.keys(req.files).length > 0) {
      // If media doesn't exist, initialize it
      if (!player.media) {
        player.media = {
          profileImage: { url: null, publicId: null },
          videos: [],
          documents: [],
        };
      }

      // Use the processPlayerMedia utility to handle media updates
      // This will delete old files when needed and upload new ones
      const updatedMedia = await processPlayerMedia(req.files, player.media);

      // Update player's media object with the processed media
      if (updatedMedia.profileImage) {
        player.media.profileImage = updatedMedia.profileImage;
      }

      // Update single video if provided
      if (updatedMedia.video && updatedMedia.video.url) {
        player.media.video = updatedMedia.video;
      }

      // Update single document if provided
      if (updatedMedia.document && updatedMedia.document.url) {
        player.media.document = updatedMedia.document;
      }
    }
  } catch (error) {
    console.error("Error processing media files:", error);
    throw new ApiError(500, "Failed to process media files");
  }

  // حفظ
  player.updatedAt = new Date();
  await player.save();

  // إشعار (اختياري)
  await sendInternalNotification(
    player.user,
    "Profile Updated",
    "Your player profile has been updated successfully",
    { playerId: player._id }
  );

  res
    .status(200)
    .json(new ApiResponse(200, player, "Player profile updated successfully"));
});

// Delete Player Profile
export const deletePlayer = asyncHandler(async (req, res) => {
  const playerId = req.params.id;
  const userId = req.user._id;
  const userRole = req.user.role;

  try {
    const player = await Player.findById(playerId);

    if (!player) {
      throw new ApiError(404, "Player not found");
    }

    // Check permissions
    if (userRole !== "admin" && player.user.toString() !== userId.toString()) {
      throw new ApiError(403, "You can only delete your own profile");
    }

    // Delete all media files from Cloudinary using our centralized utility
    if (player.media) {
      // Delete profile image
      if (player.media.profileImage?.publicId) {
        await deleteMediaFromCloudinary(
          player.media.profileImage.publicId,
          "image"
        ).catch((err) =>
          console.warn("Failed to delete profile image:", err.message)
        );
      }

      // Delete all images
      if (player.media.images && player.media.images.length > 0) {
        for (const image of player.media.images) {
          if (image.publicId) {
            await deleteMediaFromCloudinary(image.publicId, "image").catch(
              (err) => console.warn("Failed to delete image:", err.message)
            );
          }
        }
      }

      // Delete video
      if (player.media.video && player.media.video.publicId) {
        await deleteMediaFromCloudinary(
          player.media.video.publicId,
          "video"
        ).catch((err) => console.warn("Failed to delete video:", err.message));
      }

      // Delete document
      if (player.media.document && player.media.document.publicId) {
        await deleteMediaFromCloudinary(
          player.media.document.publicId,
          "raw"
        ).catch((err) =>
          console.warn("Failed to delete document:", err.message)
        );
      }
    }

    // Soft delete
    player.isActive = false;
    await player.save();

    // Send notification about profile deletion
    await sendInternalNotification(
      player.user,
      "Profile Deleted",
      "Your player profile has been deleted",
      { playerId: player._id }
    );

    res
      .status(200)
      .json(new ApiResponse(200, null, "Player profile deleted successfully"));
  } catch (error) {
    console.error("Error deleting player profile:", error);
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Failed to delete player profile"
    );
  }
});

// Get My Player Profile
export const getMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const player = await Player.findOne({ user: userId })
    .populate("user", "name email phone")
    .select("+_id");

  if (!player) {
    return res.status(404).json(new ApiResponse(404, null, "Player not found"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, player, "Your profile fetched successfully"));
});

// Upload Profile Image
export const uploadProfileImage = asyncHandler(async (req, res) => {
  const playerId = req.params.id;
  const userId = req.user._id;

  try {
    if (!req.file) {
      throw new ApiError(400, "Profile image is required");
    }

    const player = await Player.findById(playerId);

    if (!player) {
      throw new ApiError(404, "Player not found");
    }

    // Check permissions
    if (player.user.toString() !== userId.toString()) {
      throw new ApiError(403, "You can only update your own profile");
    }

    // Use our centralized media utility to handle image update
    if (!player.media) {
      player.media = {
        profileImage: { url: null, publicId: null },
        videos: [],
        documents: [],
      };
    }

    // Replace existing profile image
    player.media.profileImage = await replaceMediaItem(
      req.file,
      player.media.profileImage,
      "image"
    );

    await player.save();

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          player.media.profileImage,
          "Profile image uploaded successfully"
        )
      );
  } catch (error) {
    console.error("Error uploading profile image:", error);
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Failed to upload profile image"
    );
  }
});

// Upload Media (Video or Document)
export const uploadMedia = asyncHandler(async (req, res) => {
  const playerId = req.params.id;
  const userId = req.user._id;
  const { mediaType } = req.params; // video or document

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "Media file is required");
  }

  if (!["video", "document"].includes(mediaType)) {
    throw new ApiError(400, "Invalid media type");
  }

  const player = await Player.findById(playerId);

  if (!player) {
    throw new ApiError(404, "Player not found");
  }

  // Check permissions
  if (player.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only update your own profile");
  }

  // We'll only use the first file even if multiple files are uploaded
  const file = req.files[0];

  // Delete the existing file if it exists
  if (player.media[mediaType]?.publicId) {
    const resourceType = mediaType === "video" ? "video" : "raw";
    await deleteMediaFromCloudinary(
      player.media[mediaType].publicId,
      resourceType
    ).catch((err) =>
      console.warn(`Failed to delete old ${mediaType}:`, err.message)
    );
  }

  // Create the new media item
  const mediaItem = {
    url: file.path,
    publicId: file.filename,
    title: file.originalname,
    uploadedAt: new Date(),
  };

  if (mediaType === "video") {
    mediaItem.duration = 0; // Placeholder
  }

  if (mediaType === "document") {
    mediaItem.size = file.size;
    mediaItem.type = file.mimetype;
  }

  // Replace the existing media item
  player.media[mediaType] = mediaItem;
  await player.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, mediaItem, `${mediaType} uploaded successfully`)
    );
});

// Delete Media
export const deleteMedia = asyncHandler(async (req, res) => {
  const { playerId, mediaType } = req.params;
  const userId = req.user._id;

  if (!["video", "document"].includes(mediaType)) {
    throw new ApiError(400, "Invalid media type");
  }

  const player = await Player.findById(playerId);

  if (!player) {
    throw new ApiError(404, "Player not found");
  }

  // Check permissions
  if (player.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only update your own profile");
  }

  if (!player.media[mediaType] || !player.media[mediaType].publicId) {
    throw new ApiError(404, `No ${mediaType} found to delete`);
  }

  // Delete from Cloudinary
  const resourceType = mediaType === "video" ? "video" : "raw";
  if (player.media[mediaType].publicId) {
    await deleteMediaFromCloudinary(
      player.media[mediaType].publicId,
      resourceType
    ).catch((err) =>
      console.warn(`Failed to delete ${mediaType}:`, err.message)
    );
  }

  // Reset the media item
  player.media[mediaType] = {
    url: null,
    publicId: null,
    title: null,
    ...(mediaType === "video" ? { duration: 0 } : { type: null, size: 0 }),
    uploadedAt: null,
  };

  await player.save();

  res
    .status(200)
    .json(new ApiResponse(200, null, `${mediaType} deleted successfully`));
});

// Promote Player
export const promotePlayer = asyncHandler(async (req, res) => {
  const playerId = req.params.id;
  const userId = req.user._id;
  const { days, type = "featured" } = req.body;

  if (!days || days < 1) {
    throw new ApiError(
      400,
      "Please specify valid number of days for promotion"
    );
  }

  const player = await Player.findById(playerId);

  if (!player) {
    throw new ApiError(404, "Player not found");
  }

  // Check permissions
  if (player.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only promote your own profile");
  }

  if (player.isCurrentlyPromoted) {
    throw new ApiError(400, "Player is already promoted");
  }

  // Promote player (assuming this method exists in the model)
  if (player.promote) {
    await player.promote(days, type);
  } else {
    // Manual promotion logic
    player.isPromoted = {
      status: true,
      type,
      startDate: new Date(),
      endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    };
    await player.save();
  }

  // Send notification about promotion
  await sendInternalNotification(
    userId,
    "Profile Promoted",
    `Your player profile has been promoted for ${days} days!`,
    { playerId: player._id, days, type }
  );

  res
    .status(200)
    .json(new ApiResponse(200, player, "Player promoted successfully"));
});

// Transfer Player
export const transferPlayer = asyncHandler(async (req, res) => {
  const playerId = req.params.id;
  const { clubName, amount, transferDate } = req.body;

  if (!clubName || !amount) {
    throw new ApiError(400, "Club name and transfer amount are required");
  }

  const player = await Player.findById(playerId);

  if (!player) {
    throw new ApiError(404, "Player not found");
  }

  if (player.status === "transferred") {
    throw new ApiError(400, "Player is already transferred");
  }

  // Transfer player (assuming this method exists in the model)
  if (player.transfer) {
    await player.transfer(clubName, amount);
  } else {
    // Manual transfer logic
    player.status = "transferred";
    player.transferHistory.push({
      clubName,
      amount,
      transferDate: transferDate || new Date(),
      type: "transfer",
    });
    await player.save();
  }

  // Send notification about transfer
  await sendInternalNotification(
    player.user,
    "Player Transferred",
    `Congratulations! You have been transferred to ${clubName}`,
    { playerId: player._id, clubName, amount }
  );

  res
    .status(200)
    .json(new ApiResponse(200, player, "Player transferred successfully"));
});

// Update Player Statistics
export const updateStatistics = asyncHandler(async (req, res) => {
  const playerId = req.params.id;
  const userId = req.user._id;
  const statistics = req.body;

  const player = await Player.findById(playerId);

  if (!player) {
    throw new ApiError(404, "Player not found");
  }

  // Check permissions
  if (
    player.user.toString() !== userId.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "You can only update your own statistics");
  }

  // Update statistics
  if (player.statistics) {
    Object.assign(player.statistics, statistics);
  } else {
    player.statistics = statistics;
  }

  await player.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        player.statistics,
        "Player statistics updated successfully"
      )
    );
});

// Get Promoted Players
export const getPromotedPlayers = asyncHandler(async (req, res) => {
  const { type, limit = 20 } = req.query;

  const query = {
    isActive: true,
    "isPromoted.status": true,
    "isPromoted.endDate": { $gt: new Date() },
  };

  if (type) {
    query["isPromoted.type"] = type;
  }

  const players = await Player.find(query)
    .sort({ "isPromoted.startDate": -1 })
    .limit(parseInt(limit))
    .populate("user", "name email")
    .lean();

  res
    .status(200)
    .json(
      new ApiResponse(200, players, "Promoted players fetched successfully")
    );
});

// Search Players (Advanced search)
export const searchPlayers = asyncHandler(async (req, res) => {
  const {
    q: search,
    position,
    nationality,
    ageMin,
    ageMax,
    salaryMin,
    salaryMax,
    skills,
    page = 1,
    limit = 10,
    sortBy = "relevance",
  } = req.query;

  if (!search) {
    throw new ApiError(400, "Search query is required");
  }

  // Build search query
  const query = {
    isActive: true,
    $or: [
      { "name.en": { $regex: search, $options: "i" } },
      { "name.ar": { $regex: search, $options: "i" } },
      { position: { $regex: search, $options: "i" } },
      { skills: { $in: [new RegExp(search, "i")] } },
      { previousClubs: { $in: [new RegExp(search, "i")] } },
    ],
  };

  // Apply additional filters
  if (position) {
    query.position = position;
  }
  if (nationality) {
    query.nationality = nationality;
  }

  if (ageMin || ageMax) {
    query.age = {};
    if (ageMin) {
      query.age.$gte = parseInt(ageMin);
    }
    if (ageMax) {
      query.age.$lte = parseInt(ageMax);
    }
  }

  if (salaryMin || salaryMax) {
    query["monthlySalary.amount"] = {};
    if (salaryMin) {
      query["monthlySalary.amount"].$gte = parseInt(salaryMin);
    }
    if (salaryMax) {
      query["monthlySalary.amount"].$lte = parseInt(salaryMax);
    }
  }

  if (skills) {
    const skillsArray = skills.split(",").map((skill) => skill.trim());
    query.skills = { $in: skillsArray };
  }

  // Pagination
  const { skip } = paginate(page, limit);

  // Sort options
  let sort = { score: { $meta: "textScore" } };
  if (sortBy === "date") {
    sort = { createdAt: -1 };
  }
  if (sortBy === "salary") {
    sort = { "monthlySalary.amount": -1 };
  }
  if (sortBy === "age") {
    sort = { age: 1 };
  }
  if (sortBy === "views") {
    sort = { views: -1 };
  }

  // Execute search
  const [players, total] = await Promise.all([
    Player.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .populate("user", "name email")
      .lean(),
    Player.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        players,
        searchQuery: search,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page: parseInt(page),
          limit: parseInt(limit),
        },
      },
      `Found ${total} players matching your search`
    )
  );
});

// Get Player Analytics (for player owner or admin)
export const getPlayerAnalytics = asyncHandler(async (req, res) => {
  const playerId = req.params.id;
  const userId = req.user._id;

  const player = await Player.findById(playerId);

  if (!player) {
    throw new ApiError(404, "Player not found");
  }

  // Check permissions
  if (
    player.user.toString() !== userId.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "You can only view analytics for your own profile");
  }

  // Calculate analytics
  const analytics = {
    totalViews: player.views || 0,
    profileCompleteness: calculateProfileCompleteness(player),
    promotionHistory: player.promotionHistory || [],
    transferValue: player.monthlySalary?.amount || 0,
    skills: player.skills || [],
    statisticsOverview: player.statistics || {},
    mediaCount: {
      video: player.media?.video?.url ? 1 : 0,
      document: player.media?.document?.url ? 1 : 0,
    },
    joinDate: player.createdAt,
    lastUpdate: player.updatedAt,
  };

  res
    .status(200)
    .json(
      new ApiResponse(200, analytics, "Player analytics fetched successfully")
    );
});

// Get Similar Players
export const getSimilarPlayers = asyncHandler(async (req, res) => {
  const playerId = req.params.id;
  const { limit = 5 } = req.query;

  const currentPlayer = await Player.findById(playerId);
  if (!currentPlayer) {
    throw new ApiError(404, "Player not found");
  }

  const query = {
    _id: { $ne: playerId },
    isActive: true,
    $or: [
      { position: currentPlayer.position },
      { nationality: currentPlayer.nationality },
      { skills: { $in: currentPlayer.skills || [] } },
      { jop: currentPlayer.jop },
    ],
  };

  // Add salary range filter
  if (currentPlayer.monthlySalary?.amount) {
    const salaryRange = currentPlayer.monthlySalary.amount * 0.3; // 30% range
    query["monthlySalary.amount"] = {
      $gte: currentPlayer.monthlySalary.amount - salaryRange,
      $lte: currentPlayer.monthlySalary.amount + salaryRange,
    };
  }

  const similarPlayers = await Player.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .populate("user", "name email")
    .lean();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        similarPlayers,
        "Similar players fetched successfully"
      )
    );
});

// Get Players by Position
export const getPlayersByPosition = asyncHandler(async (req, res) => {
  const { position } = req.params;
  const { limit = 10, page = 1 } = req.query;

  const query = {
    isActive: true,
    position: { $regex: position, $options: "i" },
  };

  const { skip } = paginate(page, limit);

  const [players, total] = await Promise.all([
    Player.find(query)
      .sort({ "isPromoted.status": -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate("user", "name email")
      .lean(),
    Player.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        players,
        position,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page: parseInt(page),
          limit: parseInt(limit),
        },
      },
      `Players in ${position} position fetched successfully`
    )
  );
});

// Get Featured Players
export const getFeaturedPlayers = asyncHandler(async (req, res) => {
  const { limit = 6 } = req.query;

  const query = {
    isActive: true,
    "isPromoted.status": true,
    "isPromoted.endDate": { $gt: new Date() },
  };

  const players = await Player.find(query)
    .sort({ "isPromoted.startDate": -1, views: -1 })
    .limit(parseInt(limit))
    .populate("user", "name email")
    .lean();

  res
    .status(200)
    .json(
      new ApiResponse(200, players, "Featured players fetched successfully")
    );
});

// Helper function to calculate profile completeness
const calculateProfileCompleteness = (player) => {
  let completedFields = 0;
  const totalFields = 20; // Adjust based on your player model

  // Check required fields
  if (player.name?.en) {
    completedFields++;
  }
  if (player.position) {
    completedFields++;
  }
  if (player.age) {
    completedFields++;
  }
  if (player.nationality) {
    completedFields++;
  }
  if (player.height) {
    completedFields++;
  }
  if (player.weight) {
    completedFields++;
  }
  if (player.preferredFoot) {
    completedFields++;
  }
  if (player.monthlySalary?.amount) {
    completedFields++;
  }
  if (player.media?.profileImage?.url) {
    completedFields++;
  }
  if (player.skills?.length > 0) {
    completedFields++;
  }
  if (player.previousClubs?.length > 0) {
    completedFields++;
  }
  if (player.achievements?.length > 0) {
    completedFields++;
  }
  if (player.languages?.length > 0) {
    completedFields++;
  }
  if (player.bio?.en) {
    completedFields++;
  }
  if (player.contactInfo?.phone) {
    completedFields++;
  }
  if (player.contactInfo?.email) {
    completedFields++;
  }
  if (player.media?.video?.url) {
    completedFields++;
  }
  if (player.media?.document?.url) {
    completedFields++;
  }
  if (player.statistics) {
    completedFields++;
  }
  if (player.jop) {
    completedFields++;
  }

  return Math.round((completedFields / totalFields) * 100);
};

export const deletePlayerProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const player = await Player.findOne({ user: userId });

  if (!player) {
    throw new ApiError(404, "Player not found");
  }

  if (userId !== player.user.toString()) {
    throw new ApiError(403, "You can only delete your own profile");
  }

  try {
    // Delete all media files from Cloudinary first
    if (player.media) {
      // Delete profile image
      if (player.media.profileImage?.publicId) {
        await deleteMediaFromCloudinary(
          player.media.profileImage.publicId,
          "image"
        ).catch((err) =>
          console.warn("Failed to delete profile image:", err.message)
        );
      }

      // Delete video
      if (player.media.video && player.media.video.publicId) {
        await deleteMediaFromCloudinary(
          player.media.video.publicId,
          "video"
        ).catch((err) => console.warn("Failed to delete video:", err.message));
      }

      // Delete document
      if (player.media.document && player.media.document.publicId) {
        await deleteMediaFromCloudinary(
          player.media.document.publicId,
          "raw"
        ).catch((err) =>
          console.warn("Failed to delete document:", err.message)
        );
      }

      // Delete any legacy images if they exist
      if (player.media.images && player.media.images.length > 0) {
        for (const image of player.media.images) {
          if (image.publicId) {
            await deleteMediaFromCloudinary(image.publicId, "image").catch(
              (err) => console.warn("Failed to delete image:", err.message)
            );
          }
        }
      }
    }

    // Finally, remove player from the database completely
    await Player.findByIdAndDelete(player._id);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "Player profile and all related media permanently deleted"
        )
      );
  } catch (error) {
    console.error("Error completely deleting player profile:", error);
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Failed to delete player profile completely"
    );
  }
});
