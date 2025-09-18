import express from "express";
import {
  createAdvertisement,
  deleteAdvertisement,
  getActiveAdvertisementsByPosition,
  getAdvertisementById,
  getAllAdvertisements,
  registerAdvertisementClick,
  updateAdvertisement,
  updateAdvertisementMedia,
} from "../controllers/advertisement.controller.js";
import { authMiddleware, authorize } from "../middleware/auth.middleware.js";
import { uploadMixed } from "../middleware/localUpload.middleware.js";
import validate from "../middleware/validation.middleware.js";
import {
  createAdvertisementSchema,
  updateAdvertisementSchema,
} from "../validators/advertisement.validator.js";

const router = express.Router();

router.get("/active/:position", getActiveAdvertisementsByPosition);
router.get("/click/:id", registerAdvertisementClick);

router.use(authMiddleware, authorize("admin", "super_admin"));

router.get("/", getAllAdvertisements);
router.get("/:id", getAdvertisementById);
router.post(
  "/",
  uploadMixed.fields([
    { name: "desktop", maxCount: 1 },
    { name: "mobile", maxCount: 1 },
  ]),
  validate(createAdvertisementSchema),
  createAdvertisement
);
router.patch("/:id", validate(updateAdvertisementSchema), updateAdvertisement);
router.patch(
  "/:id/media",
  uploadMixed.fields([
    { name: "desktop", maxCount: 1 },
    { name: "mobile", maxCount: 1 },
  ]),
  updateAdvertisementMedia
);
router.delete("/:id", deleteAdvertisement);

export default router;
