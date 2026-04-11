import { Response } from "express";
import { AuthRequest } from "../middleware/sessionMiddleware";
import sql from "../db";
import { insertNotification } from "./notificationsController";
import { HallService } from "./manageHallController";

interface Booking {
  id: number;
  hall_id: number;
  hall_name: string;
  customer_id: number;
  booking_date: string;
  guests_number: number;
  services: HallService[] | null;
  status: string;
  proposed_date: string | null;
  amount?: number;
  payment_intent_id?: string;
  owner_id?: number;
}

// GET /halls/bookings — owner sees all bookings for their halls
export const getOwnerBookings = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const bookings = await sql<Booking[]>`
      SELECT
        b.id,
        b.hall_id,
        h.hall_name,
        b.customer_id,
        u.first_name AS customer_first_name,
        u.last_name  AS customer_last_name,
        b.booking_date,
        b.guests_number,
        b.status,
        b.proposed_date,
        p.payment_intent_id,
        p.amount
      FROM bookings b
      JOIN halls h ON h.id = b.hall_id
      JOIN users u ON u.id = b.customer_id
      LEFT JOIN customer_payments p ON p.booking_id = b.id
      WHERE h.owner_id = ${req.userId!}
      ORDER BY b.id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    if (!bookings) return res.status(404).send("❌ لا توجد حجوزات");

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

// PATCH /halls/bookings/:id/propose-reschedule — owner proposes a new date
export const proposeReschedule = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { proposed_date } = req.body;
    if (!id || !proposed_date)
      return res.status(400).send("❌ معرف غير صالح أو تاريخ مفقود");

    const [booking] = await sql<Booking[]>`
      SELECT b.id, b.customer_id, b.hall_id, h.hall_name, b.status
      FROM bookings b
      JOIN halls h ON h.id = b.hall_id
      WHERE b.id = ${id} AND h.owner_id = ${req.userId!}
    `;
    if (!booking) return res.status(403).send("❌ غير مصرح");
    if (booking.status !== "confirmed")
      return res.status(400).send("❌ لا يمكن تعديل موعد حجز ليس في حالة مؤكد");

    await sql`
      UPDATE bookings
      SET status = 'rescheduled', proposed_date = ${proposed_date}
      WHERE id = ${id}
    `;

    const formattedDate = new Date(proposed_date).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    await insertNotification(
      booking.customer_id,
      "طلب تغيير موعد الحجز",
      `اقترح صاحب صالة ${booking.hall_name} تغيير موعد حجزك إلى ${formattedDate}. يرجى القبول أو الرفض.`,
      "reschedule",
    );

    res.send("✔️ تم إرسال طلب الموعد الجديد للعميل");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

// PATCH /halls/bookings/:id/reschedule/respond — customer accepts or rejects
export const respondReschedule = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { accept } = req.body;
    if (!id) return res.status(400).send("❌ معرف غير صالح");

    const [booking] = await sql<Booking[]>`
      SELECT b.id, b.customer_id, b.hall_id, h.hall_name, b.status, b.proposed_date, h.owner_id
      FROM bookings b
      JOIN halls h ON h.id = b.hall_id
      LEFT JOIN customer_payments p ON p.booking_id = b.id
      WHERE b.id = ${id} AND b.customer_id = ${req.userId!}
    `;
    if (!booking) return res.status(403).send("❌ غير مصرح");
    if (booking.status !== "rescheduled")
      return res.status(400).send("❌ لا يوجد طلب تعديل موعد نشط لهذا الحجز");

    if (accept) {
      await sql`
        UPDATE bookings
        SET booking_date = ${booking.proposed_date},
            proposed_date = NULL,
            status = 'confirmed'
        WHERE id = ${id}
      `;
      await insertNotification(
        booking.owner_id!,
        "تم قبول تعديل الموعد",
        `وافق العميل على تعديل موعد الحجز في صالة ${booking.hall_name}.`,
        "reschedule_accept",
      );
    } else {
      await sql`
        UPDATE bookings
        SET status = 'confirmed', proposed_date = NULL
        WHERE id = ${id}
      `;
      await insertNotification(
        booking.owner_id!,
        "تم رفض تعديل الموعد",
        `رفض العميل تعديل موعد الحجز في صالة ${booking.hall_name}. سيبقى الموعد الأصلي.`,
        "reschedule_reject",
      );
    }

    res.send(accept ? "✔️ تم قبول الموعد الجديد" : "✔️ تم رفض الموعد الجديد");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

// PATCH /halls/bookings/:id/reject — owner rejects (cancels) the booking + refund
export const rejectBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).send("❌ معرف غير صالح");

    const [booking] = await sql<Booking[]>`
      SELECT b.id, b.customer_id, b.hall_id, h.hall_name, p.amount, p.payment_intent_id
      FROM bookings b
      JOIN halls h ON h.id = b.hall_id
      LEFT JOIN customer_payments p ON p.booking_id = b.id
      WHERE b.id = ${id} AND h.owner_id = ${req.userId!}
    `;
    if (!booking) return res.status(403).send("❌ غير مصرح");

    await sql`UPDATE bookings SET status = 'cancelled' WHERE id = ${id}`;

    if (booking.payment_intent_id) {
      await sql`
        UPDATE customer_payments SET status = 'failed', type = 'refund'
        WHERE booking_id = ${id}
      `;
      // TODO: Call stripe.refunds.create({ payment_intent: booking.payment_intent_id })
    }

    await insertNotification(
      booking.customer_id,
      "تم رفض حجزك",
      `نأسف، قام صاحب الصالة برفض حجزك في صالة ${booking.hall_name}. سيتم استرجاع المبلغ تلقائياً.`,
      "cancel",
    );

    res.send("✔️ تم رفض الحجز وإصدار طلب استرجاع المبلغ");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

// PATCH /halls/bookings/:id/cancel — customer cancels their own booking
export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).send("❌ معرف غير صالح");

    const [booking] = await sql<Booking[]>`
      SELECT b.id, b.customer_id, b.hall_id, h.hall_name, h.owner_id, p.payment_intent_id
      FROM bookings b
      JOIN halls h ON h.id = b.hall_id
      LEFT JOIN customer_payments p ON p.booking_id = b.id
      WHERE b.id = ${id} AND b.customer_id = ${req.userId!}
    `;
    if (!booking) return res.status(403).send("❌ غير مصرح");

    await sql`UPDATE bookings SET status = 'cancelled' WHERE id = ${id}`;

    await insertNotification(
      booking.owner_id!,
      "حجز تم إلغاؤه من قبل العميل",
      `قام العميل بإلغاء حجزه في صالة ${booking.hall_name}.`,
      "customer_cancel",
    );

    res.send("✔️ تم إلغاء الحجز بنجاح");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};
