import type { Response } from "express";
import type { AuthRequest } from "../../middleware/sessionMiddleware.js";
import Stripe from "stripe";
import sql from "../../db.js";
import { insertNotification } from "../userControllers/notificationsController.js";

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
export const confirmBookingPayment = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.userId;
    const {
      paymentIntentId,
      hallId,
      bookingDate,
      guestCount,
      services,
      meals,
      totalCost,
    } = req.body;

    if (!userId) return res.status(401).send("❌ مستخدم غير مصرح");
    if (!paymentIntentId || !hallId || !bookingDate)
      return res.status(400).send("❌ بيانات ناقصة");

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

      // Get hall owner, details, and customer name for notification
      const [hall] = await tx`
        SELECT owner_id, hall_name FROM halls WHERE id = ${hallId}
      `;
      if (!hall) throw new Error("HALL_NOT_FOUND");
      const ownerId = hall.owner_id;

      const [user] = await tx`
        SELECT first_name, last_name FROM users WHERE id = ${userId}
      `;
      const userName = user ? `${user.first_name} ${user.last_name}` : "عميل";
      const formattedDate = new Date(bookingDate).toLocaleDateString(
        "ar-IL-u-nu-latn",
        {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        },
      );

      // Insert the booking
      const [newBooking] = await tx`
        INSERT INTO bookings (hall_id, customer_id, booking_date, status, guests_number)
        VALUES (${hallId}, ${userId}, ${bookingDate}, 'confirmed', ${guestCount})
        RETURNING id
      `;
      const bookingId = newBooking.id;

      // Insert selected services
      if (services && Array.isArray(services)) {
        for (const serviceName of services) {
          const [svc] = await tx`
            SELECT s.id, hs.price 
            FROM services s
            JOIN hall_services hs ON hs.service_id = s.id
            WHERE s.name = ${serviceName} AND hs.hall_id = ${hallId}
          `;
          if (svc) {
            await tx`
              INSERT INTO booking_services (booking_id, service_id, price)
              VALUES (${bookingId}, ${svc.id}, ${svc.price})
            `;
          }
        }
      }

      // Insert selected meals
      if (meals && Array.isArray(meals)) {
        for (const mealName of meals) {
          const [meal] = await tx`
            SELECT mt.id, mo.price_per_person
            FROM meal_types mt
            JOIN meal_options mo ON mo.meal_type_id = mt.id
            WHERE mt.name = ${mealName} AND mo.hall_id = ${hallId}
          `;
          if (meal) {
            await tx`
              INSERT INTO booking_meals (booking_id, meal_type_id, price_per_person)
              VALUES (${bookingId}, ${meal.id}, ${meal.price_per_person})
            `;
          }
        }
      }

      // Record the payment
      await tx`
        INSERT INTO customer_payments (customer_id, booking_id, amount, type, status, payment_intent_id)
        VALUES (${userId}, ${bookingId}, ${totalCost}, 'payment', 'success', ${paymentIntentId})
      `;

      // Notify the hall owner
      const notificationContent = `قام ${userName} بحجز صالتك (${hall.hall_name}) بتاريخ ${formattedDate} للمزيد من المعلومات الاطلاع على الحجوزات`;
      await insertNotification(
        ownerId,
        "حجز جديد",
        notificationContent,
        "booking",
      );
    });

    return res.status(200).send("✔️ تم تأكيد الدفع وحجز الصالة بنجاح");
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
