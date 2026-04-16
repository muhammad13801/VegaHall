import { getAllHalls, getHallById, searchHalls, getBusyDates } from "../controllers/hallsController";
import { getFavorites, toggleFavorite } from "../controllers/favoritesController";
import { getBookings, createBooking, cancelBooking, requestReschedule } from "../controllers/bookingsController";
import { respondReschedule } from "../controllers/manageBookingsController";
import { getHallRatings, createRating } from "../controllers/ratingsController";
import { Router } from "express";
import { sessionAuthenticate } from "../middleware/sessionMiddleware";
import { chargeBooking, confirmBookingPayment } from "../controllers/bookingPaymentController";

const router = Router();

// Payment Routes
router.post("/charge-booking", sessionAuthenticate, chargeBooking);
router.post("/confirm-booking-payment", sessionAuthenticate, confirmBookingPayment);

// Hall Routes
router.get("/halls", sessionAuthenticate, getAllHalls);
router.get("/halls/:id", sessionAuthenticate, getHallById);
router.get("/halls/:id/busy-dates", sessionAuthenticate, getBusyDates);
router.post("/search", sessionAuthenticate, searchHalls);

// Favorites Routes
router.get("/favorites", sessionAuthenticate, getFavorites);
router.post("/favorites/toggle", sessionAuthenticate, toggleFavorite);

// Booking Routes
router.get("/bookings", sessionAuthenticate, getBookings);
router.post("/bookings", sessionAuthenticate, createBooking);
router.put("/bookings/:id/cancel", sessionAuthenticate, cancelBooking);
router.patch("/bookings/:id/reschedule/respond", sessionAuthenticate, respondReschedule);
router.post("/bookings/:id/request-reschedule", sessionAuthenticate, requestReschedule);

// Ratings Routes
router.get("/halls/:hallId/ratings", getHallRatings);
router.post("/ratings", sessionAuthenticate, createRating);

export default router;