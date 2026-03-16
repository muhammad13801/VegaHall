import { Router } from "express";
import { sessionAuthenticate } from "../middleware/sessionMiddleware";
import { updatePassword } from "../controllers/updatePassController";
import { logout } from "../controllers/logoutController";
import { getProfile } from "../controllers/profileController";
import { checkEmail, updateEmail } from "../controllers/updateEmailController";
import { updateName } from "../controllers/updateNameController";
import { updatePhone } from "../controllers/updatePhoneController";
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
