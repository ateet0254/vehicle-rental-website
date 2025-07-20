// routes/authRoutes.js

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const sendOtp = require("../utils/sendOtp");  

const otpStore = {};

// POST /register
// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password, role });
    await user.save();
    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /login
// Authenticate user and return token
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      token,
      user: { name: user.name, email: user.email, role: user.role, createdAt: user.createdAt }
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST/send-otp
// Send otp for passwordreset
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ error: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = otp;

  await sendOtp(email, otp);
  res.json({ message: "OTP sent to your email." });
});


//  POST /reset-password
//  Reset user password using OTP
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (otpStore[email] !== otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  user.password = newPassword; // hashed via pre-save hook
  await user.save();

  delete otpStore[email]; // cleanup
  res.json({ message: "Password reset successful." });
});


module.exports = router;
