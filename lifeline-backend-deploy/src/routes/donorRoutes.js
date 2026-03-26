const express = require("express");

const { getEligibility, getDonorByUserId, healthCheck } = require("../controllers/donorController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:id/eligibility", protect, getEligibility);
router.get("/user/:userId", protect, getDonorByUserId);
router.post("/health-check", protect, healthCheck);

module.exports = router;
