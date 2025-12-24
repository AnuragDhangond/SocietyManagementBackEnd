const express = require("express");
const router = express.Router();

const Maintenance = require("../models/Maintenance");
const Member = require("../models/Member");

/* ===============================
   ADD MAINTENANCE (ADMIN)
================================ */
router.post("/add", async (req, res) => {
  try {
    const { flat, wing, month, year, amount } = req.body;

    if (!flat || !wing || !month || !year || amount == null) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const flatValue = String(flat).trim();
    const wingValue = String(wing).trim();
    const numericAmount = Number(amount);

    // 🔎 Validate member
    const member = await Member.findOne({
      address: flatValue,
      services: wingValue
    });

    if (!member) {
      return res.status(404).json({
        message: "Invalid Flat Number or Wing"
      });
    }

    let maintenance = await Maintenance.findOne({
      flat: flatValue,
      wing: wingValue
    });

    if (maintenance) {
      const alreadyPaid = maintenance.records.find(
        r => r.month === month && r.year === year
      );

      if (alreadyPaid) {
        return res.status(400).json({
          message: "Maintenance already paid for this month"
        });
      }

      maintenance.records.push({
        month,
        year,
        amount: numericAmount
      });

      maintenance.totalAmount += numericAmount;
      await maintenance.save();

    } else {
      maintenance = new Maintenance({
        memberId: member._id,
        name: member.name,
        flat: flatValue,
        wing: wingValue,
        records: [{ month, year, amount: numericAmount }],
        totalAmount: numericAmount
      });

      await maintenance.save();
    }

    res.status(200).json({
      message: "Maintenance saved successfully",
      maintenance
    });

  } catch (err) {
    console.error("❌ Maintenance Save Error:", err);
    res.status(500).json({
      message: "Server error while saving maintenance"
    });
  }
});

/* ===============================
   GET ALL MAINTENANCE (ADMIN)
================================ */
router.get("/", async (req, res) => {
  try {
    const data = await Maintenance.find().sort({ flat: 1 });
    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Fetch Maintenance Error:", err);
    res.status(500).json({
      message: "Failed to fetch maintenance data"
    });
  }
});

/* ===============================
   GET MAINTENANCE BY FLAT (MEMBER)
================================ */
// GET MAINTENANCE BY FLAT (MEMBER)
router.get("/flat", async (req, res) => {
  try {
    const { flat, wing } = req.query;

    if (!flat || !wing) {
      return res.status(400).json({ message: "Flat and wing are required" });
    }

    const member = await Member.findOne({
      address: flat.trim(),
      services: wing.trim()
    });

    if (!member) {
      return res.status(404).json({
        message: "Flat not registered. Contact administrator."
      });
    }

    const maintenance = await Maintenance.findOne({
      flat: flat.trim(),
      wing: wing.trim()
    });

    res.status(200).json({
      member: {
        name: member.name,
        email: member.email,
        mobile: member.mobile,
        flat: member.address,
        wing: member.services
      },
      records: maintenance ? maintenance.records : []
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
