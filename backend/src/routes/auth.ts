import { Router } from "express";
import {
  register,
  resendCode,
  verifyCode,
} from "../controllers/authController";

const router = Router();

router.post("/register", register);
router.post("/verify", verifyCode);
router.post("/resend-code", resendCode);

export default router;
