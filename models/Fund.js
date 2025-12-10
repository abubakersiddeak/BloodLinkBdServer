import mongoose from "mongoose";
const fundSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  paymentIntent: { type: String, required: true },
  paymentStatus: { type: String, required: true },
  amountTotal: { type: Number, required: true },
  currency: { type: String, required: true },
  funderName: { type: String, required: true },
  funderEmail: { type: String, required: true },
  funderPhone: { type: String },
  fundFor: { type: String },
  message: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Fund = mongoose.models.Fund || mongoose.model("Fund", fundSchema);
export default Fund;
