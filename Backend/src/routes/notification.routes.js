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
  authorize("admin", "moderator"),
  sendNotification
);
router.post("/bulk", authMiddleware, authorize("admin"), sendBulkNotifications);

router.get("/my", authMiddleware, getUserNotifications);
router.patch("/read", authMiddleware, markAsRead);
router.get("/unread-count", authMiddleware, getUnreadCount);

router.post(
  "/templates",
  authMiddleware,
  authorize("admin", "moderator"),
  createTemplate
);
router.get(
  "/templates",
  authMiddleware,
  authorize("admin", "moderator"),
  getAllTemplates
);
router.get(
  "/templates/:id",
  authMiddleware,
  authorize("admin", "moderator"),
  getTemplateById
);
router.put(
  "/templates/:id",
  authMiddleware,
  authorize("admin", "moderator"),
  updateTemplate
);
router.delete(
  "/templates/:id",
  authMiddleware,
  authorize("admin"),
  deleteTemplate
);

router.get(
  "/analytics",
  authMiddleware,
  authorize("admin", "moderator"),
  getNotificationAnalytics
);

export default router;
