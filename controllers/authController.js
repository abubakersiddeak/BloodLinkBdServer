import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
        name: newUser.name,
        avatar: newUser.avatar,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set HttpOnly Cookie
    res.cookie("token", token, {
      httpOnly: true,
      // secure: true,
      secure: process.env.NODE_ENV === "production", // production এ true
      sameSite: "strict",
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
        name: user.name,
        avatar: user.avatar,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set HttpOnly Cookie
    res.cookie("token", token, {
      httpOnly: true,
      // secure: true,
      secure: process.env.NODE_ENV === "production", // production এ true
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const loginuser = (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(200).json({ currentUser: null });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ currentUser: decoded }); // { id, role, name, email }
  } catch (error) {
    res.status(200).json({ currentUser: null }); // Invalid token treated as logged out
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.json({ message: "Logged out successfully" });
};
