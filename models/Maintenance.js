const mongoose = require("mongoose");

/* ===============================
   MONTHLY MAINTENANCE RECORD
================================ */
const maintenanceRecordSchema = new mongoose.Schema({
  month: String,
  year: Number,
  amount: Number,

  // 🔐 NEW FIELDS (SAFE)
  status: {
    type: String,
    enum: ["PAID", "REVERSED"],
    default: "PAID"
  },
  createdBy: {
    type: String,
    default: "admin"
  },
  reversedAt: Date
});


/* ===============================
   MAIN MAINTENANCE SCHEMA
================================ */
const maintenanceSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true
    },

    name: {
      type: String,
      required: true
    },

    flat: {
      type: String,
      required: true,
      trim: true
    },

    wing: {
      type: String,
      required: true,
      trim: true
    },

    records: {
      type: [maintenanceRecordSchema],
      default: []
    },

    totalAmount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Maintenance", maintenanceSchema);
