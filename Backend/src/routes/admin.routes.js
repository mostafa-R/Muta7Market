import express from "express";
import {
  bulkUpdatePlayers,
  // Bulk Operations
  bulkUpdateUsers,
  createPlayer,
  createUser,
  deletePlayer,
  deleteUser,

  // Player Management
  getAllPlayers,
  // User Management
  getAllUsers,
  // Analytics & Stats
  getDashboardStats,
  getPlayerById,
  getUserById,
  updatePlayer,
  updateUser,
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
  getUsersQuerySchema,
  updatePlayerSchema,
  updateUserSchema,
} from "../validators/admin.validator.js";

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

// Create a new user
router.post("/users", validate(createUserSchema), createUser);

// Update a user
router.put("/users/:id", validate(updateUserSchema), updateUser);

// Delete a user (supports soft delete via query param ?soft=true)
router.delete("/users/:id", deleteUser);

// Bulk update users
router.patch("/users/bulk", validate(bulkUpdateUsersSchema), bulkUpdateUsers);

// ================================
// PLAYER MANAGEMENT ROUTES
// ================================

// Get all players with filtering and pagination
router.get("/players", validateQuery(getPlayersQuerySchema), getAllPlayers);

// Get a specific player by ID
router.get("/players/:id", getPlayerById);

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
  uploadMixed.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "document", maxCount: 1 },
    { name: "playerVideo", maxCount: 1 },
  ]),
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
