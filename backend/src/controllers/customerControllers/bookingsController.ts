import type { Response } from "express";
import sql from "../../db.js";
import type { AuthRequest } from "../../middleware/sessionMiddleware.js";
import { insertNotification } from "../userControllers/notificationsController.js";
import { resetExpiredProposedDates } from "../../utils/resetExpiredProposedDates.js";

export const getBookings = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).send("❌ مستخدم غير مصرح");

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;
  try {
    await resetExpiredProposedDates();
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
        (SELECT type FROM customer_payments WHERE booking_id = b.id LIMIT 1) as payment_type,
        COALESCE(
          (SELECT json_agg(url) FROM media WHERE hall_id = h.id AND type = 'image'),
          '[]'::json
        ) as hall_images,
        EXISTS(SELECT 1 FROM ratings r WHERE r.booking_id = b.id) as is_rated
      FROM bookings b
      JOIN halls h ON b.hall_id = h.id
      WHERE b.customer_id = ${userId}
      ORDER BY 
        CASE WHEN b.status = 'owner_rescheduled' THEN 0 ELSE 1 END,
        b.booking_date DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    if (!bookings || bookings.length === 0) return res.json([]);

    const bookingIds = bookings.map((b) => b.id);

    const [services, meals] = await Promise.all([
      sql`
        SELECT bs.booking_id, bs.service_id, s.name, bs.price
        FROM booking_services bs
        JOIN services s ON s.id = bs.service_id
        WHERE bs.booking_id IN ${sql(bookingIds)}
      `,
      sql`
        SELECT bm.booking_id, bm.meal_type_id, mt.name, bm.price_per_person
        FROM booking_meals bm
        JOIN meal_types mt ON mt.id = bm.meal_type_id
        WHERE bm.booking_id IN ${sql(bookingIds)}
      `,
    ]);

    const result = bookings.map((booking) => ({
      ...booking,
      services: services
        .filter((s) => s.booking_id === booking.id)
        .map(({ service_id, name, price }) => ({ service_id, name, price })),
      meals: meals
        .filter((m) => m.booking_id === booking.id)
        .map(({ meal_type_id, name, price_per_person }) => ({
          meal_type_id,
          name,
          price_per_person,
        })),
    }));

    res.json(result);
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

    res.send("✔️ تم حجز الصالة بنجاح");
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
      SELECT b.*, h.owner_id, h.hall_name, u.first_name, u.last_name
      FROM bookings b
      JOIN halls h ON h.id = b.hall_id
      JOIN users u ON u.id = b.customer_id
      WHERE b.id = ${id} AND b.customer_id = ${userId}
    `;

    if (!booking) return res.status(404).send("❌ الحجز غير موجود");
    if (booking.status === "customer_cancelled")
      return res.status(400).send("❌ الحجز ملغي بالفعل");

    await sql`
      UPDATE bookings SET status = 'customer_cancelled' WHERE id = ${id}
    `;

    // Notify the hall owner
    await insertNotification(
      booking.owner_id,
      "إلغاء حجز",
      `قام ${booking.first_name} ${booking.last_name} بالغاء حجز صالتك (${booking.hall_name}) يرجى مراجعة "الحجوزات"`,
      "customer_cancel",
    );

    res.send("✔️ تم إلغاء الحجز بنجاح");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

export const requestReschedule = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).send("❌ مستخدم غير مصرح");

  // Reset any expired proposed dates first
  await resetExpiredProposedDates();

  const id = Number(req.params.id);
  const { proposed_date } = req.body;
  if (!proposed_date) return res.status(400).send("❌ تاريخ مقترح مفقود");

  try {
    const [booking] = await sql`
      SELECT b.id, b.status, b.booking_date, h.hall_name, h.owner_id, u.first_name, u.last_name
      FROM bookings b
      JOIN halls h ON h.id = b.hall_id
      JOIN users u ON u.id = b.customer_id
      WHERE b.id = ${id} AND b.customer_id = ${userId}
    `;

    if (!booking) return res.status(404).send("❌ الحجز غير موجود");

    const formatDate = (date: any) =>
      new Date(date).toLocaleDateString("ar-IL-u-nu-latn", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

    const oldDateFormatted = formatDate(booking.booking_date);
    const newDateFormatted = formatDate(proposed_date);

    await sql`
      UPDATE bookings SET booking_date = ${proposed_date} WHERE id = ${id}
    `;

    await insertNotification(
      booking.owner_id,
      "تعديل موعد حجز",
      `قام ${booking.first_name} ${booking.last_name} بتغيير موعد حجز صالتك (${booking.hall_name}) من تاريخ ${oldDateFormatted} الى ${newDateFormatted} للمزيد من التفاصيل الرجاء الاطلاع على "الحجوزات"`,
      "reschedule_request",
    );

    res.json({ message: "✔️ تم تعديل الموعد بنجاح" });
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};
