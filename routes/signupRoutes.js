const express = require("express");
const router = express.Router();
const Signup = require("../models/Signup");
const bcrypt = require("bcryptjs");

// REGISTER USER
router.post("/register", async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    // Check duplicate email
    const userExists = await Signup.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new Signup({
      name,
      email,
      mobile,
      password: hashedPassword
    });

    await user.save();

    res.status(200).json({ message: "Signup successful" });

  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
