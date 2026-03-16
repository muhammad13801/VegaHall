import { Router } from "express";
import {
  register,
  resendCode,
  verifyRegister,
} from "../controllers/signUpController";
import {
  sendResetCode,
  verifyResetPassword,
  updateNewPassword,
} from "../controllers/passController";
import { login } from "../controllers/loginController";

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
