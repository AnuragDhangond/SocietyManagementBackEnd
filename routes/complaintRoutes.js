const express = require("express");
const router = express.Router();

const Complaint = require("../models/Complaint");
const Member = require("../models/Member");

/* ===============================
   VERIFY FLAT (MEMBER)
================================ */
router.get("/verify", async (req, res) => {
  try {
    const { flat, wing } = req.query;

    if (!flat || !wing) {
      return res.status(400).json({ message: "Flat and Wing required" });
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

    res.status(200).json({
      memberId: member._id,
      name: member.name,
      email: member.email,
      mobile: member.mobile,
      flat: member.address,
      wing: member.services
    });

  } catch (err) {
    console.error("Verify Flat Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   ADD COMPLAINT (MEMBER)
================================ */
router.post("/add", async (req, res) => {
  try {
    const { flat, wing, category, subject, description } = req.body;

    if (!flat || !wing || !category || !subject || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const member = await Member.findOne({
      address: flat.trim(),
      services: wing.trim()
    });

    if (!member) {
      return res.status(404).json({ message: "Flat not registered" });
    }

    const complaint = new Complaint({
      memberId: member._id,
      name: member.name,
      email: member.email,
      mobile: member.mobile,
      flat: member.address,
      wing: member.services,
      category,
      subject,
      description
    });

    await complaint.save();

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaint
    });

  } catch (err) {
    console.error("Add Complaint Error:", err);
    res.status(500).json({ message: "Failed to submit complaint" });
  }
});

/* ===============================
   MEMBER: GET OWN COMPLAINTS
================================ */
router.get("/my", async (req, res) => {
  try {
    const { flat, wing } = req.query;

    const complaints = await Complaint.find({
      flat: flat.trim(),
      wing: wing.trim()
    }).sort({ createdAt: -1 });

    res.status(200).json(complaints);

  } catch (err) {
    console.error("My Complaints Error:", err);
    res.status(500).json({ message: "Failed to load complaints" });
  }
});

/* ===============================
   ADMIN: GET ALL COMPLAINTS
================================ */
router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);

  } catch (err) {
    console.error("All Complaints Error:", err);
    res.status(500).json({ message: "Failed to load complaints" });
  }
});

/* ===============================
   ADMIN: UPDATE STATUS
================================ */
router.put("/:id", async (req, res) => {
  try {
    const { status, remark } = req.body;

    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status, remark },
      { new: true }
    );

    res.status(200).json({
      message: "Complaint updated",
      updated
    });

  } catch (err) {
    console.error("Update Complaint Error:", err);
    res.status(500).json({ message: "Failed to update complaint" });
  }
});

module.exports = router;
