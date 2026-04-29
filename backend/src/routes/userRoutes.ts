import { Router } from "express";
import { sessionAuthenticate } from "../middleware/sessionMiddleware.js";
import { updatePassword } from "../controllers/userControllers/updatePassController.js";
import { logout } from "../controllers/userControllers/logoutController.js";
import { getProfile } from "../controllers/userControllers/profileController.js";
import {
  checkEmail,
  updateEmail,
} from "../controllers/userControllers/updateEmailController.js";
import { updateName } from "../controllers/userControllers/updateNameController.js";
import { updatePhone } from "../controllers/userControllers/updatePhoneController.js";

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
