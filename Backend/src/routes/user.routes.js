import { Router } from "express";
import { notPaied, update } from "../controllers/user.controller.js";
import { authMiddleware, verifiedOnly } from "../middleware/auth.middleware.js";
import { uploadMixed } from "../middleware/localUpload.middleware.js";
import validate from "../middleware/validation.middleware.js";
import { updateProfileSchema } from "../validators/auth.validator.js";

const userRoutes = Router();

userRoutes.use(authMiddleware);

userRoutes.patch(
  "/update",
  verifiedOnly,
  uploadMixed.fields([{ name: "profileImage", maxCount: 1 }]),
  validate(updateProfileSchema),
  update
);

userRoutes.get("/notpaid", notPaied);

export default userRoutes;
