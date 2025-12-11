import express from "express";
import {
  successDonate,
  createBloodDonationReq,
  deleteBloodDonationReq,
  donateToRequest,
  getSingleBloodDonationReq,
  myBloodDonationReq,
  totalBloodDonationReq,
  totalBloodDonationReqPublic,
  updateBloodDonationReq,
  updateBloodDonationStatus,
  getMyRequestsStats,
  markRequestAsComplete,
  cancelMyRequest,
} from "../controllers/bloodDonationController.js";
import { verifyToken } from "../middlewares/auth.js";
const router = express.Router();
router.post("/create", verifyToken, createBloodDonationReq);
router.get("/", verifyToken, totalBloodDonationReq);
router.get("/totalBloodDonationReqPublic", totalBloodDonationReqPublic);
router.get("/myBloodDonationReq", verifyToken, myBloodDonationReq);
router.get("/stats", verifyToken, getMyRequestsStats); // NEW
router.put("/:id/donate", verifyToken, donateToRequest);
router.put("/:id/success", verifyToken, successDonate);
router.patch("/:id/status", verifyToken, updateBloodDonationStatus);
router.patch("/:id/complete", verifyToken, markRequestAsComplete); // NEW
router.patch("/:id/cancel", verifyToken, cancelMyRequest); // NEW
router.delete("/:id", verifyToken, deleteBloodDonationReq);
router.get("/:id", verifyToken, getSingleBloodDonationReq);
router.put("/:id", verifyToken, updateBloodDonationReq);

export default router;
