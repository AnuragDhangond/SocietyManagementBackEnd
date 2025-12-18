const mongoose = require("mongoose");

const SignupSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  mobile: Number,
  password: String
}, { timestamps: true });

module.exports = mongoose.model("Signup", SignupSchema);
