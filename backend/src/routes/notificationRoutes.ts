import { Router } from "express";
import { sessionAuthenticate } from "../middleware/sessionMiddleware.js";
import {
  getNotifications,
  savePushToken,
} from "../controllers/userControllers/notificationsController.js";

const router = Router();

// GET /notifications — fetch notifications for the logged-in user
router.get("/", sessionAuthenticate, getNotifications);
router.patch("/token", sessionAuthenticate, savePushToken);

export default router;
