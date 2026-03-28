import { Response } from "express";
import { AuthRequest } from "../middleware/sessionMiddleware";
import Stripe from "stripe";
import sql from "../db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
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
      location,
      description,
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
        SELECT id FROM hallPayment
        WHERE payment_intent_id = ${paymentIntentId}
        FOR UPDATE
      `;
      if (existingPayment) throw new Error("ALREADY_CONFIRMED");

      // Insert the hall as Active
      const [newHall] = await tx`
        INSERT INTO halls (hall_name, location, city, address, capacity,
                           description, price, status, owner_id)
        VALUES (${name}, ${location}, ${city}, ${address}, ${capacity},
                ${description}, ${price}, 'Active', ${userId})
        RETURNING id
      `;
      const hallId = newHall.id;

      if (mealOptions?.length) {
        await Promise.all(
          mealOptions.map(
            (m: any) =>
              tx`INSERT INTO meal_options (hall_id, name, price_per_person)
               VALUES (${hallId}, ${m.type}, ${m.pricePerPerson})`,
          ),
        );
      }

      if (images?.length) {
        await Promise.all(
          images.map(
            (url: string) =>
              tx`INSERT INTO media (hall_id, type, url)
               VALUES (${hallId}, 'image', ${url})`,
          ),
        );
      }

      if (videos?.length) {
        await Promise.all(
          videos.map(
            (url: string) =>
              tx`INSERT INTO media (hall_id, type, url)
               VALUES (${hallId}, 'video', ${url})`,
          ),
        );
      }

      if (services?.length) {
        await Promise.all(
          services.map(
            (s: any) =>
              tx`INSERT INTO hall_services (hall_id, name, status, price)
               VALUES (${hallId}, ${s.name}, 'active', ${s.price || 0})`,
          ),
        );
      }

      if (secondaryContacts?.length) {
        await Promise.all(
          secondaryContacts.map(
            (c: any) =>
              tx`INSERT INTO secondary_contacts (hall_id, first_name, last_name, phone_number)
               VALUES (${hallId}, ${c.firstName}, ${c.lastName}, ${c.phone})`,
          ),
        );
      }

      // Record the payment as Success
      await tx`
        INSERT INTO hallPayment (hall_id, owner_id, amount, status, payment_intent_id)
        VALUES (${hallId}, ${userId}, 50, 'Success', ${paymentIntentId})
      `;
    });

    return res.status(200).send("✔️ تم تفعيل واضافة الصالة بنجاح");
  } catch (err: any) {
    console.error(err);
    if (err.message === "ALREADY_CONFIRMED")
      return res.status(409).send("❌ تم تأكيد هذا الدفع مسبقاً");
    if (err.raw?.message) return res.status(400).send(`❌ ${err.raw.message}`);
    return res.status(500).send("❌ خطأ في الخادم");
  }
};
