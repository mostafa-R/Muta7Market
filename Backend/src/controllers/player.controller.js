import Invoice from "../models/invoice.model.js";
import { default as Player } from "../models/player.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { buildSortQuery, paginate } from "../utils/helpers.js";
import {
  deleteAllPlayerMedia,
  deleteMediaFromLocal,
  handleMediaUpload,
  processPlayerMedia,
  replaceMediaItem,
} from "../utils/localMediaUtils.js";
import { safelyUpdatePlayerMedia } from "../utils/mediaSimple.js";
import { makeOrderNumber } from "../utils/orderNumber.js";
import { getPricingSettings, computePromotionAmount } from "../utils/pricingUtils.js";
import { paylinkCreateInvoice } from "../services/paylink.client.js";
import { search } from "../services/search.service.js";
import { recordProfileChanges } from "../services/profileChange.service.js";
import { sendInternalNotification } from "./notification.controller.js";

const STAFF_ROLES = ["admin", "super_admin"];

const canManagePlayer = (user, player) => {
  const userId = String(user?._id || user?.id || "");
  if (!userId) return false;
  if (STAFF_ROLES.includes(user?.role)) return true;
  if (String(player?.user) === userId) return true;
  if (
    user?.role === "agent" &&
    player?.agentUser &&
    String(player.agentUser) === userId
  ) {
    return true;
  }
  return false;
};

export const createPlayer = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const exists = await Player.findOne({ user: userId });
    if (exists) throw new ApiError(400, "Player profile already exists");

    let media;
    try {
      media = await processPlayerMedia(req.files, req);
    } catch (mediaError) {
      console.error("Media processing error:", mediaError.message);
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            `Failed to process media: ${mediaError.message}`
          )
        );
    }

    const player = await Player.create({
      isListed: false,
      isActive: false,
      user: userId,

      name: req.body.name,
      age: req.body.age,
      gender: req.body.gender,
      nationality: req.body.nationality,
      customNationality: req.body.customNationality,
      birthCountry: req.body.birthCountry,
      customBirthCountry: req.body.customBirthCountry,
      jop: req.body.jop,
      job: req.body.job || req.body.jop,
      roleType: req.body.roleType,
      customRoleType: req.body.customRoleType,
      position: req.body.position,
      customPosition: req.body.customPosition,
      status: req.body.status,
      experience: req.body.experience,
      monthlySalary: req.body.monthlySalary,
      yearSalary: req.body.yearSalary,
      contractEndDate: req.body.contractEndDate,
      transferredTo: req.body.transferredTo,
      socialLinks: req.body.socialLinks,
      contactInfo: req.body.contactInfo,
      game: req.body.game,
      customSport: req.body.customSport,
      media,
    });

    try {
      const raw = String(req.body.job || req.body.jop || player.job || player.jop || "").toLowerCase();
      const targetType = raw === "coach" ? "coach" : "player";
      const pricing = await getPricingSettings();

      const amount =
        targetType === "coach"
          ? pricing.listing_price.coach || pricing.listing_year.coach
          : pricing.listing_price.player || pricing.listing_year.player;

      const orderNo = makeOrderNumber("listing", String(req.user._id));

      await Invoice.findOneAndUpdate(
        {
          userId: req.user._id,
          product: "listing",
          targetType,
          playerProfileId: player._id,
          status: "pending",
        },
        {
          $setOnInsert: {
            orderNumber: orderNo,
            invoiceNumber: orderNo,
            amount,
            currency: "SAR",
            durationDays:
              targetType === "coach"
                ? pricing.listing_days.coach || pricing.ONE_YEAR_DAYS
                : pricing.listing_days.player || pricing.ONE_YEAR_DAYS,
            featureType: null,
            status: "pending",
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        },
        { upsert: true }
      );
    } catch (e) {
      console.error("[createPlayer] seed listing draft failed", e);
    }

    res
      .status(201)
      .json(
        new ApiResponse(201, player, "Player profile created successfully")
      );
  } catch (error) {
    console.error("Error creating player profile:", error);
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Failed to create player profile"
    );
  }
});

export const getAllPlayers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
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
    position,
    roleType,
    heightMin,
    heightMax,
    weightMin,
    weightMax,
    preferredFoot,
    contractStatus,
    physicalCondition,
  } = req.query;

  const now = new Date();

  const and = [{ isActive: true }, { isConfirmed: true }];

  if (search) {
    if (String(search).length > 100) {
      throw new ApiError(400, "Search query is too long");
    }
    and.push({
      $or: [
        { "name.en": { $regex: search, $options: "i" } },
        { "name.ar": { $regex: search, $options: "i" } },
        { position: { $regex: search, $options: "i" } },
        { skills: { $in: [new RegExp(search, "i")] } },
      ],
    });
  }

  if (nationality)
    and.push({ nationality: { $regex: nationality, $options: "i" } });
  const jobFilter = jop || req.query.job;
  if (jobFilter) and.push({ job: jobFilter });
  if (status) and.push({ status });
  if (gender) and.push({ gender });
  if (position) and.push({ position: { $regex: position, $options: "i" } });
  if (roleType) and.push({ roleType: { $regex: roleType, $options: "i" } });
  if (preferredFoot)
    and.push({ preferredFoot: { $regex: preferredFoot, $options: "i" } });
  if (contractStatus) and.push({ contractStatus });
  if (physicalCondition) and.push({ physicalCondition });
  if (game) {
    and.push({
      $or: [
        { game: { $regex: game, $options: "i" } },
        { "game.ar": { $regex: game, $options: "i" } },
        { "game.en": { $regex: game, $options: "i" } },
        { "game.slug": { $regex: game, $options: "i" } },
      ],
    });
  }

  if (ageMin || ageMax) {
    const age = {};
    if (ageMin) age.$gte = parseInt(ageMin);
    if (ageMax) age.$lte = parseInt(ageMax);
    and.push({ age });
  }

  if (heightMin || heightMax) {
    const height = {};
    if (heightMin) height.$gte = parseInt(heightMin);
    if (heightMax) height.$lte = parseInt(heightMax);
    and.push({ height });
  }

  if (weightMin || weightMax) {
    const weight = {};
    if (weightMin) weight.$gte = parseInt(weightMin);
    if (weightMax) weight.$lte = parseInt(weightMax);
    and.push({ weight });
  }

  if (salaryMin || salaryMax) {
    const sal = {};
    if (salaryMin) sal.$gte = parseInt(salaryMin);
    if (salaryMax) sal.$lte = parseInt(salaryMax);
    and.push({ "monthlySalary.amount": sal });
  }

  if (typeof isPromoted !== "undefined") {
    if (isPromoted === "true") {
      and.push({ "isPromoted.status": true });
      and.push({ "isPromoted.endDate": { $gt: now } });
    } else if (isPromoted === "false") {
      and.push({
        $or: [
          { "isPromoted.status": { $ne: true } },
          { "isPromoted.endDate": { $lte: now } },
          { isPromoted: { $exists: false } },
        ],
      });
    }
  }

  const query = and.length ? { $and: and } : {};

  const { skip, limit: limitNum } = paginate(page, limit);
  let sort = buildSortQuery(sortBy);
  if (!sortBy) {
    sort = {
      "isPromoted.status": -1,
      createdAt: -1,
    };
  }

  try {
    const [players, total] = await Promise.all([
      Player.find(query)
        .sort(sort)
        .limit(limitNum)
        .skip(skip)
        .populate("user", "name email"),
      Player.countDocuments(query),
    ]);

    if (!players.length && Number(page) === 1) {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            players: [],
            pagination: {
              total: 0,
              pages: 0,
              page: Number(page),
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
            page: Number(page),
            limit: limitNum,
          },
        },
        "Players fetched successfully"
      )
    );
  } catch (error) {
    console.error(error);
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

export const getPlayerById = asyncHandler(async (req, res) => {
  const playerId = req.params.id;

  const player = await Player.findById(playerId).populate(
    "user",
    "name email phone"
  );

  if (!req.user || player.user._id.toString() !== req.user._id.toString()) {
    player.views += 1;
    await player.save();
  }

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

  const playerData = player.toJSON();
  if (!canSeeContacts && playerData?.user) {
    delete playerData.user.email;
    delete playerData.user.phone;
  }

  res
    .status(200)
    .json(new ApiResponse(200, playerData, "Player fetched successfully"));
});

export const updatePlayer = asyncHandler(async (req, res) => {
  const playerId = req.params.id;
  const userId = req.user._id;
  const userRole = req.user.role;

  const player = await Player.findById(playerId);
  if (!player) throw new ApiError(404, "Player not found");

  if (!canManagePlayer(req.user, player)) {
    throw new ApiError(403, "You can only update your own profile");
  }

  const beforeSnapshot = player.toObject();

  if (req.body.name !== undefined) player.name = req.body.name;
  if (req.body.age !== undefined) player.age = req.body.age;
  if (req.body.gender !== undefined) player.gender = req.body.gender;
  if (req.body.nationality !== undefined)
    player.nationality = req.body.nationality;
  if (req.body.customNationality !== undefined)
    player.customNationality = req.body.customNationality;
  if (req.body.birthCountry !== undefined)
    player.birthCountry = req.body.birthCountry;
  if (req.body.customBirthCountry !== undefined)
    player.customBirthCountry = req.body.customBirthCountry;
  if (req.body.jop !== undefined) player.jop = req.body.jop;
  if (req.body.job !== undefined) player.job = req.body.job;
  if (req.body.roleType !== undefined) {
    try {
      if (
        typeof req.body.roleType === "string" &&
        req.body.roleType.startsWith("{")
      ) {
        player.roleType = JSON.parse(req.body.roleType);
      } else {
        player.roleType = req.body.roleType;
      }
    } catch (error) {
      console.error("Error parsing roleType field:", error);
      player.roleType = req.body.roleType;
    }
  }
  if (req.body.customRoleType !== undefined)
    player.customRoleType = req.body.customRoleType;
  if (req.body.position !== undefined) {
    try {
      if (
        typeof req.body.position === "string" &&
        req.body.position.startsWith("{")
      ) {
        player.position = JSON.parse(req.body.position);
      } else {
        player.position = req.body.position;
      }
    } catch (error) {
      console.error("Error parsing position field:", error);
      player.position = req.body.position;
    }
  }
  if (req.body.customPosition !== undefined)
    player.customPosition = req.body.customPosition;
  if (req.body.status !== undefined) player.status = req.body.status;
  if (req.body.experience !== undefined)
    player.experience = req.body.experience;
  if (req.body.game !== undefined) {
    try {
      if (typeof req.body.game === "string" && req.body.game.startsWith("{")) {
        player.game = JSON.parse(req.body.game);
      } else {
        player.game = req.body.game;
      }
    } catch (error) {
      console.error("Error parsing game field:", error);
      player.game = req.body.game;
    }
  }
  if (req.body.customSport !== undefined)
    player.customSport = req.body.customSport;
  const isStaff = ["admin", "super_admin"].includes(userRole);
  if (req.body.views !== undefined && isStaff) player.views = req.body.views;
  if (req.body.isActive !== undefined && isStaff)
    player.isActive = req.body.isActive;

  if (req.body.height !== undefined) player.height = req.body.height;
  if (req.body.weight !== undefined) player.weight = req.body.weight;
  if (req.body.preferredFoot !== undefined)
    player.preferredFoot = req.body.preferredFoot;
  if (req.body.physicalCondition !== undefined)
    player.physicalCondition = req.body.physicalCondition;
  if (req.body.contractStatus !== undefined)
    player.contractStatus = req.body.contractStatus;
  if (Array.isArray(req.body.careerHistory)) {
    player.careerHistory = req.body.careerHistory;
  }

  if (req.body.contractEndDate !== undefined) {
    player.contractEndDate =
      req.body.contractEndDate === "" ? null : req.body.contractEndDate;
  }

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
    if (req.body.transferredTo.startDate !== undefined)
      player.transferredTo.startDate =
        req.body.transferredTo.startDate === ""
          ? null
          : req.body.transferredTo.startDate;
    if (req.body.transferredTo.endDate !== undefined)
      player.transferredTo.endDate =
        req.body.transferredTo.endDate === ""
          ? null
          : req.body.transferredTo.endDate;
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

  if (req.body.isPromoted && isStaff) {
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

  let mediaUpdateResults = {
    updated: [],
    deleted: [],
    errors: [],
  };

  try {
    const updatedMedia = await safelyUpdatePlayerMedia(req.files, player, null);

    const oldMedia = player.media
      ? player.media.toObject
        ? player.media.toObject()
        : { ...player.media }
      : null;

    player.media = updatedMedia;

    if (req.files?.profileImage && player.media?.profileImage?.url) {
      if (oldMedia?.profileImage?.publicId) {
        mediaUpdateResults.deleted.push({
          type: "profile image",
          publicId: oldMedia.profileImage.publicId,
        });
      }
      mediaUpdateResults.updated.push({
        type: "profile image",
        publicId: player.media.profileImage.publicId,
      });
    }

    if (req.files?.playerVideo && player.media?.video?.url) {
      if (oldMedia?.video?.publicId) {
        mediaUpdateResults.deleted.push({
          type: "video",
          publicId: oldMedia.video.publicId,
        });
      }
      mediaUpdateResults.updated.push({
        type: "video",
        publicId: player.media.video.publicId,
      });
    }

    if (req.files?.document && player.media?.document?.url) {
      if (oldMedia?.document?.publicId) {
        mediaUpdateResults.deleted.push({
          type: "document",
          publicId: oldMedia.document.publicId,
        });
      }
      mediaUpdateResults.updated.push({
        type: "document",
        publicId: player.media.document.publicId,
      });
    }

    if (req.files?.images && player.media?.images?.length > 0) {
      if (oldMedia?.images && Array.isArray(oldMedia.images)) {
        oldMedia.images.forEach((img, index) => {
          if (img?.publicId) {
            mediaUpdateResults.deleted.push({
              type: `gallery image ${index + 1}`,
              publicId: img.publicId,
            });
          }
        });
      }

      player.media.images.forEach((img, index) => {
        if (img?.publicId) {
          mediaUpdateResults.updated.push({
            type: `gallery image ${index + 1}`,
            publicId: img.publicId,
          });
        }
      });
    }
  } catch (error) {
    console.error("Error processing media files:", error);
    mediaUpdateResults.errors.push({
      type: "media processing",
      error: error.message,
    });
    throw new ApiError(500, "Failed to process media files: " + error.message);
  }

  player.updatedAt = new Date();
  await player.save();

  await recordProfileChanges({
    profileType: "player",
    before: beforeSnapshot,
    after: player,
    changedBy: req.user._id,
    changedByRole: req.user.role,
  });

  await sendInternalNotification(
    player.user,
    "Profile Updated",
    "Your player profile has been updated successfully",
    { playerId: player._id }
  );

  let responseMessage = "Player profile updated successfully";
  let responseData = {
    player,
    mediaUpdates: null,
  };

  if (
    mediaUpdateResults.updated.length > 0 ||
    mediaUpdateResults.deleted.length > 0 ||
    mediaUpdateResults.errors.length > 0
  ) {
    responseData.mediaUpdates = {
      updated: mediaUpdateResults.updated,
      deleted: mediaUpdateResults.deleted,
      errors: mediaUpdateResults.errors,
      summary: {
        totalUpdated: mediaUpdateResults.updated.length,
        totalDeleted: mediaUpdateResults.deleted.length,
        totalErrors: mediaUpdateResults.errors.length,
      },
    };

    if (mediaUpdateResults.updated.length > 0) {
      responseMessage += `. ${mediaUpdateResults.updated.length} media file(s) updated`;
    }

    if (mediaUpdateResults.deleted.length > 0) {
      responseMessage += `. ${mediaUpdateResults.deleted.length} old media file(s) removed from cloud storage`;
    }

    if (mediaUpdateResults.errors.length > 0) {
      responseMessage += `. ${mediaUpdateResults.errors.length} media error(s) occurred`;
    }
  }

  res.status(200).json(new ApiResponse(200, responseData, responseMessage));
});

export const deletePlayerDocument = async (req, res) => {
  try {
    const { id: playerId } = req.params;

    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player not found",
      });
    }

    if (!canManagePlayer(req.user, player)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete document from your own profile",
      });
    }

    if (player.media?.document?.publicId) {
      try {
        await deleteMediaFromLocal(player.media.document.publicId, "auto");
        console.log(
          `ðŸ—‘ï¸ Deleted document from player ${playerId}: ${player.media.document.publicId}`
        );
      } catch (error) {
        console.warn(
          "Failed to delete document from local storage:",
          error.message
        );
      }

      player.media.document = {
        url: null,
        publicId: null,
        title: null,
        type: null,
        size: 0,
        uploadedAt: null,
      };
      await player.save();

      res.json({
        success: true,
        message: "Document deleted successfully",
        data: { player },
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No document found in player profile",
      });
    }
  } catch (error) {
    console.error("Error deleting player document:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting document",
      error: error.message,
    });
  }
};

export const deletePlayerVideo = async (req, res) => {
  try {
    const { id: playerId } = req.params;

    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player not found",
      });
    }

    if (!canManagePlayer(req.user, player)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete video from your own profile",
      });
    }

    if (player.media?.video?.publicId) {
      try {
        await deleteMediaFromLocal(player.media.video.publicId, "video");
        console.log(
          `ðŸ—‘ï¸ Deleted video from player ${playerId}: ${player.media.video.publicId}`
        );
      } catch (error) {
        console.warn("Failed to delete video from local storage:", error.message);
      }

      player.media.video = {
        url: null,
        publicId: null,
        title: null,
        duration: 0,
        uploadedAt: null,
      };
      await player.save();

      res.json({
        success: true,
        message: "Video deleted successfully",
        data: { player },
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No video found in player profile",
      });
    }
  } catch (error) {
    console.error("Error deleting player video:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting video",
      error: error.message,
    });
  }
};

export const deletePlayerImages = async (req, res) => {
  try {
    const { id: playerId } = req.params;
    const { publicIds } = req.body;

    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide publicIds array of images to delete",
      });
    }

    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player not found",
      });
    }

    if (!canManagePlayer(req.user, player)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete images from your own profile",
      });
    }

    const deleteResults = [];

    if (player.media?.images && Array.isArray(player.media.images)) {
      const imagesToKeep = player.media.images.filter((image) => {
        const shouldDelete = publicIds.includes(image.publicId);
        if (shouldDelete) {
          deleteResults.push({
            publicId: image.publicId,
            title: image.title,
            status: "marked_for_deletion",
          });
        }
        return !shouldDelete;
      });

      for (const publicId of publicIds) {
        try {
          await deleteMediaFromLocal(publicId, "image");
          const result = deleteResults.find((r) => r.publicId === publicId);
          if (result) result.status = "deleted_successfully";
        } catch (error) {
          const result = deleteResults.find((r) => r.publicId === publicId);
          if (result) {
            result.status = "deletion_failed";
            result.error = error.message;
          }
        }
      }

      player.media.images = imagesToKeep;
      await player.save();

      console.log(
        `ðŸ—‘ï¸ Deleted ${publicIds.length} images from player ${playerId}`
      );

      res.json({
        success: true,
        message: `Successfully processed ${publicIds.length} image deletions`,
        data: {
          deleteResults,
          remainingImagesCount: imagesToKeep.length,
          player: player,
        },
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No images found in player profile",
      });
    }
  } catch (error) {
    console.error("Error deleting player images:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting images",
      error: error.message,
    });
  }
};

export const deletePlayer = asyncHandler(async (req, res) => {
  const playerId = req.params.id;
  const userId = req.user._id;
  const userRole = req.user.role;

  try {
    const player = await Player.findById(playerId);

    if (!player) {
      throw new ApiError(404, "Player not found");
    }

    if (userRole !== "admin" && player.user.toString() !== userId.toString()) {
      throw new ApiError(403, "You can only delete your own profile");
    }

    if (player.media) {
      if (player.media.profileImage?.publicId) {
        await deleteMediaFromLocal(
          player.media.profileImage.publicId,
          "image"
        ).catch((err) =>
          console.warn("Failed to delete profile image:", err.message)
        );
      }

      if (player.media.images && player.media.images.length > 0) {
        for (const image of player.media.images) {
          if (image.publicId) {
            await deleteMediaFromLocal(image.publicId, "image").catch(
              (err) => console.warn("Failed to delete image:", err.message)
            );
          }
        }
      }

      if (player.media.video && player.media.video.publicId) {
        await deleteMediaFromLocal(
          player.media.video.publicId,
          "video"
        ).catch((err) => console.warn("Failed to delete video:", err.message));
      }

      if (player.media.document && player.media.document.publicId) {
        await deleteMediaFromLocal(
          player.media.document.publicId,
          "auto"
        ).catch((err) =>
          console.warn("Failed to delete document:", err.message)
        );
      }
    }

    player.isActive = false;
    await player.save();

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

    if (!canManagePlayer(req.user, player)) {
      throw new ApiError(403, "You can only update your own profile");
    }

    if (!player.media) {
      player.media = {
        profileImage: { url: null, publicId: null },
        videos: [],
        documents: [],
      };
    }

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

export const uploadMedia = asyncHandler(async (req, res) => {
  const playerId = req.params.id;
  const userId = req.user._id;
  const { mediaType } = req.params;

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "Media file is required");
  }

  if (!["video", "videos", "document"].includes(mediaType)) {
    throw new ApiError(400, "Invalid media type");
  }

  const player = await Player.findById(playerId);

  if (!player) {
    throw new ApiError(404, "Player not found");
  }

  if (!canManagePlayer(req.user, player)) {
    throw new ApiError(403, "You can only update your own profile");
  }

  if (mediaType === "videos") {
    const isProPlayer =
      Boolean(player.isPro) &&
      (!player.proExpiresAt || new Date(player.proExpiresAt) > new Date());
    const videoLimit = Math.max(1, Number(process.env.PLAYER_VIDEO_LIMIT || 5));
    const current = Array.isArray(player.media.videos) ? player.media.videos.length : 0;
    const remaining = isProPlayer ? req.files.length : videoLimit - current;

    if (!isProPlayer && remaining <= 0) {
      throw new ApiError(400, `Video reel limit reached (${videoLimit}). Delete a reel before uploading new ones.`);
    }

    const uploads = req.files.slice(0, remaining);
    const added = [];

    for (const file of uploads) {
      const mediaData = await handleMediaUpload(file, req, "video");
      const reelItem = {
        url: mediaData.url,
        publicId: mediaData.publicId,
        title: file.originalname || "highlight reel",
        duration: 0,
        uploadedAt: new Date(),
      };
      player.media.videos.push(reelItem);
      added.push(reelItem);
    }

    await player.save();

    res.status(200).json(
      new ApiResponse(
        200,
        {
          added,
          total: player.media.videos.length,
          limit: isProPlayer ? null : videoLimit,
          unlimited: isProPlayer,
        },
        `${added.length} highlight reel(s) uploaded successfully`
      )
    );
    return;
  }

  const file = req.files[0];

  if (player.media[mediaType]?.publicId) {
    const resourceType = mediaType === "video" ? "video" : "auto";
    await deleteMediaFromLocal(
      player.media[mediaType].publicId,
      resourceType
    ).catch((err) =>
      console.warn(`Failed to delete old ${mediaType}:`, err.message)
    );
  }

  const resourceType = mediaType === "video" ? "video" : "auto";
  const mediaData = await handleMediaUpload(file, req, resourceType);

  const mediaItem = {
    url: mediaData.url,
    publicId: mediaData.publicId,
    title: file.originalname,
    uploadedAt: mediaData.uploadedAt,
  };

  if (mediaType === "video") {
    mediaItem.duration = 0;
  }

  if (mediaType === "document") {
    mediaItem.size = file.size;
    mediaItem.type = file.mimetype;
    mediaItem.extension = mediaData.extension;
  }

  player.media[mediaType] = mediaItem;
  await player.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, mediaItem, `${mediaType} uploaded successfully`)
    );
});

export const deleteMedia = asyncHandler(async (req, res) => {
  const { playerId, mediaType } = req.params;
  const userId = req.user._id;

  if (!["video", "videos", "document"].includes(mediaType)) {
    throw new ApiError(400, "Invalid media type");
  }

  const player = await Player.findById(playerId);

  if (!player) {
    throw new ApiError(404, "Player not found");
  }

  if (!canManagePlayer(req.user, player)) {
    throw new ApiError(403, "You can only update your own profile");
  }

  if (mediaType === "videos") {
    const index = Number(req.query.index);

    if (Number.isInteger(index) && index >= 0) {
      const reel = player.media.videos?.[index];
      if (!reel) {
        throw new ApiError(404, "Highlight reel not found");
      }
      if (reel.publicId) {
        await deleteMediaFromLocal(reel.publicId, "video").catch((err) =>
          console.warn(`Failed to delete reel ${index}:`, err.message)
        );
      }
      player.media.videos.splice(index, 1);
      await player.save();

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { total: player.media.videos.length },
            "Highlight reel deleted successfully"
          )
        );
      return;
    }

    const { publicId } = req.body || {};
    if (!publicId) {
      throw new ApiError(
        400,
        "Provide ?index=N or a publicId to delete a specific reel"
      );
    }

    const idx = (player.media.videos || []).findIndex(
      (v) => v.publicId === publicId
    );
    if (idx === -1) {
      throw new ApiError(404, "Highlight reel not found");
    }

    await deleteMediaFromLocal(publicId, "video").catch((err) =>
      console.warn(`Failed to delete reel:`, err.message)
    );
    player.media.videos.splice(idx, 1);
    await player.save();

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { total: player.media.videos.length },
          "Highlight reel deleted successfully"
        )
      );
    return;
  }

  if (!player.media[mediaType] || !player.media[mediaType].publicId) {
    throw new ApiError(404, `No ${mediaType} found to delete`);
  }

  const resourceType = mediaType === "video" ? "video" : "auto";
  if (player.media[mediaType].publicId) {
    await deleteMediaFromLocal(
      player.media[mediaType].publicId,
      resourceType
    ).catch((err) =>
      console.warn(`Failed to delete ${mediaType}:`, err.message)
    );
  }

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

async function initiatePlayerPromotionPayment(invoice, user, req) {
  if (invoice.paymentUrl) {
    return invoice.paymentUrl;
  }

  const days = Number(invoice.durationDays || 15);
  const tier = invoice.featureType === "premium" ? "premium" : "featured";
  const title = `Player ${tier} promotion (${days} day${days === 1 ? "" : "s"})`;

  const originFallback =
    req.get && req.get("origin") ? req.get("origin") : null;
  const frontUrl =
    process.env.FRONTEND_URL ||
    originFallback ||
    process.env.APP_URL ||
    "http://localhost:3000";
  const callBackUrl = `${frontUrl.replace(
    /\/$/,
    ""
  )}/profile?tab=payments&invoiceId=${String(invoice._id)}`;
  const cancelUrl = `${frontUrl.replace(/\/$/, "")}/profile?tab=payments`;

  const payload = {
    orderNumber: invoice.orderNumber,
    amount: invoice.amount,
    currency: invoice.currency || "SAR",
    clientName: user?.name || user?.email,
    clientEmail: user?.email,
    clientMobile: user?.phone || "0500000000",
    products: [{ title, price: invoice.amount, qty: 1, isDigital: true }],
    supportedCardBrands: ["mada", "visaMastercard", "stcpay"],
    callBackUrl,
    cancelUrl,
    note: `userId=${invoice.userId};product=promotion;targetType=player;profileId=${
      invoice.playerProfileId || ""
    };durationDays=${invoice.durationDays || ""}`,
  };

  const data = await paylinkCreateInvoice(payload);
  invoice.provider = "paylink";
  invoice.providerInvoiceId = data.transactionNo || data.invoiceId || undefined;
  invoice.paymentUrl = data.url || null;
  if (!invoice.invoiceNumber) invoice.invoiceNumber = invoice.orderNumber;
  await invoice.save();
  return invoice.paymentUrl;
}

export const promotePlayer = asyncHandler(async (req, res) => {
  const playerId = req.params.id;
  const userId = req.user._id;
  const { days, type = "featured" } = req.body;
  const isStaff = STAFF_ROLES.includes(req.user.role);

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

  if (!canManagePlayer(req.user, player)) {
    throw new ApiError(403, "You can only promote your own profile");
  }

  if (player.isCurrentlyPromoted) {
    throw new ApiError(400, "Player is already promoted");
  }

  if (isStaff) {
    const staffTier = type === "premium" ? "premium" : "featured";
    if (player.promote) {
      await player.promote(days, staffTier);
    } else {
      player.isPromoted = {
        status: true,
        type: staffTier,
        startDate: new Date(),
        endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      };
      await player.save();
    }

    await sendInternalNotification(
      userId,
      "Profile Promoted",
      `Your player profile has been promoted for ${days} days!`,
      { playerId: player._id, days, type: staffTier }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, player, "Player promoted successfully"));
  }

  const PRICING = await getPricingSettings();
  const tier = type === "premium" ? "premium" : "featured";
  const { amount, durationDays: d } = computePromotionAmount(
    PRICING,
    "player",
    tier,
    days
  );

  let invoice = await Invoice.findOne({
    userId,
    product: "promotion",
    targetType: "player",
    playerProfileId: player._id,
    status: "pending",
  });

  if (invoice) {
    if (!invoice.paymentUrl) {
      invoice.durationDays = d;
      invoice.featureType = tier;
      invoice.amount = amount;
      await invoice.save();
    }
  } else {
    const orderNo = makeOrderNumber("promotion", String(userId));
    invoice = await Invoice.create({
      orderNumber: orderNo,
      invoiceNumber: orderNo,
      userId,
      product: "promotion",
      targetType: "player",
      playerProfileId: player._id,
      durationDays: d,
      featureType: tier,
      amount,
      currency: "SAR",
      status: "pending",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  }

  const paymentUrl = await initiatePlayerPromotionPayment(invoice, req.user, req);

  await sendInternalNotification(
    userId,
    "Payment Required",
    "Please complete payment to promote your player profile",
    { playerId: player._id, invoiceId: String(invoice._id), days, type }
  );

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        {
          player,
          paymentUrl,
          invoiceId: String(invoice._id),
        },
        "Please complete payment to promote your player profile"
      )
    );
});

export const transferPlayer = asyncHandler(async (req, res) => {
  const playerId = req.params.id;
  const { clubName, amount, transferDate } = req.body;
  const isStaff = STAFF_ROLES.includes(req.user.role);

  if (!clubName || !amount) {
    throw new ApiError(400, "Club name and transfer amount are required");
  }

  const player = await Player.findById(playerId);

  if (!player) {
    throw new ApiError(404, "Player not found");
  }

  if (!canManagePlayer(req.user, player)) {
    throw new ApiError(
      403,
      "You can only mark your own player profile as transferred"
    );
  }

  if (player.status === "transferred") {
    throw new ApiError(400, "Player is already transferred");
  }

  if (player.transfer) {
    await player.transfer(clubName, amount);
  } else {
    player.status = "transferred";
    player.transferHistory.push({
      clubName,
      amount,
      transferDate: transferDate || new Date(),
      type: "transfer",
    });
    await player.save();
  }

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

export const updateStatistics = asyncHandler(async (req, res) => {
  const playerId = req.params.id;
  const userId = req.user._id;
  const statistics = req.body;

  const player = await Player.findById(playerId);

  if (!player) {
    throw new ApiError(404, "Player not found");
  }

  if (
    !canManagePlayer(req.user, player)
  ) {
    throw new ApiError(403, "You can only update your own statistics");
  }

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
    .populate("user", "name email");

  res
    .status(200)
    .json(
      new ApiResponse(200, players, "Promoted players fetched successfully")
    );
});

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
    heightMin,
    heightMax,
    weightMin,
    weightMax,
    preferredFoot,
    contractStatus,
    physicalCondition,
    page = 1,
    limit = 10,
    sortBy = "date",
  } = req.query;

  if (!search) {
    throw new ApiError(400, "Search query is required");
  }

  if (String(search).length > 100) {
    throw new ApiError(400, "Search query is too long");
  }

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

  if (position) {
    query.position = { $regex: position, $options: "i" };
  }
  if (nationality) {
    query.nationality = { $regex: nationality, $options: "i" };
  }
  if (preferredFoot) {
    query.preferredFoot = { $regex: preferredFoot, $options: "i" };
  }
  if (contractStatus) {
    query.contractStatus = contractStatus;
  }
  if (physicalCondition) {
    query.physicalCondition = physicalCondition;
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

  if (heightMin || heightMax) {
    query.height = {};
    if (heightMin) {
      query.height.$gte = parseInt(heightMin);
    }
    if (heightMax) {
      query.height.$lte = parseInt(heightMax);
    }
  }

  if (weightMin || weightMax) {
    query.weight = {};
    if (weightMin) {
      query.weight.$gte = parseInt(weightMin);
    }
    if (weightMax) {
      query.weight.$lte = parseInt(weightMax);
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

  const { skip } = paginate(page, limit);

  const esResult = await search("player", {
    q: search,
    filters: {
      position,
      nationality,
      preferredFoot,
      contractStatus,
      physicalCondition,
      ageMin,
      ageMax,
      heightMin,
      heightMax,
      weightMin,
      weightMax,
      salaryMin,
      salaryMax,
      skills,
    },
    from: skip,
    size: parseInt(limit),
    sortBy,
  });
  if (esResult) {
    const ids = esResult.ids;
    const esPlayers = ids.length
      ? await Player.find({ _id: { $in: ids } }).populate("user", "name email")
      : [];
    const rank = new Map(ids.map((id, i) => [String(id), i]));
    esPlayers.sort(
      (a, b) => (rank.get(String(a._id)) ?? 0) - (rank.get(String(b._id)) ?? 0)
    );
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          players: esPlayers,
          searchQuery: search,
          engine: "elasticsearch",
          pagination: {
            total: esResult.total,
            pages: Math.ceil(esResult.total / parseInt(limit)),
            page: parseInt(page),
            limit: parseInt(limit),
          },
        },
        `Found ${esResult.total} players matching your search`
      )
    );
  }

  let sort = { createdAt: -1 };
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

  const [players, total] = await Promise.all([
    Player.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .populate("user", "name email"),
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

export const getPlayerAnalytics = asyncHandler(async (req, res) => {
  const playerId = req.params.id;
  const userId = req.user._id;

  const player = await Player.findById(playerId);

  if (!player) {
    throw new ApiError(404, "Player not found");
  }

  if (
    player.user.toString() !== userId.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "You can only view analytics for your own profile");
  }

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
      { jop: currentPlayer.jop || currentPlayer.job },
    ],
  };

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
    .populate("user", "name email");
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
      .populate("user", "name email"),
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

export const getFeaturedPlayers = asyncHandler(async (req, res) => {
  const { limit = 6 } = req.query;

  const query = {
    isActive: true,
    $or: [
      { "isPromoted.status": true, "isPromoted.endDate": { $gt: new Date() } },
      { isPro: true, proExpiresAt: { $gt: new Date() } },
    ],
  };

  const players = await Player.find(query)
    .sort({ "isPromoted.startDate": -1, views: -1 })
    .limit(parseInt(limit))
    .populate("user", "name email");
  res
    .status(200)
    .json(
      new ApiResponse(200, players, "Featured players fetched successfully")
    );
});

const calculateProfileCompleteness = (player) => {
  let completedFields = 0;
  const totalFields = 20;

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
  if (player.jop || player.job) {
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
    const mediaDeleteResults = await deleteAllPlayerMedia(player.media);

    if (mediaDeleteResults.successful.length > 0) {
      console.log(
        `Successfully deleted ${mediaDeleteResults.successful.length} media files:`,
        mediaDeleteResults.successful
          .map((item) => `${item.type} (${item.publicId})`)
          .join(", ")
      );
    }

    if (mediaDeleteResults.failed.length > 0) {
      console.warn(
        `Failed to delete ${mediaDeleteResults.failed.length} media files:`,
        mediaDeleteResults.failed
          .map((item) => `${item.type} (${item.publicId}): ${item.error}`)
          .join("; ")
      );
    }

    await Player.findByIdAndDelete(player._id);

    const totalMediaAttempted =
      mediaDeleteResults.successful.length + mediaDeleteResults.failed.length;
    let message = "Player profile permanently deleted";

    if (totalMediaAttempted > 0) {
      message += `. Media cleanup: ${mediaDeleteResults.successful.length}/${totalMediaAttempted} files deleted successfully`;

      if (mediaDeleteResults.failed.length > 0) {
        message += ` (${mediaDeleteResults.failed.length} files failed to delete from cloud storage but player record was removed)`;
      }
    }

    res.status(200).json(
      new ApiResponse(
        200,
        {
          mediaCleanup: {
            attempted: totalMediaAttempted,
            successful: mediaDeleteResults.successful.length,
            failed: mediaDeleteResults.failed.length,
          },
        },
        message
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
