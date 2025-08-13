import { Router } from "express";
import { notPaied, update } from "../controllers/user.controller.js";
import { authMiddleware, verifiedOnly } from "../middleware/auth.middleware.js";
import { uploadMixed } from "../config/cloudinary.js";
import validate from "../middleware/validation.middleware.js";
import { updateProfileSchema } from "../validators/auth.validator.js";
// import profileUpload from "../middleware/uploads/profileUpload.js";

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

// userRoutes.get("/allusers", roleMiddleware(["admin"]), getAllUsers);

// userRoutes.get("/notifications", roleMiddleware(["admin"]), getNotifictions);

// userRoutes.post("/approveEvent", roleMiddleware(["admin"]), approveEvent);

// userRoutes.get("/", getUser);

// userRoutes.get("/:id", roleMiddleware(["admin", "user"]), getUserById);

// userRoutes.patch(
//   "/userimage",
//   profileUpload.single("profileImage"),
//   profileImage
// );

// userRoutes.patch(
//   "/edit",
//   roleMiddleware("user"),
//   update
// );

// userRoutes.patch("/delete", roleMiddleware(["admin", "user"]), deleteUser);

// userRoutes.patch("/restoreuser", roleMiddleware(["user"]), restoreUser);

// userRoutes.patch("/delete/:id", roleMiddleware(["admin"]), deleteUserById);

// userRoutes.patch(
//   "/restoreuser/:id",
//   roleMiddleware(["admin"]),
//   restoreUserbyId
// );

export default userRoutes;
