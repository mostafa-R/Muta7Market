import express from "express";
import {
  createPlayer,
  deletePlayer,
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
  deleteMedia,
} from "../controllers/player.controller.js";
import { authMiddleware, verifiedOnly } from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";
import {
  createPlayerSchema,
  updatePlayerSchema,
} from "../validators/player.validator.js";
import { uploadMixed } from "../config/cloudinary.js";
import { parseJsonFields } from "../middleware/parseJsonFields.js";
// import {
//   uploadSingle,
//   uploadMultiple,
// } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/", getAllPlayers);
// Public routes (no authentication required)
// Player profile management
// createPlayer
// find player by id 
router.get("/:id", getPlayerById);

router.use(authMiddleware);
// Player profile management



// createPlayer
router.post(
  "/createPlayer",
  verifiedOnly,
  uploadMixed.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "document", maxCount: 1 },
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

// updatePlayer
router.patch(
  "/:id",
  verifiedOnly,
  uploadMixed.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "document", maxCount: 1 },
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
