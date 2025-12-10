import express from "express";

import { verifyToken } from "../middlewares/auth.js";
import { authorizeRole } from "../middlewares/role.js";
import { getDashboardStats } from "../controllers/statsController.js";

const router = express.Router();
router.get(
  "/global-stats",
  verifyToken,
  authorizeRole("admin", "volunteer"),
  getDashboardStats
);

export default router;
