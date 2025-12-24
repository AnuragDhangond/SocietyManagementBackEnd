const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true
    },

    name: String,
    email: String,
    mobile: String,

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

    category: {
      type: String,
      required: true
    },

    subject: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    status: {
      type: String,
      default: "Open" // Open | In Progress | Resolved
    },

    remark: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
