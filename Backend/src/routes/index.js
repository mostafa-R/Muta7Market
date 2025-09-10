import { Router } from "express";
import { getPricingSettings } from "../utils/pricingUtils.js";
import { initializeEmailService } from "../services/email.service.js";
import adminRoutes from "./admin.routes.js";
import authRoutes from "./auth.routes.js";
import coachRoutes from "./coach.routes.js";
import entitlementRoutes from "./entitlement.routes.js";
import notificationRoutes from "./notification.routes.js";
import offerRoutes from "./offer.routes.js";
import paymentRoutes from "./payment.routes.js";
import playerRoutes from "./player.routes.js";
import uploadRoutes from "./upload.routes.js";
import userRoutes from "./user.routes.js";

// استيراد المسارات الجديدة
import advertisementRoutes from "./advertisement.routes.js";
import legalDocumentRoutes from "./legal-document.routes.js";
import promotionalOfferRoutes from "./promotional-offer.routes.js";
import settingsRoutes from "./settings.routes.js";
import sportRoutes from "./sport.routes.js";

const router = Router();

// API Routes
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/admin", adminRoutes);
router.use("/players", playerRoutes);
router.use("/coaches", coachRoutes);
router.use("/offers", offerRoutes);
router.use("/notifications", notificationRoutes);
router.use("/payments", paymentRoutes);
router.use("/entitlements", entitlementRoutes);
router.use("/upload", uploadRoutes);

// تسجيل المسارات الجديدة
router.use("/settings", settingsRoutes);
router.use("/sports", sportRoutes);
router.use("/legal", legalDocumentRoutes);
router.use("/promotions", promotionalOfferRoutes);
router.use("/advertisements", advertisementRoutes);

// Public pricing endpoint for frontend to fetch dynamic prices
router.get("/config/pricing", async (req, res) => {
  try {
    const pricing = await getPricingSettings();
    res.status(200).json({
      success: true,
      data: pricing,
    });
  } catch (error) {
    console.error("Error fetching pricing settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pricing settings",
    });
  }
});

// Test Email Route
router.get("/test-email", async (req, res) => {
  const result = await initializeEmailService.testEmailConnection();
  res.status(result.success ? 200 : 500).json(result);
});

// Test API Route
router.get("/test", (req, res) => {
  res.json({ message: "API is working!" });
});

export default router;
