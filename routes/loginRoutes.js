const express = require("express");
const bcrypt = require("bcryptjs");
const Signup = require("../models/Signup");

const router = express.Router();

// LOGIN API
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check email exists
    const user = await Signup.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Email" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    // SEND ROLE + FLAT + WING
    res.status(200).json({
      message: "Login Success",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        flat: user.flat,
        wing: user.wing
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// RESET PASSWORD API
router.put("/reset-password", async (req, res) => {
  try {
    const { email, mobile, newPassword } = req.body;

    // Check user exists with both email and mobile for verification
    const user = await Signup.findOne({ email, mobile });
    if (!user) {
      return res.status(400).json({ message: "Invalid Email or Mobile Number" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;
