import express from "express";
import {
  createTemplate,
  deleteTemplate,
  getAllTemplates,
  getNotificationAnalytics,
  getTemplateById,
  getUnreadCount,
  getUserNotifications,
  markAsRead,
  sendBulkNotifications,
  sendNotification,
  updateTemplate,
} from "../controllers/notification.controller.js";
import {
  authMiddleware,
  authorize,
  verifiedOnly,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/send",
  authMiddleware,
  verifiedOnly,
  authorize("admin", "super_admin"),
  sendNotification
);
router.post("/bulk", authMiddleware, authorize("admin", "super_admin"), sendBulkNotifications);

router.get("/my", authMiddleware, getUserNotifications);
router.patch("/read", authMiddleware, markAsRead);
router.get("/unread-count", authMiddleware, getUnreadCount);

router.post(
  "/templates",
  authMiddleware,
  authorize("admin", "super_admin"),
  createTemplate
);
router.get(
  "/templates",
  authMiddleware,
  authorize("admin", "super_admin"),
  getAllTemplates
);
router.get(
  "/templates/:id",
  authMiddleware,
  authorize("admin", "super_admin"),
  getTemplateById
);
router.put(
  "/templates/:id",
  authMiddleware,
  authorize("admin", "super_admin"),
  updateTemplate
);
router.delete(
  "/templates/:id",
  authMiddleware,
  authorize("admin", "super_admin"),
  deleteTemplate
);

router.get(
  "/analytics",
  authMiddleware,
  authorize("admin", "super_admin"),
  getNotificationAnalytics
);

export default router;
