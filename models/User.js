import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: { type: Date, required: true },
    hospital: { type: String },
    note: { type: String },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin", "volunteer"],
      default: "user",
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dmb58pab9/image/upload/v1765099270/vecteezy_man-empty-avatar-vector-photo-placeholder-for-social_36594092_ctngem.webp",
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },
    donationHistory: [donationSchema],

    location: {},
    status: {
      type: String,
      default: "active",
    },
    phone: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

// {
//   "name": "Abubakar Siddik Zisan",
//   "email": "zisan@example.com",
//   "password": "securePassword123",
//   "role": "user",
//   "avatar": "https://example.com/avatar.jpg",
//   "bloodGroup": "O+",
//   "location": "Dhaka",
//   "phone": 8801234567890
// }
