import express from "express";
import {
  user,
  users,
  userUbdate,
  userDelete,
  updateStatus,
} from "../controllers/userController.js";
import { verifyToken } from "../middlewares/auth.js";
import { authorizeRole } from "../middlewares/role.js";
const router = express.Router();
router.get("/", users);
router.get("/:id", user);
router.patch("/:id/role", verifyToken, authorizeRole("admin"), userUbdate);
router.delete("/:id", verifyToken, authorizeRole("admin"), userDelete);
router.patch(
  "/:id/status",
  verifyToken,
  authorizeRole("admin", "volunteer"),
  updateStatus
);

export default router;
