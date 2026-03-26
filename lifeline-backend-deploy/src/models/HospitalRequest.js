const mongoose = require("mongoose");

const hospitalRequestSchema = new mongoose.Schema(
  {
    hospitalUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    hospital: {
      type: String,
      trim: true
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
    priority: {
      type: String,
      enum: ["NORMAL", "HIGH"],
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

module.exports = mongoose.model("HospitalRequest", hospitalRequestSchema);
