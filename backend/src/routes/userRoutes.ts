import { Router } from "express";
import { sessionAuthenticate } from "../middleware/sessionMiddleware.ts";
import { updatePassword } from "../controllers/userControllers/updatePassController.ts";
import { logout } from "../controllers/userControllers/logoutController.ts";
import { getProfile } from "../controllers/userControllers/profileController.ts";
import {
  checkEmail,
  updateEmail,
} from "../controllers/userControllers/updateEmailController.ts";
import { updateName } from "../controllers/userControllers/updateNameController.ts";
import { updatePhone } from "../controllers/userControllers/updatePhoneController.ts";

const router = Router();

// protected route (authorized access only)
router.get("/profile", sessionAuthenticate, getProfile);
router.post("/update-name", sessionAuthenticate, updateName);
router.post("/update-phone", sessionAuthenticate, updatePhone);
router.post("/update-email", sessionAuthenticate, updateEmail);
router.post("/check-email", sessionAuthenticate, checkEmail);
router.post("/update-password", sessionAuthenticate, updatePassword);
router.post("/logout", sessionAuthenticate, logout);

export default router;
