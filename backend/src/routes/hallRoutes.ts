import { Router } from "express";
import { sessionAuthenticate } from "../middleware/sessionMiddleware";
import { addHall } from "../controllers/addHallController";
import { charge, confirmPayment } from "../controllers/hallPaymentController";
import { ownerHalls } from "../controllers/ownerHallsController";

const router = Router();

// Create a new hall
router.post("/add", sessionAuthenticate, addHall);

// Pay for hall activation (returns Stripe Payment Sheet secret)
router.post("/charge", sessionAuthenticate, charge);

// Confirm payment success → activate the hall
router.post("/confirm-payment", sessionAuthenticate, confirmPayment);

// Get owner's halls
router.get("/owner-halls", sessionAuthenticate, ownerHalls);

export default router;
