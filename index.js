import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import bloodDonationRoute from "./routes/bloodDonationRoute.js";
import fundRoutes from "./routes/fundRoute.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
dotenv.config();
const PORT = process.env.PORT || 4000;
connectDB();

const app = express();
app.set("trust proxy", 1);

app.use(
  cors({
    origin: ["http://localhost:3000", "https://blood-link-bd-ochre.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/bloodDonationReq", bloodDonationRoute);
app.use("/api/fund", fundRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/stats", statsRoutes);
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
