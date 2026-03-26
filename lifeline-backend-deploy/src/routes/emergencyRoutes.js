const express = require("express");

const { createEmergencyRequest, getAllRequests, fulfillRequest } = require("../controllers/emergencyController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/request", protect, authorize("HOSPITAL", "ADMIN"), createEmergencyRequest);
router.get("/requests/all", protect, authorize("ADMIN", "LAB"), getAllRequests);
router.put("/requests/:id/fulfill", protect, authorize("ADMIN", "LAB"), fulfillRequest);

module.exports = router;
