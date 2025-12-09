import express from "express";
import {
  createBloodDonationReq,
  deleteBloodDonationReq,
  getSingleBloodDonationReq,
  myBloodDonationReq,
  totalBloodDonationReq,
  updateBloodDonationStatus,
} from "../controllers/bloodDonationController.js";
import { verifyToken } from "../middlewares/auth.js";
const router = express.Router();
router.post("/create", verifyToken, createBloodDonationReq);
router.get("/", verifyToken, totalBloodDonationReq);
router.get("/myBloodDonationReq", verifyToken, myBloodDonationReq);
router.patch("/:id/status", verifyToken, updateBloodDonationStatus);
router.delete("/:id", verifyToken, deleteBloodDonationReq);
router.get("/:id", verifyToken, getSingleBloodDonationReq);

export default router;
