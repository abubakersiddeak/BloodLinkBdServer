import express from "express";
import {
  createBloodDonationReq,
  deleteBloodDonationReq,
  donateToRequest,
  getSingleBloodDonationReq,
  myBloodDonationReq,
  totalBloodDonationReq,
  totalBloodDonationReqPublic,
  updateBloodDonationReq,
  updateBloodDonationStatus,
} from "../controllers/bloodDonationController.js";
import { verifyToken } from "../middlewares/auth.js";
const router = express.Router();
router.post("/create", verifyToken, createBloodDonationReq);
router.get("/", verifyToken, totalBloodDonationReq);
router.get("/totalBloodDonationReqPublic", totalBloodDonationReqPublic);
router.get("/myBloodDonationReq", verifyToken, myBloodDonationReq);
router.put("/:id/donate", verifyToken, donateToRequest);
router.patch("/:id/status", verifyToken, updateBloodDonationStatus);
router.delete("/:id", verifyToken, deleteBloodDonationReq);
router.get("/:id", verifyToken, getSingleBloodDonationReq);
router.put("/:id", verifyToken, updateBloodDonationReq);

export default router;
