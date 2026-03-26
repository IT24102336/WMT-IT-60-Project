const User = require("../models/User");
const Donor = require("../models/Donor");
const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");

const buildAuthResponse = (user, token) => ({
  token,
  userId: user._id,
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, bloodType, province, district, nearestHospital } = req.body;

  if (!fullName || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required");
  }

  if (!province || !district) {
    res.status(400);
    throw new Error("Province and district are required");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(409);
    throw new Error("Email is already registered");
  }

  const user = await User.create({
    name: fullName.trim(),
    email: email.trim().toLowerCase(),
    password,
    role: "DONOR"
  });

  // Create donor with validated hospital
  const donorData = {
    user: user._id,
    bloodType: bloodType || "UNKNOWN",
    province: province.trim(),
    district: district.trim(),
    nearestHospital: nearestHospital ? nearestHospital.trim() : ""
  };

  await Donor.create(donorData);

  const token = generateToken(user._id);
  res.status(201).json(buildAuthResponse(user, token));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user._id);
  res.status(200).json(buildAuthResponse(user, token));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    userId: req.user._id,
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role
  });
});

const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logout handled on client by removing JWT"
  });
});

module.exports = {
  register,
  login,
  getCurrentUser,
  logout
};
