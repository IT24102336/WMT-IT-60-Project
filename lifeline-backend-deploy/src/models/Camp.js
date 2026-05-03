const mongoose = require("mongoose");

// Defines the stored structure for blood donation camp records.
const campSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    // Province and district support location-based filtering in the app.
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
    // Time fields are optional so camps can still be listed before exact slots are finalized.
    startTime: String,
    endTime: String,
    campStatus: {
      type: String,
      enum: ["UPCOMING", "ONGOING", "ENDED"],
      default: "UPCOMING"
    },
    // Tracks how many authenticated users expressed interest in the camp.
    interestedCount: {
      type: Number,
      default: 0
    }
  },
  {
    // Automatically stores createdAt and updatedAt timestamps.
    timestamps: true
  }
);

module.exports = mongoose.model("Camp", campSchema);
