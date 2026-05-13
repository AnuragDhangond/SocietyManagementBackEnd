const express = require("express");
const router = express.Router();
const Signup = require("../models/Signup");
const Member = require("../models/Member");
const bcrypt = require("bcryptjs");

// REGISTER USER
router.post("/register", async (req, res) => {
  try {
    const { name, email, mobile, password, role, flat, wing } = req.body;

    // Validate role
    if (!role || !["admin", "member"].includes(role)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    // Check duplicate email
    const userExists = await Signup.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // ===== MEMBER-SPECIFIC VALIDATION =====
    let flatNumber = null;
    let wingValue = null;

    if (role === "member") {
      // Flat is required for members
      if (!flat || !wing) {
        return res.status(400).json({ message: "Flat number and Wing are required for members" });
      }

      // Validate flat is exactly 3 digits
      const flatStr = String(flat).trim();
      if (!/^\d{3}$/.test(flatStr)) {
        return res.status(400).json({ message: "Flat number must be exactly 3 digits (e.g. 101, 202)" });
      }

      flatNumber = parseInt(flatStr, 10);
      wingValue = wing.trim();

      // Check if this flat+wing is already registered
      const duplicateFlat = await Signup.findOne({ flat: flatNumber, wing: wingValue, role: "member" });
      if (duplicateFlat) {
        return res.status(400).json({ message: `Flat ${flatNumber} (${wingValue}) is already registered by another owner. Please check the flat number or contact the administrator.` });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new Signup({
      name,
      email,
      mobile,
      password: hashedPassword,
      role,
      flat: flatNumber,
      wing: wingValue
    });

    await user.save();

    // Automatically add to Member collection if they are a member
    if (role === "member") {
      const existingMember = await Member.findOne({ address: String(flatNumber), services: wingValue });
      if (!existingMember) {
        const newMember = new Member({
          name: name,
          email: email,
          mobile: mobile,
          address: String(flatNumber),
          services: wingValue
        });
        await newMember.save();
      } else {
        existingMember.name = name;
        existingMember.email = email;
        existingMember.mobile = mobile;
        await existingMember.save();
      }
    }

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
