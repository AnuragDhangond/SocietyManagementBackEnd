const express = require("express");
const router = express.Router();
const Member = require("../models/Member");

// CREATE
router.post("/", async (req, res) => {
  try {
    const member = await Member.create(req.body);
    res.json(member);
  } catch (err) {
    res.status(500).json(err);
  }
});

// READ
router.get("/", async (req, res) => {
  try {
    const members = await Member.find();
    res.json(members);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    res.json({ message: "Member Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const updated = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
