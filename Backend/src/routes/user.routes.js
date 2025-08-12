import { Router } from 'express';
import {
  notPaied,
  update
} from '../controllers/user.controller.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
// import profileUpload from "../middleware/uploads/profileUpload.js";

const userRoutes = Router();

userRoutes.use(authMiddleware);

userRoutes.patch('/update',  update);

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
