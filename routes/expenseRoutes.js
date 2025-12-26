const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// 🔹 GET ALL EXPENSES (ADMIN + MEMBER)
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
});

// 🔹 ADD EXPENSE (ADMIN ONLY)
router.post('/', async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ message: 'Failed to add expense' });
  }
});

// 🔹 UPDATE EXPENSE (ADMIN ONLY)
router.put('/:id', async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update expense' });
  }
});

// 🔹 DELETE EXPENSE (ADMIN ONLY)
router.delete('/:id', async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete expense' });
  }
});

module.exports = router;
