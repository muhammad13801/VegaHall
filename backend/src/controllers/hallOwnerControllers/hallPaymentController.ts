import type { Response } from "express";
import type { AuthRequest } from "../../middleware/sessionMiddleware.js";
import Stripe from "stripe";
import sql from "../../db.js";
import { insertNotification } from "../userControllers/notificationsController.js";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

// POST /halls/charge
export const charge = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).send("❌ مستخدم غير مصرح");

    const customer = await stripe.customers.create();

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2026-02-25.clover" },
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 5000,
      currency: "usd",
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
      metadata: { userId: String(userId) },
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

// POST /halls/confirm-payment
export const confirmPayment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const {
      paymentIntentId,
      name,
      capacity,
      price,
      city,
      address,
      latitude,
      longitude,
      description,
      license,
      images,
      videos,
      services,
      mealOptions,
      secondaryContacts,
    } = req.body;

    if (!userId) return res.status(401).send("❌ مستخدم غير مصرح");
    if (!paymentIntentId) return res.status(400).send("❌ بيانات ناقصة");

    // 1. Verify with Stripe BEFORE opening DB transaction
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== "succeeded")
      return res.status(400).send("❌ لم يتم تأكيد الدفع");

    // 2. Everything atomically in one transaction
    await sql.begin(async (tx: any) => {
      // Check this paymentIntent hasn't already been used
      const [existingPayment] = await tx`
        SELECT id FROM hall_payments
        WHERE payment_intent_id = ${paymentIntentId}
        FOR UPDATE
      `;
      if (existingPayment) throw new Error("ALREADY_CONFIRMED");

      // Insert the hall — matches schema columns exactly
      const [newHall] = await tx`
        INSERT INTO halls
          (hall_name, owner_id, capacity, city, address,
           latitude, longitude, description, base_price, status)
        VALUES
          (${name}, ${userId}, ${capacity}, ${city}, ${address},
           ${latitude ?? null}, ${longitude ?? null}, ${description},
           ${price}, 'pending')
        RETURNING id
      `;
      const hallId = newHall.id;

      // meal_options: look up meal_type_id by name
      if (mealOptions?.length) {
        await Promise.all(
          mealOptions.map(async (m: any) => {
            const [mt] = await tx`
              SELECT id FROM meal_types WHERE name = ${m.type ?? m.name}
            `;
            if (!mt) throw new Error(`MEAL_NOT_FOUND:${m.type ?? m.name}`);
            return tx`
              INSERT INTO meal_options (hall_id, meal_type_id, price_per_person)
              VALUES (${hallId}, ${mt.id}, ${m.pricePerPerson ?? m.price_per_person})
            `;
          }),
        );
      }

      if (license) {
        await tx`
          INSERT INTO media (hall_id, type, url)
          VALUES (${hallId}, 'license', ${license})
        `;
      }

      if (images?.length) {
        await Promise.all(
          images.map(
            (url: string) =>
              tx`INSERT INTO media (hall_id, type, url) VALUES (${hallId}, 'image', ${url})`,
          ),
        );
      }

      if (videos?.length) {
        await Promise.all(
          videos.map(
            (url: string) =>
              tx`INSERT INTO media (hall_id, type, url) VALUES (${hallId}, 'video', ${url})`,
          ),
        );
      }

      // hall_services: look up service_id by name
      if (services?.length) {
        await Promise.all(
          services.map(async (s: any) => {
            const [svc] = await tx`
              SELECT id FROM services WHERE name = ${s.name}
            `;
            if (!svc) throw new Error(`SERVICE_NOT_FOUND:${s.name}`);
            return tx`
              INSERT INTO hall_services (hall_id, service_id, price)
              VALUES (${hallId}, ${svc.id}, ${s.price ?? 0})
            `;
          }),
        );
      }

      if (secondaryContacts?.length) {
        await Promise.all(
          secondaryContacts.map(
            (c: any) =>
              tx`
                INSERT INTO secondary_contacts (hall_id, first_name, last_name, phone_number)
                VALUES (${hallId}, ${c.firstName}, ${c.lastName}, ${c.phone})
              `,
          ),
        );
      }

      // Record the payment — status is lowercase per schema check constraint
      await tx`
        INSERT INTO hall_payments (hall_id, owner_id, amount, status, payment_intent_id)
        VALUES (${hallId}, ${userId}, 50, 'success', ${paymentIntentId})
      `;
    });

    const result = await sql`
      SELECT id FROM users WHERE role = 'admin'`;

    await Promise.all(
      result.map(
        async (admin: any) =>
          await insertNotification(
            admin.id,
            "طلب إضافة صالة جديد",
            `تم تسجيل صالة جديدة باسم "${name}" الرجاء مراجعتها واتخاذ الإجراء المناسب.`,
            "hall_review",
          ),
      ),
    );

    return res
      .status(200)
      .send("✔️ تم إرسال طلب اضافة الصالة لمدير النظام بنجاح");
  } catch (err: any) {
    console.error(err);
    if (err.message === "ALREADY_CONFIRMED")
      return res.status(409).send("❌ تم تأكيد هذا الدفع مسبقاً");
    if (err.raw?.message) return res.status(400).send(`❌ ${err.raw.message}`);
    return res.status(500).send("❌ خطأ في الخادم");
  }
};
