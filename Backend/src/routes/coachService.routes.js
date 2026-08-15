import express from "express";
import {
  createCoachService,
  deleteCoachService,
  getCoachServiceById,
  getMyServices,
  listCoachServices,
  updateCoachService,
} from "../controllers/coachService.controller.js";
import { authMiddleware, authorize } from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";
import {
  createCoachServiceSchema,
  updateCoachServiceSchema,
} from "../validators/coachService.validator.js";

const router = express.Router();

router.get("/", listCoachServices);
router.get("/:id", getCoachServiceById);

router.use(authMiddleware);
router.use(authorize("coach", "admin", "super_admin"));

router.get("/mine/list", getMyServices);

router.post("/", validate(createCoachServiceSchema), createCoachService);

router.patch(
  "/:id",
  validate(updateCoachServiceSchema),
  updateCoachService
);
router.delete("/:id", deleteCoachService);

export default router;