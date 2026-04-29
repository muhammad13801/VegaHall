import { getAllHalls, getHallById, searchHalls, getBusyDates, } from "../controllers/customerControllers/hallsController.js";
import { getFavorites, toggleFavorite, } from "../controllers/customerControllers/favoritesController.js";
import { getBookings, createBooking, cancelBooking, requestReschedule, } from "../controllers/customerControllers/bookingsController.js";
import { respondReschedule } from "../controllers/hallOwnerControllers/manageBookingsController.js";
import { getHallRatings, createRating, } from "../controllers/customerControllers/ratingsController.js";
import { Router } from "express";
import { sessionAuthenticate } from "../middleware/sessionMiddleware.js";
import { chargeBooking, confirmBookingPayment, } from "../controllers/customerControllers/bookingPaymentController.js";
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
