const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobile: Number,
  address: String,
  services: String
}, { timestamps: true });

module.exports = mongoose.model("Member", MemberSchema);
