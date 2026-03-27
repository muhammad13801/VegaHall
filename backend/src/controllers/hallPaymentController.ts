import { Response } from "express";
import { AuthRequest } from "../middleware/sessionMiddleware";
import Stripe from "stripe";
import sql from "../db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

// POST /halls/charge
// Called by frontend after addHall succeeds.
// Returns a Stripe paymentIntent client secret for the Payment Sheet.
export const charge = async (req: AuthRequest, res: Response) => {
  try {
    const { hallId } = req.body;
    const userId = req.userId;

    if (!userId) return res.status(401).send("❌ مستخدم غير مصرح");
    if (!hallId) return res.status(400).send("❌ معرف الصالة مطلوب");

    // Fixed listing fee: $50
    const AMOUNT_CENTS = 5000;

    // Create a Stripe Customer (or reuse if you store it)
    const customer = await stripe.customers.create();

    // Create an ephemeral key so the Payment Sheet can manage the customer
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2024-06-20" },
    );

    // Create the PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: AMOUNT_CENTS,
      currency: "usd",
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
    });

    // Record the pending payment in the DB
    await sql`
      INSERT INTO hallPayment (hall_id, owner_id, amount, status, payment_intent_id)
      VALUES (${hallId}, ${userId}, 50, 'Pending', ${paymentIntent.id})
    `;

    return res.status(200).json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      hallId,
    });
  } catch (err: any) {
    console.error(err);
    if (err.raw?.message) return res.status(400).send(`❌ ${err.raw.message}`);
    return res.status(500).send("❌ خطأ في الخادم");
  }
};

// POST /halls/confirm-payment
// Called by the frontend after Payment Sheet confirms successfully.
// Activates the hall and marks payment as Success.
export const confirmPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { hallId, paymentIntentId } = req.body;
    const userId = req.userId;

    if (!userId) return res.status(401).send("❌ مستخدم غير مصرح");
    if (!hallId || !paymentIntentId)
      return res.status(400).send("❌ بيانات ناقصة");

    // Verify the payment with Stripe
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== "succeeded") {
      return res.status(400).send("❌ لم يتم تأكيد الدفع");
    }

    // Activate the hall and update payment record
    await Promise.all([
      sql`UPDATE halls SET status = 'Active' WHERE id = ${hallId}`,
      sql`UPDATE hallPayment SET status = 'Success' WHERE payment_intent_id = ${paymentIntentId}`,
    ]);

    return res.status(200).json({ message: "✔️ تم تفعيل الصالة بنجاح" });
  } catch (err: any) {
    console.error(err);
    return res.status(500).send("❌ خطأ في الخادم");
  }
};
