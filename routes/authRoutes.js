import express from "express";
import { signup, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/", (req, res) => {
  res.send("Hello i am from auth route!");
});

export default router;
