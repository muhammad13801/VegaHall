import { Response } from "express";
import { AuthRequest } from "../middleware/sessionMiddleware";
import Stripe from "stripe";
import sql from "../db";
import { insertNotification } from "./notificationsController";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

// POST /customer/charge-booking
export const chargeBooking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { amount } = req.body;

    if (!userId) return res.status(401).send("❌ مستخدم غير مصرح");
    if (!amount) return res.status(400).send("❌ المبلغ مطلوب");

    // In a real app, you'd validate the amount against the hall price + services
    // For now, we'll use the amount sent from the frontend (converted to cents for Stripe)
    const amountInCents = Math.round(amount * 100);

    const customer = await stripe.customers.create();

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2026-02-25.clover" },
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "ils", // Using ILS since the frontend uses ₪
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
      metadata: { userId: String(userId), type: "booking" },
    });

    return res.status(200).json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
    });
  } catch (err: any) {
    console.error(err);
    if (err.raw?.message) return res.status(400).send(`❌ ${err.raw.message}`);
    return res.status(500).send("❌ خطأ في الخادم");
  }
};

// POST /customer/confirm-booking-payment
export const confirmBookingPayment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const {
      paymentIntentId,
      hallId,
      bookingDate,
      guestCount,
      services,
      totalCost
    } = req.body;

    if (!userId) return res.status(401).send("❌ مستخدم غير مصرح");
    if (!paymentIntentId || !hallId || !bookingDate) return res.status(400).send("❌ بيانات ناقصة");

    // 1. Verify with Stripe
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== "succeeded")
      return res.status(400).send("❌ لم يتم تأكيد الدفع");

    // 2. Atomically create the booking
    await sql.begin(async (tx: any) => {
      // Check if this paymentIntent has already been used (to prevent double bookings on refresh)
      const [existingPayment] = await tx`
        SELECT id FROM customer_payments WHERE payment_intent_id = ${paymentIntentId}
      `;
      if (existingPayment) throw new Error("ALREADY_BOOKED");

      // Get hall owner and details
      const [hall] = await tx`
        SELECT owner_id, hall_name FROM halls WHERE id = ${hallId}
      `;
      if (!hall) throw new Error("HALL_NOT_FOUND");
      const ownerId = hall.owner_id;

      // Insert the booking
      const [newBooking] = await tx`
        INSERT INTO bookings (hall_id, customer_id, booking_date, status, guests_number)
        VALUES (${hallId}, ${userId}, ${bookingDate}, 'confirmed', ${guestCount})
        RETURNING id
      `;
      const bookingId = newBooking.id;

      // Record the payment
      await tx`
        INSERT INTO customer_payments (customer_id, booking_id, amount, type, status, payment_intent_id)
        VALUES (${userId}, ${bookingId}, ${totalCost}, 'payment', 'success', ${paymentIntentId})
      `;

      // Notify the hall owner
      const notificationContent = `يتم الآن حجز صالتك ${hall.hall_name}`;
      await insertNotification(ownerId, 'حجز جديد', notificationContent, 'booking');
    });

    return res.status(200).send("✅ تم تأكيد الدفع وحجز الصالة بنجاح");
  } catch (err: any) {
    console.error(err);
    if (err.message === "ALREADY_BOOKED")
      return res.status(409).send("❌ تم تأكيد هذا الحجز مسبقاً");
    if (err.message === "HALL_NOT_FOUND")
      return res.status(404).send("❌ الصالة غير موجودة");
    if (err.raw?.message) return res.status(400).send(`❌ ${err.raw.message}`);
    return res.status(500).send("❌ خطأ في الخادم");
  }
};
