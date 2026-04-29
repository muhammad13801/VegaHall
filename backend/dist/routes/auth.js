import { Router } from "express";
import { register, resendCode, verifyRegister, } from "../controllers/userControllers/signUpController.js";
import { sendResetCode, verifyResetPassword, updateNewPassword, } from "../controllers/userControllers/passController.js";
import { login } from "../controllers/userControllers/loginController.js";
const router = Router();
// Sign Up routes
router.post("/register", register);
router.post("/verify", verifyRegister);
router.post("/resend-code", resendCode); // shared with forgot password route
// Forgot Password routes
router.post("/send-code", sendResetCode);
router.post("/verify", verifyResetPassword);
router.post("/update-new-password", updateNewPassword);
// Login/logout routes
router.post("/login", login);
export default router;
