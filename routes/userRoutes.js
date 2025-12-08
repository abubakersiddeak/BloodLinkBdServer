import express from "express";
import {
  user,
  users,
  userUbdate,
  userDelete,
  updateStatus,
} from "../controllers/userController.js";
const router = express.Router();
router.get("/", users);
router.get("/:id", user);
router.patch("/:id/role", userUbdate);
router.delete("/:id", userDelete);
router.patch("/:id/status", updateStatus);

export default router;
