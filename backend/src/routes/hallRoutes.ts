import { Router } from "express";
import { sessionAuthenticate } from "../middleware/sessionMiddleware";
import { charge, confirmPayment } from "../controllers/hallPaymentController";
import { ownerHalls } from "../controllers/ownerHallsController";
import {
  getHall,
  updateHall,
  deleteHall,
} from "../controllers/manageHallController";
import { getHallComments } from "../controllers/hallCommentsController";

const router = Router();

// Pay for hall activation (returns Stripe Payment Sheet secret)
router.post("/charge", sessionAuthenticate, charge);

// Confirm payment success → activate the hall
router.post("/confirm-payment", sessionAuthenticate, confirmPayment);

// Get owner's halls
router.get("/owner-halls", sessionAuthenticate, ownerHalls);

// Manage hall routes
router.get("/:id", sessionAuthenticate, getHall);
router.put("/:id", sessionAuthenticate, updateHall);
router.delete("/:id", sessionAuthenticate, deleteHall);

router.get("/:id/comments", sessionAuthenticate, getHallComments);

export default router;
