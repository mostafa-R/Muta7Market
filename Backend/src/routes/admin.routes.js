import express from "express";
import {
  bulkUpdatePlayers,
  bulkUpdateUsers,
  createPlayer,
  createUser,
  createUserWithPlayerProfile,
  deletePlayer,
  deleteUser,
  getAllPlayers,
  getAllUsers,
  getDashboardStats,
  getPlayerById,
  // getRecentUnconfirmedPeople,
  getRecentUnconfirmedPlayers,
  getUserById,
  updateActivation,
  updateConfirmation,
  updatePlayer,
  updatePromotion,
  updateUser,
  verifyUserEmail,
} from "../controllers/admin.controller.js";

import Joi from "joi";
import { authMiddleware, authorize } from "../middleware/auth.middleware.js";
import { uploadMixed } from "../middleware/localUpload.middleware.js";
import { parseJsonFields } from "../middleware/parseJsonFields.js";
import validate, {
  validateQuery,
} from "../middleware/validation.middleware.js";
import {
  bulkUpdatePlayersSchema,
  // Bulk Operations Schemas
  bulkUpdateUsersSchema,
  // Player Validation Schemas
  createPlayerSchema,
  // User Validation Schemas
  createUserSchema,
  getPlayersQuerySchema,
  getRecentPeopleQuerySchema,
  getUsersQuerySchema,
  updatePlayerSchema,
  updatePromotionSchema,
  updateUserSchema,
  verifyUserEmailSchema,
} from "../validators/admin.validator.js";

const boolBody = (key) => Joi.object({ [key]: Joi.boolean().required() });

const router = express.Router();

router.use(authMiddleware, authorize("admin", "super_admin"));

router.get("/dashboard/stats", getDashboardStats);

router.get("/users", validateQuery(getUsersQuerySchema), getAllUsers);

router.get("/users/:id", getUserById);

router.patch(
  "/users/:id/email-verified",
  validate(verifyUserEmailSchema),
  verifyUserEmail
);

router.post("/users", validate(createUserSchema), createUser);

router.put("/users/:id", validate(updateUserSchema), updateUser);

router.delete("/users/:id", deleteUser);

router.patch("/users/bulk", validate(bulkUpdateUsersSchema), bulkUpdateUsers);

router.get(
  "/players/recent",
  validate(getRecentPeopleQuerySchema),
  getRecentUnconfirmedPlayers
);

router.get("/players", validateQuery(getPlayersQuerySchema), getAllPlayers);

router.get("/players/:id", getPlayerById);

router.patch(
  "/players/:id/confirm",
  validate(boolBody("isConfirmed")),
  updateConfirmation
);

router.patch(
  "/players/:id/active",
  validate(boolBody("isActive")),
  updateActivation
);

router.patch(
  "/players/:id/promote",
  validate(updatePromotionSchema),
  updatePromotion
);

router.post(
  "/players",
  uploadMixed.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "document", maxCount: 1 },
    { name: "playerVideo", maxCount: 1 },
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

router.post(
  "/users-with-player",
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
    "game",
    "roleType",
    "position",
  ]),
  createUserWithPlayerProfile
);

router.patch(
  "/players/:id",
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
    "contactInfo",
    "existingMedia",
    "isPromoted",
  ]),
  validate(updatePlayerSchema),
  updatePlayer
);

router.delete("/players/:id", deletePlayer);

router.patch(
  "/players/bulk",
  validate(bulkUpdatePlayersSchema),
  bulkUpdatePlayers
);

export default router;
