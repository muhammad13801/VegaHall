import { stripe } from "../controllers/hallPaymentController";

async function refundPayment(paymentIntentId: string) {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
  });

  if (refund.status !== "succeeded" && refund.status !== "pending") {
    throw new Error("REFUND_FAILED");
  }

  return refund;
}

export default refundPayment;
