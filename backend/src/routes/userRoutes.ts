import { Router } from "express";
import { sessionAuthenticate } from "../middleware/sessionMiddleware";
import { updatePassword } from "../controllers/userControllers/updatePassController";
import { logout } from "../controllers/userControllers/logoutController";
import { getProfile } from "../controllers/userControllers/profileController";
import {
  checkEmail,
  updateEmail,
} from "../controllers/userControllers/updateEmailController";
import { updateName } from "../controllers/userControllers/updateNameController";
import { updatePhone } from "../controllers/userControllers/updatePhoneController";

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
