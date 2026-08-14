import express from "express";
import {
  createCoach,
  deleteCoach,
  getAllCoaches,
  getCoachById,
  getCoachesByCategory,
  getCoachStats,
  getPromotedCoaches,
  promoteCoach,
  transferCoach,
  updateCoach,
} from "../controllers/coach.controller.js";
import { authMiddleware, authorize } from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";
import {
  createCoachSchema,
  promoteCoachSchema,
  updateCoachSchema,
} from "../validators/coach.validator.js";

const router = express.Router();

router.get("/", getAllCoaches);
router.get("/stats", getCoachStats);
router.get("/promoted", getPromotedCoaches);
router.get("/category/:category", getCoachesByCategory);
router.get("/:id", getCoachById);

router.use(authMiddleware);

router.post("/", validate(createCoachSchema), createCoach);
router.put("/:id", validate(updateCoachSchema), updateCoach);
router.delete("/:id", deleteCoach);

router.use(authorize("admin", "super_admin", "coach"));

router.post("/:id/promote", validate(promoteCoachSchema), promoteCoach);
router.post("/transfer/:id", transferCoach);

export default router;
