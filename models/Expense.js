const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String
  },
  createdBy: {
    type: String, // admin email or id
  }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
