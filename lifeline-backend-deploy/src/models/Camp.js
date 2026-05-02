const mongoose = require("mongoose");

const campSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    province: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    nearestHospital: String,
    location: String,
    address: String,
    googleMapLink: String,
    date: {
      type: String,
      required: true
    },
    startTime: String,
    endTime: String,
    campStatus: {
      type: String,
      enum: ["UPCOMING", "ONGOING", "ENDED"],
      default: "UPCOMING"
    },
    interestedCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Camp", campSchema);
