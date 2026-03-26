const express = require("express");

const { getCamps, createCamp, deleteCamp, markInterest } = require("../controllers/campController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getCamps);
router.post("/create", protect, authorize("ADMIN"), createCamp);
router.delete("/:id", protect, authorize("ADMIN"), deleteCamp);
router.post("/:id/interest", protect, markInterest);

module.exports = router;
