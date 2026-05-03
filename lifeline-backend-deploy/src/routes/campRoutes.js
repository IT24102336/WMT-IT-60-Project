const express = require("express");

// Camp controller handlers used by each API route.
const { getCamps, createCamp, updateCamp, deleteCamp, markInterest } = require("../controllers/campController");
// Authentication and role-based access control middleware.
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Public route to fetch all available camp records.
router.get("/", getCamps);
// Admin-only routes for managing camp data.
router.post("/create", protect, authorize("ADMIN"), createCamp);
router.put("/:id", protect, authorize("ADMIN"), updateCamp);
router.delete("/:id", protect, authorize("ADMIN"), deleteCamp);
// Authenticated users can register interest for a specific camp.
router.post("/:id/interest", protect, markInterest);

module.exports = router;
