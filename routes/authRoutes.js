import express from "express";
import {
  signup,
  login,
  loginuser,
  logout,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/loginuser", loginuser);
router.post("/logout", logout);
export default router;
