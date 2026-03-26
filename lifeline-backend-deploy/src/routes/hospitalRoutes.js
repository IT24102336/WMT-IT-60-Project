const express = require("express");

const {
  getHospitals,
  createHospital,
  getHospitalById,
  updateHospital,
  deleteHospital
} = require("../controllers/hospitalController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getHospitals);
router.get("/:id", getHospitalById);
router.post("/", protect, authorize("ADMIN"), upload.single("image"), createHospital);
router.put("/:id", protect, authorize("ADMIN"), upload.single("image"), updateHospital);
router.delete("/:id", protect, authorize("ADMIN"), deleteHospital);

module.exports = router;
