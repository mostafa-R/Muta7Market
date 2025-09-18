import { Router } from "express";
import {
  getAdSettings,
  updateAdSettings,
} from "../controllers/ad-settings.controller.js";
import { authMiddleware, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getAdSettings);

router.patch(
  "/",
  authMiddleware,
  authorize("admin", "super_admin"),
  updateAdSettings
);

export default router;
