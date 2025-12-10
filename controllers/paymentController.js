import stripe from "../config/stripe.js";
import dotenv from "dotenv";
import Fund from "../models/Fund.js";
dotenv.config();
export const createCheckoutSession = async (req, res) => {
  const fund = req.body;

  const amount = parseInt(fund.amount) * 100;

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: {
            name: `Fund for: ${fund.cause || "General Fund"}`,
            description: fund.message || "Thank you for contributing",
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",

    metadata: {
      fundId: fund.fundId,
      funderName: fund.name,
      funderEmail: fund.email,
      funderPhone: fund.phone,
      fundAmount: fund.amount,
      fundFor: fund.cause,
      message: fund.message,
      userId: fund.userId,
    },

    customer_email: fund.email,

    success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
  });

  res.json({ url: session.url });
};
export const paymentSession = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const fund = await Fund.create({
      sessionId: sessionId,
      paymentIntent: session.payment_intent,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total / 100,
      currency: session.currency,
      funderName: session.metadata.funderName,
      funderEmail: session.metadata.funderEmail,
      funderPhone: session.metadata.funderPhone || "",
      fundFor: session.metadata.fundFor || "",
      message: session.metadata.message || "",
    });

    res.status(200).json({
      message: "Payment saved successfully",
      fund,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
