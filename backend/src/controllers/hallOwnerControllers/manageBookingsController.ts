import type { Response } from "express";
import type { AuthRequest } from "../../middleware/sessionMiddleware.js";
import sql from "../../db.js";
import { insertNotification } from "../userControllers/notificationsController.js";
import refundPayment from "../../utils/refundPayment.js";
import { resetExpiredProposedDates } from "../../utils/resetExpiredProposedDates.js";

interface Booking {
  id: number;
  hall_id: number;
  hall_name: string;
  customer_id: number;
  customer_first_name: string;
  customer_last_name: string;
  booking_date: string;
  guests_number: number;
  status: string;
  proposed_date: string | null;
  amount?: number;
  payment_intent_id?: string;
  owner_id?: number;
}

// GET /halls/bookings — owner sees all bookings for their halls
export const getOwnerBookings = async (req: AuthRequest, res: Response) => {
  try {
    // Reset any expired proposed dates first
    await resetExpiredProposedDates();

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

    const bookingIds = bookings.map((b) => b.id);

    const [services, meals] = await Promise.all([
      sql<
        {
          booking_id: number;
          service_id: number;
          name: string;
          price: number;
        }[]
      >`
        SELECT bs.booking_id, bs.service_id, s.name, bs.price
        FROM booking_services bs
        JOIN services s ON s.id = bs.service_id
        WHERE bs.booking_id IN ${sql(bookingIds)}
      `,
      sql<
        {
          booking_id: number;
          meal_type_id: number;
          name: string;
          price_per_person: number;
        }[]
      >`
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

// PATCH /halls/bookings/:id/propose-reschedule
// Owner proposes a new date → status becomes owner_rescheduled
export const proposeReschedule = async (req: AuthRequest, res: Response) => {
  try {
    // Reset any expired proposed dates first
    await resetExpiredProposedDates();

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
      return res.status(400).send("❌ لا يمكن تعديل موعد حجز غير مؤكد");

    await sql`
      UPDATE bookings
      SET status = 'owner_rescheduled', proposed_date = ${proposed_date}, proposed_date_set_at = NOW()
      WHERE id = ${id}
    `;

    const formattedDate = new Date(proposed_date).toLocaleDateString(
      "ar-IL-u-nu-latn",
      {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      },
    );

    await insertNotification(
      booking.customer_id,
      "طلب تغيير موعد الحجز",
      `اقترح صاحب صالة (${booking.hall_name}) تغيير موعد حجزك إلى ${formattedDate}. يرجى القبول أو الرفض من "حجوزاتي".`,
      "reschedule",
    );

    res.send("✔️ تم إرسال طلب الموعد الجديد للعميل");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

// PATCH /halls/bookings/:id/reschedule/respond
// Customer accepts or rejects the owner's proposed date
export const respondReschedule = async (req: AuthRequest, res: Response) => {
  try {
    // Reset any expired proposed dates first
    await resetExpiredProposedDates();

    const { id } = req.params;
    const { accept } = req.body;
    if (!id) return res.status(400).send("❌ معرف غير صالح");

    const [booking] = await sql<Booking[]>`
      SELECT b.id, b.customer_id, b.hall_id, h.hall_name, b.status, b.proposed_date, h.owner_id, u.first_name, u.last_name
      FROM bookings b
      JOIN users u ON u.id = b.customer_id
      JOIN halls h ON h.id = b.hall_id
      LEFT JOIN customer_payments p ON p.booking_id = b.id
      WHERE b.id = ${id} AND b.customer_id = ${req.userId!}
    `;
    if (!booking) return res.status(403).send("❌ غير مصرح");
    if (booking.status !== "owner_rescheduled")
      return res.status(400).send("❌ لا يوجد طلب تعديل موعد نشط لهذا الحجز");

    if (accept) {
      await sql`
        UPDATE bookings
        SET booking_date = ${booking.proposed_date},
            proposed_date = NULL,
            proposed_date_set_at = NULL,
            status = 'confirmed'
        WHERE id = ${id}
      `;
      await insertNotification(
        booking.owner_id!,
        "تم قبول تعديل الموعد",
        `وافق ${booking.customer_first_name} ${booking.customer_last_name} على الموعد المقترح من قبلك للحجز في صالتك (${booking.hall_name}).`,
        "reschedule_accept",
      );
    } else {
      await sql`
        UPDATE bookings
        SET status = 'confirmed', proposed_date = NULL, proposed_date_set_at = NULL
        WHERE id = ${id}
      `;
      await insertNotification(
        booking.owner_id!,
        "تم رفض تعديل الموعد",
        `رفض ${booking.customer_first_name} ${booking.customer_last_name} تعديل الموعد المقترح من قبلك للحجز في صالتك (${booking.hall_name}). سيبقى الحجز في موعده الاصلي.`,
        "reschedule_reject",
      );
    }

    res.send(accept ? "✔️ تم قبول الموعد الجديد" : "✔️ تم رفض الموعد الجديد");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

// PATCH /halls/bookings/:id/owner-cancel
// Owner cancels the booking → refund is automatic, no choice
export const ownerCancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).send("❌ معرف غير صالح");

    const [booking] = await sql<Booking[]>`
      SELECT b.id, b.customer_id, b.hall_id, b.status,
             h.hall_name, p.amount, p.payment_intent_id
      FROM bookings b
      JOIN halls h ON h.id = b.hall_id
      LEFT JOIN customer_payments p ON p.booking_id = b.id
      WHERE b.id = ${id} AND h.owner_id = ${req.userId!}
    `;

    if (!booking) return res.status(403).send("❌ غير مصرح");

    if (booking.payment_intent_id) {
      try {
        const [payment] = await sql`
          SELECT status FROM customer_payments WHERE booking_id = ${id}
        `;

        if (payment?.type === "refund") throw new Error("ALREADY_REFUNDED");

        await refundPayment(booking.payment_intent_id);

        await sql`
          UPDATE customer_payments
          SET status = 'success', type = 'refund'
          WHERE booking_id = ${id}
        `;
      } catch (err: any) {
        console.error("Refund failed:", err);

        if (err.message === "ALREADY_REFUNDED")
          return res.status(400).send("❌ تم استرجاع المبلغ مسبقاً");

        if (err.message === "REFUND_FAILED")
          return res.status(500).send("❌ فشل في استرجاع المبلغ");

        if (err.raw?.message)
          return res.status(400).send(`❌ ${err.raw.message}`);

        return res.status(500).send("❌ خطأ أثناء استرجاع المبلغ");
      }
    }

    if (
      booking.status !== "confirmed" &&
      booking.status !== "owner_rescheduled"
    )
      return res.status(400).send("❌ لا يمكن إلغاء هذا الحجز");

    // 1. Cancel booking first
    await sql`
      UPDATE bookings
      SET status = 'owner_cancelled'
      WHERE id = ${id}
    `;

    await insertNotification(
      booking.customer_id,
      "قام صاحب الصالة بإلغاء حجزك",
      `نأسف، قام صاحب صالة (${booking.hall_name}) بإلغاء حجزك. سيتم استرجاع المبلغ تلقائياً.`,
      "cancel",
    );

    res.send("✔️ تم إلغاء الحجز وإصدار استرجاع المبلغ");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

// PATCH /halls/bookings/:id/customer-cancel
// Customer cancels their own booking → status becomes customer_cancelled
// Owner will then decide whether to refund or not
export const customerCancelBooking = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).send("❌ معرف غير صالح");

    const [booking] = await sql<Booking[]>`
      SELECT b.id, b.customer_id, b.hall_id, h.hall_name, h.owner_id
      FROM bookings b
      JOIN halls h ON h.id = b.hall_id
      WHERE b.id = ${id} AND b.customer_id = ${req.userId!}
    `;
    if (!booking) return res.status(403).send("❌ غير مصرح");
    if (
      booking.status !== "confirmed" &&
      booking.status !== "owner_rescheduled"
    )
      return res.status(400).send("❌ لا يمكن إلغاء هذا الحجز");

    await sql`UPDATE bookings SET status = 'customer_cancelled' WHERE id = ${id}`;

    await insertNotification(
      booking.owner_id!,
      "طلب إلغاء حجز من العميل",
      `قام العميل بإلغاء حجزه في صالة (${booking.hall_name}). يرجى اتخاذ قرار بشأن استرجاع المبلغ.`,
      "customer_cancel",
    );

    res.send("✔️ تم إلغاء الحجز بنجاح");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

// PATCH /halls/bookings/:id/customer-cancel-response
// Owner responds to a customer cancellation → decides whether to refund or not
export const customerCancelResponse = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { refund } = req.body;

    if (!id || refund === undefined)
      return res.status(400).send("❌ معرف غير صالح أو قرار مفقود");

    const [booking] = await sql<Booking[]>`
      SELECT b.id, b.customer_id, b.hall_id, b.status,
             h.hall_name, p.payment_intent_id
      FROM bookings b
      JOIN halls h ON h.id = b.hall_id
      LEFT JOIN customer_payments p ON p.booking_id = b.id
      WHERE b.id = ${id} AND h.owner_id = ${req.userId!}
    `;

    if (!booking) return res.status(403).send("❌ غير مصرح");

    if (booking.status !== "customer_cancelled")
      return res.status(400).send("❌ لم يتم إلغاء هذا الحجز من العميل");

    // REFUND FLOW
    if (refund && booking.payment_intent_id) {
      try {
        const [payment] = await sql`
          SELECT status FROM customer_payments WHERE booking_id = ${id}
        `;

        if (payment?.type === "refund") throw new Error("ALREADY_REFUNDED");

        await refundPayment(booking.payment_intent_id);

        await sql`
          UPDATE customer_payments
          SET status = 'success', type = 'refund'
          WHERE booking_id = ${id}
        `;
      } catch (err: any) {
        console.error("Refund failed:", err);

        if (err.message === "ALREADY_REFUNDED")
          return res.status(400).send("❌ تم استرجاع المبلغ مسبقاً");

        if (err.message === "REFUND_FAILED")
          return res.status(500).send("❌ فشل في استرجاع المبلغ");

        if (err.raw?.message)
          return res.status(400).send(`❌ ${err.raw.message}`);

        return res.status(500).send("❌ خطأ أثناء استرجاع المبلغ");
      }
    }

    await insertNotification(
      booking.customer_id,
      refund ? "تم استرجاع مبلغ حجزك" : "تم رفض استرجاع المبلغ",
      refund
        ? `قرر صاحب صالة (${booking.hall_name}) استرجاع المبلغ المدفوع كاملاً.`
        : `قرر صاحب صالة (${booking.hall_name}) عدم استرجاع المبلغ المدفوع.`,
      refund ? "refund_approved" : "refund_rejected",
    );

    await sql`
      UPDATE bookings
      SET status = 'customer_cancelled_resolved'
      WHERE id = ${id}
    `;

    res.send(refund ? "✔️ تم قبول استرجاع المبلغ" : "✔️ تم رفض استرجاع المبلغ");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};
