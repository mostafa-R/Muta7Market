import { Router } from "express";
import {
  getAdSettings,
  updateAdSettings,
} from "../controllers/ad-settings.controller.js";
import { authMiddleware, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// A public route for the frontend to fetch ad settings
router.get("/", getAdSettings);

// Protected route for updating ad settings - requires authentication and authorization
router.patch(
  "/",
  authMiddleware,
  authorize("admin", "super_admin"),
  updateAdSettings
);

export default router;
