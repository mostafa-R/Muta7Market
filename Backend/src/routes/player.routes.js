import express from "express";
import { uploadMixed } from "../middleware/upload.middleware.js";
import {
  createPlayer,
  deletePlayerDocument,
  deletePlayerImages,
  deletePlayerProfile,
  deletePlayerVideo,
  deleteSpecicImage,
  getAllPlayers,
  getMyProfile,
  getPlayerById,
  updatePlayer,
} from "../controllers/player.controller.js";
import { authMiddleware, verifiedOnly } from "../middleware/auth.middleware.js";
import { parseJsonFields } from "../middleware/parseJsonFields.js";
import validate from "../middleware/validation.middleware.js";
import {
  createPlayerSchema,
  updatePlayerSchema,
} from "../validators/player.validator.js";
// import {
//   uploadSingle,
//   uploadMultiple,
// } from "../middleware/upload.middleware.js";

const router = express.Router();

/**
 * ======================
 * Public Routes
 * ======================
 */

// Get all players
router.get("/", getAllPlayers);

// Get my profile (only for verified users)
router.get("/playerprofile", authMiddleware, verifiedOnly, getMyProfile);

// Delete specific images from player profile (must be before /:id route)
router.delete("/:id/images", authMiddleware, verifiedOnly, deletePlayerImages);

// Delete specific video from player profile
router.delete("/:id/video", authMiddleware, verifiedOnly, deletePlayerVideo);

// Delete specific document from player profile
router.delete(
  "/:id/document",
  authMiddleware,
  verifiedOnly,
  deletePlayerDocument
);

// Get player by ID (must be last in public routes to avoid overriding)
router.get("/:id", getPlayerById);

/**
 * ======================
 * Protected Routes
 * ======================
 */
router.use(authMiddleware);

// Create a new player
router.post(
  "/createPlayer",
  verifiedOnly,
  uploadMixed.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "document", maxCount: 1 },
    { name: "playerVideo", maxCount: 1 },
    { name: "images", maxCount: 5 }, // Support up to 5 additional images
  ]),
  parseJsonFields([
    "monthlySalary",
    "yearSalary",
    "transferredTo",
    "socialLinks",
    "isPromoted",
    "contactInfo",
  ]),
  validate(createPlayerSchema),
  createPlayer
);

// Update an existing player by ID
router.patch(
  "/:id",
  verifiedOnly,
  uploadMixed.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "document", maxCount: 1 },
    { name: "playerVideo", maxCount: 1 },
    { name: "images", maxCount: 5 }, // Support up to 5 additional images
  ]),
  parseJsonFields([
    "monthlySalary",
    "yearSalary",
    "transferredTo",
    "socialLinks",
    "isPromoted",
    "contactInfo",
  ]),
  validate(updatePlayerSchema),
  updatePlayer
);

// delete player profile
router.delete("/delete-player-profile", verifiedOnly, deletePlayerProfile);

// Delete specific images from player profile
router.delete("/:id/images", verifiedOnly, deleteSpecicImage);

// updatePlayer
// router.patch(
//   "/:id",
//   verifiedOnly,
//   uploadMixed.fields([
//     { name: "profileImage", maxCount: 1 },
//     { name: "document", maxCount: 1 },
//   ]),
//   updatePlayer
// );
export default router;
