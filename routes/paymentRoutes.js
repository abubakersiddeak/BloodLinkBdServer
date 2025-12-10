import express from "express";
import {
  createCheckoutSession,
  paymentSession,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);
router.post("/payment-session/:sessionId", paymentSession);

export default router;
