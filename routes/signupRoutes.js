const express = require("express");
const router = express.Router();
const Signup = require("../models/Signup");
const bcrypt = require("bcryptjs");

// REGISTER USER
router.post("/register", async (req, res) => {
  try {
    const { name, email, mobile, password, role } = req.body;

    // Validate role
    if (!role || !["admin", "member"].includes(role)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    // Check duplicate email
    const userExists = await Signup.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new Signup({
      name,
      email,
      mobile,
      password: hashedPassword,
      role
    });

    await user.save();

    res.status(200).json({
      message: "Signup successful",
      role: user.role
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
