const express = require("express");

const {
  bookAppointment,
  getAppointmentsForDonor,
  getAllAppointments,
  updateStatus,
  cancelAppointment
} = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/book", protect, bookAppointment);
router.get("/donor/:donorId", protect, getAppointmentsForDonor);
router.get("/", protect, authorize("ADMIN", "HOSPITAL"), getAllAppointments);
router.put("/:id/status", protect, authorize("ADMIN", "HOSPITAL"), updateStatus);
router.put("/:id/cancel", protect, cancelAppointment);

module.exports = router;
