import express from "express";
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
import { uploadMixed } from "../middleware/localUpload.middleware.js";
import { parseJsonFields } from "../middleware/parseJsonFields.js";
import validate from "../middleware/validation.middleware.js";
import {
  createPlayerSchema,
  updatePlayerSchema,
} from "../validators/player.validator.js";

const router = express.Router();

router.get("/", getAllPlayers);

router.get("/playerprofile", authMiddleware, verifiedOnly, getMyProfile);

router.delete("/:id/images", authMiddleware, verifiedOnly, deletePlayerImages);

router.delete("/:id/video", authMiddleware, verifiedOnly, deletePlayerVideo);

router.delete(
  "/:id/document",
  authMiddleware,
  verifiedOnly,
  deletePlayerDocument
);

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

router.delete("/delete-player-profile", verifiedOnly, deletePlayerProfile);

router.delete("/:id/images", verifiedOnly, deleteSpecicImage);

export default router;
