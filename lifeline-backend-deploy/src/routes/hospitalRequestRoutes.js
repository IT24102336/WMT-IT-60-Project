const express = require("express");

const {
  createHospitalRequest,
  getHospitalRequests,
  fulfillHospitalRequest
} = require("../controllers/hospitalRequestController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, authorize("HOSPITAL", "ADMIN"), createHospitalRequest);
router.get("/", protect, authorize("ADMIN", "LAB", "HOSPITAL"), getHospitalRequests);
router.put("/:id/fulfill", protect, authorize("ADMIN", "LAB"), fulfillHospitalRequest);

module.exports = router;
