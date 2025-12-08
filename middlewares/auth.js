import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Login required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("role email name");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or deleted",
      });
    }

    req.user = {
      id: decoded.id,
      role: user.role, // db theke role asbe ...more secure
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
