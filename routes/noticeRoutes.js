const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');

// GET ALL NOTICES
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD NOTICE
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const notice = new Notice({ title, description });
    await notice.save();

    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
