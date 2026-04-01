import { Response } from "express";
import sql from "../db";
import { AuthRequest } from "../middleware/sessionMiddleware";

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
        b.status,
        b.guests_number,
        b.services,
        h.id as hall_id,
        h.hall_name, 
        h.location as hall_location,
        COALESCE(
          (SELECT json_agg(url) FROM media WHERE hall_id = h.id AND type = 'image'),
          '[]'::json
        ) as hall_images
      FROM bookings b
      JOIN halls h ON b.hall_id = h.id
      WHERE b.customer_id = ${userId}
      ORDER BY b.booking_date DESC
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

  const { hallId, bookingDate, guestCount, services } = req.body;

  try {
    await sql`
      INSERT INTO bookings (hall_id, customer_id, booking_date, status, guests_number, services)
      VALUES (${hallId}, ${userId}, ${bookingDate}, 'Confirmed', ${guestCount}, ${JSON.stringify(services || [])}::jsonb)
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
      SELECT * FROM bookings WHERE id = ${id} AND customer_id = ${userId}
    `;

    if (!booking) return res.status(404).send("❌ الحجز غير موجود");
    if (booking.status !== 'pending') return res.status(400).send("❌ لا يمكن إلغاء حجز غير معلق");

    await sql`
      UPDATE bookings SET status = 'cancelled' WHERE id = ${id}
    `;

    res.json({ message: "✅ تم إلغاء الحجز بنجاح" });
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};
