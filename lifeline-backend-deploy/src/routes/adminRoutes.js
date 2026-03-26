const express = require("express");

const { getUsers, createUser, updateUserRole } = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorize("ADMIN"), getUsers);
router.post("/", protect, authorize("ADMIN"), createUser);
router.put("/:userId/role", protect, authorize("ADMIN"), updateUserRole);

module.exports = router;
