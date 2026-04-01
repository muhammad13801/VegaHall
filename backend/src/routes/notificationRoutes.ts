import { Router } from "express";
import { sessionAuthenticate } from "../middleware/sessionMiddleware";
import { getNotifications } from "../controllers/notificationsController";

const router = Router();

// GET /notifications — fetch notifications for the logged-in user
router.get("/", sessionAuthenticate, getNotifications);

export default router;
