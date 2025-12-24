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

    // ✅ SEND ROLE ALSO
    res.status(200).json({ 
      message: "Login Success", 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role          // 🔥 THIS WAS MISSING
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;
