// userRoutes.js

const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require("../models/user");
const authMiddleware = require("../middleware/auth");

// Change Password
router.patch("/change-password", authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Old password is incorrect." });
    }

    user.password = newPassword;
    await user.save(); 

    res.json({ message: "Password updated successfully." });
  } catch (err) {

    // console.error("Error changing password:", err);

    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
