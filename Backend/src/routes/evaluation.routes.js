import { Router } from "express";
import { authMiddleware, authorize } from "../middleware/auth.middleware.js";
import validate, {
  validateQuery,
} from "../middleware/validation.middleware.js";
import {
  createEvaluation,
  getMyEvaluations,
  getEvaluationsBySubject,
  getEvaluationById,
  updateEvaluation,
  deleteEvaluation,
  getSubjectRatingStats,
} from "../controllers/evaluation.controller.js";
import {
  createEvaluationSchema,
  updateEvaluationSchema,
} from "../validators/evaluation.validator.js";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createEvaluationSchema), createEvaluation);
router.get("/me", getMyEvaluations);
router.get("/subject/:subjectType/:subject", getEvaluationsBySubject);
router.get("/stats/:subjectType/:subject", getSubjectRatingStats);
router.get("/:id", getEvaluationById);
router.patch("/:id", validate(updateEvaluationSchema), updateEvaluation);
router.delete("/:id", deleteEvaluation);

export default router;
