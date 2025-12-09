import mongoose from "mongoose";

const bloodDonationRequestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    recipientName: {
      type: String,
      required: true,
    },

    recipientLocation: {
      type: String,
      required: true,
    },

    hospitalName: {
      type: String,
      required: true,
    },

    fullAddress: {
      type: Object,
      default: {},
    },

    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },

    donationDate: {
      type: String,
      required: true,
    },

    donationTime: {
      type: String,
      required: true,
    },

    additionalMessage: {
      type: String,
      default: "",
    },

    donationStatus: {
      type: String,
      enum: ["pending", "in-progress", "success", "cancel"],
      default: "pending",
    },

    recipientPhone: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "BloodDonationRequest",
  bloodDonationRequestSchema
);
