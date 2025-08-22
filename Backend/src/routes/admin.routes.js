import express from "express";
import {
  bulkUpdatePlayers,
  bulkUpdateUsers,
  createPlayer,
  createUser,
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

import { authMiddleware, authorize } from "../middleware/auth.middleware.js";
import { parseJsonFields } from "../middleware/parseJsonFields.js";
import { uploadMixed } from "../middleware/upload.middleware.js";
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
import Joi from "joi";

const boolBody = (key) => Joi.object({ [key]: Joi.boolean().required() });

const router = express.Router();

// All routes are protected for Admins only
router.use(authMiddleware, authorize("admin", "super_admin"));

// ================================
// DASHBOARD & ANALYTICS
// ================================

// Get dashboard statistics
router.get("/dashboard/stats", getDashboardStats);

// ================================
// USER MANAGEMENT ROUTES
// ================================

// Get all users with filtering and pagination
router.get("/users", validateQuery(getUsersQuerySchema), getAllUsers);

// Get a specific user by ID
router.get("/users/:id", getUserById);

// verify a user
router.patch(
  "/users/:id/email-verified",
  validate(verifyUserEmailSchema),
  verifyUserEmail
);

// Create a new user
router.post("/users", validate(createUserSchema), createUser);

// Update a user
router.put("/users/:id", validate(updateUserSchema), updateUser);

// Delete a user (supports soft delete via query param ?soft=true)
router.delete("/users/:id", deleteUser);

// Bulk update users
// delete this route
router.patch("/users/bulk", validate(bulkUpdateUsersSchema), bulkUpdateUsers);

// ================================
// PLAYER MANAGEMENT ROUTES
// ================================

router.get(
  "/players/recent",
  validate(getRecentPeopleQuerySchema),
  getRecentUnconfirmedPlayers
);

// Get all players with filtering and pagination
router.get("/players", validateQuery(getPlayersQuerySchema), getAllPlayers);

// Get a specific player by ID
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

// Create a new player (with file upload support)
// http://localhost:5000/api/v1/admin/players
// router.post(
//   "/players",
//   (req, res) => {
//     console.log(req.body);
//   }
//   // uploadMixed.fields([
//   //   { name: "profileImage", maxCount: 1 },
//   //   { name: "document", maxCount: 1 },
//   //   { name: "playerVideo", maxCount: 1 },
//   // ]),
//   // parseJsonFields,
//   // (req ,res ) => {
//   //   console.log("we");
//   // }
//   // validate(createPlayerSchema),
//   // createPlayer
// );

router.post(
  "/players",
  // verifiedOnly,
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

// Update a player (with file upload support)
router.patch(
  "/players/:id",
  parseJsonFields,
  validate(updatePlayerSchema),
  updatePlayer
);

// Delete a player (supports soft delete via query param ?soft=true)
router.delete("/players/:id", deletePlayer);

// Bulk update players
router.patch(
  "/players/bulk",
  validate(bulkUpdatePlayersSchema),
  bulkUpdatePlayers
);

export default router;
