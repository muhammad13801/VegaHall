import { Router } from "express";
import { sessionAuthenticate } from "../middleware/sessionMiddleware";
import { charge, confirmPayment } from "../controllers/hallPaymentController";
import { ownerHalls } from "../controllers/ownerHallsController";
import { getHall, updateHall } from "../controllers/manageHallController";
import { getHallComments } from "../controllers/hallCommentsController";
import {
  getOwnerBookings,
  ownerCancelBooking,
  customerCancelResponse,
  proposeReschedule,
  respondReschedule,
  customerCancelBooking,
} from "../controllers/manageBookingsController";
import { getServices } from "../controllers/getServicesController";
import { getMealTypes } from "../controllers/getMealTypesController";
import {
  requestMeal,
  requestService,
} from "../controllers/serviceRequestsController";

const router = Router();

// Pay for hall activation (returns Stripe Payment Sheet secret)
router.post("/charge", sessionAuthenticate, charge);

// Confirm payment success → activate the hall
router.post("/confirm-payment", sessionAuthenticate, confirmPayment);

// Get owner's halls
router.get("/owner-halls", sessionAuthenticate, ownerHalls);

// Booking management routes — MUST be before /:id to avoid route collision
router.get("/bookings", sessionAuthenticate, getOwnerBookings);

// Owner proposes a new date → status: owner_rescheduled
router.patch(
  "/bookings/:id/propose-reschedule",
  sessionAuthenticate,
  proposeReschedule,
);

// Customer responds to owner's reschedule proposal (accept/reject)
router.patch(
  "/bookings/:id/reschedule/respond",
  sessionAuthenticate,
  respondReschedule,
);

// Customer cancels their booking → status: customer_cancelled
router.patch(
  "/bookings/:id/customer-cancel",
  sessionAuthenticate,
  customerCancelBooking,
);

// Owner responds to customer cancellation → decides refund or not
router.patch(
  "/bookings/:id/customer-cancel-response",
  sessionAuthenticate,
  customerCancelResponse,
);

// Owner cancels the booking → status: owner_cancelled, refund is automatic
router.patch(
  "/bookings/:id/owner-cancel",
  sessionAuthenticate,
  ownerCancelBooking,
);

// Get services
router.get("/services", sessionAuthenticate, getServices);

// Get meal types
router.get("/meal-types", sessionAuthenticate, getMealTypes);

// Manage hall routes (dynamic :id — comes AFTER static routes)
router.get("/:id", sessionAuthenticate, getHall);
router.put("/:id", sessionAuthenticate, updateHall);

// Get hall comments
router.get("/:id/comments", sessionAuthenticate, getHallComments);

// post hall request meal
router.post("/request-meal", sessionAuthenticate, requestMeal);

// post hall request service
router.post("/request-service", sessionAuthenticate, requestService);

export default router;
