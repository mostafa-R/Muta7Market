import express from "express";
import {
  createPlayer,
  deleteMedia,
  deletePlayer,
  deletePlayerDocument,
  deletePlayerImages,
  deletePlayerProfile,
  deletePlayerVideo,
  getAllPlayers,
  getFeaturedPlayers,
  getMyProfile,
  getPlayerAnalytics,
  getPlayerById,
  getPlayersByPosition,
  getPromotedPlayers,
  getSimilarPlayers,
  promotePlayer,
  searchPlayers,
  transferPlayer,
  updatePlayer,
  updateStatistics,
  uploadMedia,
  uploadProfileImage,
} from "../controllers/player.controller.js";
import { authMiddleware, verifiedOnly } from "../middleware/auth.middleware.js";
import { uploadMixed } from "../middleware/localUpload.middleware.js";
import { parseJsonFields } from "../middleware/parseJsonFields.js";
import validate from "../middleware/validation.middleware.js";
import {
  createPlayerSchema,
  promotePlayerSchema,
  updatePlayerSchema,
} from "../validators/player.validator.js";

const router = express.Router();

router.get("/", getAllPlayers);

router.get("/search", searchPlayers);

router.get("/promoted", getPromotedPlayers);

router.get("/featured", getFeaturedPlayers);

router.get("/position/:position", getPlayersByPosition);

router.get("/playerprofile", authMiddleware, verifiedOnly, getMyProfile);

router.delete("/:id/images", authMiddleware, verifiedOnly, deletePlayerImages);

router.delete("/:id/video", authMiddleware, verifiedOnly, deletePlayerVideo);

router.delete(
  "/:id/document",
  authMiddleware,
  verifiedOnly,
  deletePlayerDocument
);

router.get("/:id/similar", getSimilarPlayers);

router.get("/:id", getPlayerById);

router.use(authMiddleware);

router.post(
  "/createPlayer",
  verifiedOnly,
  uploadMixed.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "document", maxCount: 1 },
    { name: "playerVideo", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  parseJsonFields([
    "monthlySalary",
    "yearSalary",
    "transferredTo",
    "socialLinks",
    "isPromoted",
    "contactInfo",
    "roleType",
    "position",
    "game",
  ]),
  validate(createPlayerSchema),
  createPlayer
);

router.patch(
  "/:id",
  verifiedOnly,
  uploadMixed.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "document", maxCount: 1 },
    { name: "playerVideo", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  parseJsonFields([
    "monthlySalary",
    "yearSalary",
    "transferredTo",
    "socialLinks",
    "isPromoted",
    "contactInfo",
    "roleType",
    "position",
    "game",
  ]),
  validate(updatePlayerSchema),
  updatePlayer
);

router.get("/:id/analytics", getPlayerAnalytics);

router.post(
  "/:id/profile-image",
  uploadMixed.single("profileImage"),
  uploadProfileImage
);

router.post(
  "/:id/media/:mediaType",
  uploadMixed.array("media", 10),
  uploadMedia
);

router.delete("/:playerId/media/:mediaType", deleteMedia);

router.post("/:id/promote", validate(promotePlayerSchema), promotePlayer);

router.post("/:id/transfer", transferPlayer);

router.patch("/:id/statistics", updateStatistics);

router.delete("/delete-player-profile", verifiedOnly, deletePlayerProfile);

router.delete("/:id", deletePlayer);

export default router;
