const Appointment = require("../models/Appointment");
const Donor = require("../models/Donor");
const Inventory = require("../models/Inventory");
const asyncHandler = require("../utils/asyncHandler");
const { buildEligibility } = require("./donorController");
const logActivity = require("../utils/activityLogger");
const { serializeAppointment } = require("../utils/serializers");

const bookAppointment = asyncHandler(async (req, res) => {
  const {
    donorId,
    donorUserId,
    donorName,
    hospitalId,
    centerType,
    centerName,
    date,
    bloodType,
    hasDiagnosedDiseases,
    takingMedications,
    recentSurgery,
    recentTravel
  } = req.body;

  if (!donorUserId || !hospitalId || !centerName || !date) {
    res.status(400);
    throw new Error("donorUserId, hospitalId, centerName, and date are required");
  }

  if (String(req.user._id) !== String(donorUserId) && req.user.role !== "ADMIN" && req.user.role !== "HOSPITAL") {
    res.status(403);
    throw new Error("You cannot book appointments for another user");
  }

  const donor = await Donor.findOne({ user: donorUserId });
  const eligibility = buildEligibility(donor);
  if (!eligibility.eligible) {
    res.status(400);
    throw new Error(eligibility.reason);
  }

  const appointment = await Appointment.create({
    donor: donor ? donor._id : donorId,
    donorUserId,
    donorName: donorName || req.user.name,
    hospitalId: String(hospitalId),
    centerType: centerType || "HOSPITAL",
    centerName,
    bloodType,
    date: new Date(date),
    questionnaire: {
      hasDiagnosedDiseases: Boolean(hasDiagnosedDiseases),
      takingMedications: Boolean(takingMedications),
      recentSurgery: Boolean(recentSurgery),
      recentTravel: Boolean(recentTravel)
    }
  });

  await logActivity("APPOINTMENT_BOOKED", `Appointment booked for ${centerName}`, {
    appointmentId: appointment._id,
    donorUserId
  });

  res.status(201).json(serializeAppointment(appointment));
});

const getAppointmentsForDonor = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ donorUserId: req.params.donorId }).sort({ date: -1 });
  res.status(200).json(appointments.map(serializeAppointment));
});

const getAllAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({}).sort({ date: -1 });
  res.status(200).json(appointments.map(serializeAppointment));
});

const updateStatus = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  const previousStatus = appointment.status;
  appointment.status = req.body.status || appointment.status;
  await appointment.save();

  if (appointment.status === "Completed" && previousStatus !== "Completed") {
    await Inventory.create({
      bloodType: appointment.bloodType || "UNKNOWN",
      quantity: 1,
      donorName: appointment.donorName,
      status: "AVAILABLE",
      safetyFlag: "PENDING",
      testStatus: "PENDING"
    });

    if (appointment.donor) {
      await Donor.findByIdAndUpdate(appointment.donor, {
        lastDonationDate: appointment.date
      });
    }

    await logActivity("APPOINTMENT_COMPLETED", `Donation completed for ${appointment.donorName}`, {
      appointmentId: appointment._id
    });
  } else {
    await logActivity("APPOINTMENT_STATUS", `Appointment status changed to ${appointment.status}`, {
      appointmentId: appointment._id
    });
  }

  res.status(200).json(serializeAppointment(appointment));
});

const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  const isOwner = String(appointment.donorUserId) === String(req.user._id);
  if (!isOwner && req.user.role !== "ADMIN" && req.user.role !== "HOSPITAL") {
    res.status(403);
    throw new Error("You cannot cancel this appointment");
  }

  appointment.status = "Cancelled";
  await appointment.save();

  await logActivity("APPOINTMENT_CANCELLED", `Appointment cancelled by ${req.user.name}`, {
    appointmentId: appointment._id
  });

  res.status(200).json({
    success: true,
    appointment: serializeAppointment(appointment)
  });
});

module.exports = {
  bookAppointment,
  getAppointmentsForDonor,
  getAllAppointments,
  updateStatus,
  cancelAppointment
};
