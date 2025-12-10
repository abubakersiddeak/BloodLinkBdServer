import express from "express";
import { allFund, userFund } from "../controllers/fundController.js";
import { verifyToken } from "../middlewares/auth.js";
import { authorizeRole } from "../middlewares/role.js";
const router = express.Router();
router.get("/", verifyToken, authorizeRole("admin", "volunteer"), allFund);
router.get("/userFund", verifyToken, userFund);

export default router;
