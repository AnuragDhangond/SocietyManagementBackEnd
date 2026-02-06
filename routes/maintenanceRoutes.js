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
      // ❗ allow re-add only if previous entry was REVERSED
      const alreadyPaid = maintenance.records.find(
        r =>
          r.month === month &&
          r.year === year &&
          (r.status === "PAID" || r.status === undefined)
      );

      if (alreadyPaid) {
        return res.status(400).json({
          message: "Maintenance already paid for this month"
        });
      }

      maintenance.records.push({
        month,
        year,
        amount: numericAmount,
        status: "PAID"
      });

    } else {
      maintenance = new Maintenance({
        memberId: member._id,
        name: member.name,
        flat: flatValue,
        wing: wingValue,
        records: [
          {
            month,
            year,
            amount: numericAmount,
            status: "PAID"
          }
        ]
      });
    }

    // 🔄 SAFE TOTAL RECALCULATION
    maintenance.totalAmount = maintenance.records
      .filter(r => r.status !== "REVERSED")
      .reduce((sum, r) => sum + r.amount, 0);

    await maintenance.save();

    res.status(200).json({
      message: "Maintenance saved successfully"
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
    res.status(500).json({
      message: "Failed to fetch maintenance data"
    });
  }
});

/* ===============================
   GET MAINTENANCE BY FLAT (MEMBER)
================================ */
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
      records: maintenance
        ? maintenance.records.filter(r => r.status !== "REVERSED")
        : []
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   REVERSE MAINTENANCE (ADMIN)
================================ */
router.delete("/delete", async (req, res) => {
  try {
    const { flat, wing, month, year } = req.body;

    if (!flat || !wing || !month || !year) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const maintenance = await Maintenance.findOne({ flat, wing });

    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance record not found" });
    }

    const record = maintenance.records.find(
      r => r.month === month && r.year === year
    );

    if (!record) {
      return res.status(404).json({ message: "Month record not found" });
    }

    if (record.status === "REVERSED") {
      return res.status(400).json({
        message: "This maintenance entry is already reversed"
      });
    }

    // 🔒 REVERSE ENTRY
    record.status = "REVERSED";
    record.reversedAt = new Date();

    // 🔄 SAFE TOTAL RECALCULATION
    maintenance.totalAmount = maintenance.records
      .filter(r => r.status !== "REVERSED")
      .reduce((sum, r) => sum + r.amount, 0);

    await maintenance.save();

    res.status(200).json({
      message: "Maintenance entry reversed successfully"
    });

  } catch (err) {
    console.error("❌ Reverse Maintenance Error:", err);
    res.status(500).json({
      message: "Failed to reverse maintenance"
    });
  }
});

/* ===============================
   UPDATE MAINTENANCE (ADMIN)
================================ */
router.put("/update", async (req, res) => {
  try {
    const { flat, wing, month, year, amount } = req.body;

    if (!flat || !wing || !month || !year || amount == null) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const maintenance = await Maintenance.findOne({ flat, wing });

    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance record not found" });
    }

    const record = maintenance.records.find(
      r => r.month === month && r.year === year
    );

    if (!record) {
      return res.status(404).json({ message: "Month record not found" });
    }

    // ❌ BLOCK UPDATE IF REVERSED
    if (record.status === "REVERSED") {
      return res.status(400).json({
        message: "Cannot update a reversed maintenance entry"
      });
    }

    record.amount = Number(amount);

    // 🔄 SAFE TOTAL RECALCULATION
    maintenance.totalAmount = maintenance.records
      .filter(r => r.status !== "REVERSED")
      .reduce((sum, r) => sum + r.amount, 0);

    await maintenance.save();

    res.status(200).json({
      message: "Maintenance updated successfully"
    });

  } catch (err) {
    console.error("❌ Update Maintenance Error:", err);
    res.status(500).json({
      message: "Failed to update maintenance"
    });
  }
});

router.get("/summary/monthly", async (req, res) => {
  try {
    const { year, wing } = req.query;

    if (!year || !wing) {
      return res.status(400).json({
        message: "Year and Wing are required"
      });
    }

    const summary = await Maintenance.aggregate([
      // filter by wing first
      {
        $match: {
          wing: wing
        }
      },

      { $unwind: "$records" },

      // ignore reversed + match year
      {
        $match: {
          "records.year": Number(year),
          $or: [
            { "records.status": "PAID" },
            { "records.status": { $exists: false } }
          ]
        }
      },

      {
        $group: {
          _id: "$records.month",
          totalAmount: { $sum: "$records.amount" }
        }
      },

      { $sort: { "_id": 1 } }
    ]);

    res.json(summary);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to load monthly wing summary"
    });
  }
});

router.get("/summary/yearly", async (req, res) => {
  try {
    const year = Number(req.query.year);
    const wing = req.query.wing?.trim();

    const result = await Maintenance.aggregate([
      {
        $match: {
          wing: wing
        }
      },
      { $unwind: "$records" },
      {
        $match: {
          "records.year": year,
          "records.status": "PAID"
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$records.amount" }
        }
      }
    ]);

    res.json({
      totalAmount: result.length ? result[0].totalAmount : 0
    });

  } catch (err) {
    console.error("YEARLY ERROR", err);
    res.status(500).json({ message: "Yearly failed" });
  }
});




module.exports = router;
