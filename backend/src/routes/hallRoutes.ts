import { Router } from "express";
import { sessionAuthenticate } from "../middleware/sessionMiddleware";
import { charge, confirmPayment } from "../controllers/hallPaymentController";
import { ownerHalls } from "../controllers/ownerHallsController";
import { getHall, updateHall } from "../controllers/manageHallController";
import { getHallComments } from "../controllers/hallCommentsController";
import {
  getOwnerBookings,
  rejectBooking,
  proposeReschedule,
  respondReschedule,
  cancelBooking,
} from "../controllers/manageBookingsController";
import { getServices } from "../controllers/getServicesController";
import { getMealTypes } from "../controllers/getMealTypesController";

const router = Router();

// Pay for hall activation (returns Stripe Payment Sheet secret)
router.post("/charge", sessionAuthenticate, charge);

// Confirm payment success → activate the hall
router.post("/confirm-payment", sessionAuthenticate, confirmPayment);

// Get owner's halls
router.get("/owner-halls", sessionAuthenticate, ownerHalls);

// Booking management routes — MUST be before /:id to avoid route collision
router.get("/bookings", sessionAuthenticate, getOwnerBookings);

// Owner proposes a new date for reschedule
router.patch(
  "/bookings/:id/propose-reschedule",
  sessionAuthenticate,
  proposeReschedule,
);

// Customer responds to reschedule request (accept/reject)
router.patch(
  "/bookings/:id/reschedule/respond",
  sessionAuthenticate,
  respondReschedule,
);

// Owner rejects booking → triggers refund
router.patch("/bookings/:id/reject", sessionAuthenticate, rejectBooking);

// Customer cancels booking → owner decides whether to refund
router.patch("/bookings/:id/cancel", sessionAuthenticate, cancelBooking);

// Get services
router.get("/services", sessionAuthenticate, getServices);

// Get meal types
router.get("/meal-types", sessionAuthenticate, getMealTypes);

// Manage hall routes (dynamic :id — comes AFTER static routes)
router.get("/:id", sessionAuthenticate, getHall);
router.put("/:id", sessionAuthenticate, updateHall);

// Get hall comments
router.get("/:id/comments", sessionAuthenticate, getHallComments);

export default router;
