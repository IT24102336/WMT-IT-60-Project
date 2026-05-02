const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donor",
      required: true
    },
    donorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    donorName: {
      type: String,
      required: true
    },
    hospitalId: {
      type: String,
      required: true
    },
    centerType: {
      type: String,
      enum: ["HOSPITAL", "CAMP"],
      default: "HOSPITAL"
    },
    centerName: {
      type: String,
      required: true
    },
    bloodType: String,
    date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled", "Approved", "Rejected"],
      default: "Scheduled"
    },
    questionnaire: {
      hasDiagnosedDiseases: {
        type: Boolean,
        default: false
      },
      takingMedications: {
        type: Boolean,
        default: false
      },
      recentSurgery: {
        type: Boolean,
        default: false
      },
      recentTravel: {
        type: Boolean,
        default: false
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
