import { Response } from "express";
import sql from "../db";
import { AuthRequest } from "../middleware/sessionMiddleware";
import { insertNotification } from "./notificationsController";


export const getBookings = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).send("❌ مستخدم غير مصرح");

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 5;
  const offset = (page - 1) * limit;

  try {
    const bookings = await sql`
      SELECT 
        b.id,
        b.booking_date,
        b.booking_date as date,
        b.status,
        b.guests_number,
        b.guests_number as guest_count,
        b.guests_number as guestCount,
        h.id as hall_id,
        h.hall_name, 
        h.hall_name as hallName,
        h.city as hall_location,
        h.city as hallCity,
        b.proposed_date,
        (SELECT amount FROM customer_payments WHERE booking_id = b.id LIMIT 1) as total_cost,
        (SELECT amount FROM customer_payments WHERE booking_id = b.id LIMIT 1) as totalCost,
        COALESCE(
          (SELECT json_agg(url) FROM media WHERE hall_id = h.id AND type = 'image'),
          '[]'::json
        ) as hall_images
      FROM bookings b
      JOIN halls h ON b.hall_id = h.id
      WHERE b.customer_id = ${userId}
      ORDER BY 
        CASE WHEN b.status = 'owner_rescheduled' THEN 0 ELSE 1 END,
        b.booking_date DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

export const createBooking = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).send("❌ مستخدم غير مصرح");

  const { hallId, bookingDate, guestCount } = req.body;

  try {
    await sql`
      INSERT INTO bookings (hall_id, customer_id, booking_date, status, guests_number)
      VALUES (${hallId}, ${userId}, ${bookingDate}, 'confirmed', ${guestCount})
    `;

    res.send("✅ تم حجز الصالة بنجاح");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).send("❌ مستخدم غير مصرح");

  const id = Number(req.params.id);

  try {
    const [booking] = await sql`
      SELECT b.*, h.owner_id, h.hall_name 
      FROM bookings b
      JOIN halls h ON h.id = b.hall_id
      WHERE b.id = ${id} AND b.customer_id = ${userId}
    `;

    if (!booking) return res.status(404).send("❌ الحجز غير موجود");
    if (booking.status === 'customer_cancelled') return res.status(400).send("❌ الحجز ملغي بالفعل");

    await sql`
      UPDATE bookings SET status = 'customer_cancelled' WHERE id = ${id}
    `;

    // Notify the hall owner
    await insertNotification(
      booking.owner_id,
      "إلغاء حجز",
      `قام العميل بإلغاء حجز في صالة ${booking.hall_name}. يرجى مراجعة إدارة الحجوزات.`,
      "customer_cancel"
    );

    res.json({ message: "✅ تم إلغاء الحجز بنجاح" });
  } catch (err) {

    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};
