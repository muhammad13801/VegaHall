import sql from "../../db.js";
import cron from "node-cron";
import { insertNotification } from "../userControllers/notificationsController.js";
export const getHallRatings = async (req, res) => {
    try {
        const hallId = Number(req.params.hallId);
        const ratings = await sql `
      SELECT r.*, CONCAT(u.first_name, ' ', u.last_name) as user_name
      FROM ratings r
      JOIN users u ON r.customer_id = u.id
      WHERE r.hall_id = ${hallId}
      ORDER BY r.created_at DESC
    `;
        res.json(ratings);
    }
    catch (error) {
        res.status(500).send("❌ خطأ في الخادم: " + error.message);
    }
};
export const createRating = async (req, res) => {
    try {
        const userId = req.userId;
        const { hallId, bookingId, rating, comment } = req.body;
        if (!userId)
            return res.status(401).send("Unauthorized");
        // Check if user actually booked this hall
        const [booking] = await sql `
      SELECT id FROM bookings WHERE id = ${bookingId} AND customer_id = ${userId} AND hall_id = ${hallId}
    `;
        if (!booking)
            return res.status(403).send("❌ لا يمكنك تقييم صالة لم تحجزها");
        // Check if already rated
        const [existing] = await sql `
        SELECT id FROM ratings WHERE booking_id = ${bookingId}
    `;
        if (existing)
            return res.status(400).send("❌ لقد قمت بتقييم هذا الحجز مسبقاً");
        const [newRating] = await sql `
      INSERT INTO ratings (hall_id, customer_id, booking_id, rating, comment)
      VALUES (${hallId}, ${userId}, ${bookingId}, ${rating}, ${comment})
      RETURNING *
    `;
        res.status(201).json(newRating);
    }
    catch (error) {
        res.status(500).send("❌ خطأ في الخادم: " + error.message);
    }
};
// Run every day at 12:00 PM (noon) to remind about yesterday's events
cron.schedule("0 12 * * *", async () => {
    try {
        console.log("Running hall rating reminder job...");
        const pastBookings = await sql `
      SELECT b.id, b.customer_id, h.hall_name 
      FROM bookings b
      JOIN halls h ON b.hall_id = h.id
      LEFT JOIN ratings r ON r.booking_id = b.id
      WHERE b.status = 'confirmed' 
        AND b.booking_date::date = CURRENT_DATE - INTERVAL '1 day'
        AND r.id IS NULL
    `;
        for (const booking of pastBookings) {
            await insertNotification(booking.customer_id, "شاركونا رأيكم! ⭐", `يرجى تقييم الصالة (${booking.hall_name}) عن طريق قائمة "حجوزاتي".`, "rate_hall");
        }
    }
    catch (err) {
        console.error("Cron error in rating reminder:", err);
    }
});
