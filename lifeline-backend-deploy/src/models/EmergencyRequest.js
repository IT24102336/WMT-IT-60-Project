const mongoose = require("mongoose");

const emergencyRequestSchema = new mongoose.Schema(
  {
    hospitalUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    hospital: {
      type: String,
      required: true
    },
    bloodType: {
      type: String,
      required: true
    },
    unitsRequested: {
      type: Number,
      required: true,
      min: 1
    },
    unitsFulfilled: {
      type: Number,
      default: 0
    },
    urgency: {
      type: String,
      enum: ["NORMAL", "CRITICAL"],
      default: "NORMAL"
    },
    reason: String,
    status: {
      type: String,
      enum: ["OPEN", "PARTIAL", "FULFILLED"],
      default: "OPEN"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("EmergencyRequest", emergencyRequestSchema);
