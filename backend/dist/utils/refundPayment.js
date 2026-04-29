import { stripe } from "../controllers/hallOwnerControllers/hallPaymentController.js";
async function refundPayment(paymentIntentId) {
    const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
    });
    if (refund.status !== "succeeded" && refund.status !== "pending") {
        throw new Error("REFUND_FAILED");
    }
    return refund;
}
export default refundPayment;
