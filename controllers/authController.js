import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const isProduction = process.env.NODE_ENV === "production";
export const signup = async (req, res) => {
  try {
    const {
      avatar,
      name,
      email,
      password,
      role,
      phone,
      district,
      upazila,
      bloodGroup,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      avatar,
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      location: { upazila, district },
      bloodGroup,
    });

    const token = jwt.sign(
      {
        id: newUser._id,
        role: newUser.role,
        email: newUser.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set HttpOnly Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      // secure: process.env.NODE_ENV === "production", // production এ true
      // sameSite: "strict",
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User created",
      user: { name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set HttpOnly Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      // secure: process.env.NODE_ENV === "production", // production এ true
      // sameSite: "strict",
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const loginuser = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(200).json({ currentUser: null });
    }

    // Validate token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Now get user from DB USING ID from token
    const user = await User.findById(decoded.id).select(
      "name email role status avatar"
    );

    // If user not found (deleted or banned)
    if (!user) {
      return res.status(200).json({ currentUser: null });
    }

    // Valid user → send DB data (not token data)
    return res.status(200).json({
      currentUser: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    return res.status(200).json({ currentUser: null });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    secure: true,
    // sameSite: "strict",
    sameSite: isProduction ? "none" : "lax",
  });

  return res.json({ message: "Logged out successfully" });
};
