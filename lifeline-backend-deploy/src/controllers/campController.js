const Camp = require("../models/Camp");
const asyncHandler = require("../utils/asyncHandler");
const { serializeCamp } = require("../utils/serializers");

// Returns all camps sorted by date so the client can display the upcoming list consistently.
const getCamps = asyncHandler(async (req, res) => {
  const camps = await Camp.find({}).sort({ date: 1 });
  res.status(200).json(camps.map(serializeCamp));
});

// Creates a new camp after checking the minimum required fields.
const createCamp = asyncHandler(async (req, res) => {
  const { name, province, district, nearestHospital, location, address, googleMapLink, date, startTime, endTime, campStatus } = req.body;

  if (!name || !province || !district || !date) {
    res.status(400);
    throw new Error("Name, province, district, and date are required");
  }

  const camp = await Camp.create({
    name,
    province,
    district,
    nearestHospital,
    location,
    address,
    googleMapLink,
    date,
    startTime,
    endTime,
    campStatus: campStatus || "UPCOMING"
  });

  res.status(201).json(serializeCamp(camp));
});

// Updates an existing camp record with the values sent by the admin panel.
const updateCamp = asyncHandler(async (req, res) => {
  const { name, province, district, nearestHospital, location, address, googleMapLink, date, startTime, endTime, campStatus } = req.body;

  if (!name || !province || !district || !date) {
    res.status(400);
    throw new Error("Name, province, district, and date are required");
  }

  const camp = await Camp.findById(req.params.id);

  if (!camp) {
    res.status(404);
    throw new Error("Camp not found");
  }

  camp.name = name;
  camp.province = province;
  camp.district = district;
  camp.nearestHospital = nearestHospital;
  camp.location = location;
  camp.address = address;
  camp.googleMapLink = googleMapLink;
  camp.date = date;
  camp.startTime = startTime;
  camp.endTime = endTime;
  camp.campStatus = campStatus || "UPCOMING";

  await camp.save();

  res.status(200).json(serializeCamp(camp));
});

// Deletes a camp once the target record has been confirmed to exist.
const deleteCamp = asyncHandler(async (req, res) => {
  const camp = await Camp.findById(req.params.id);

  if (!camp) {
    res.status(404);
    throw new Error("Camp not found");
  }

  await camp.deleteOne();
  res.status(200).json({
    success: true,
    message: "Camp deleted successfully"
  });
});

// Increments the visible interest counter for a camp.
const markInterest = asyncHandler(async (req, res) => {
  const camp = await Camp.findById(req.params.id);

  if (!camp) {
    res.status(404);
    throw new Error("Camp not found");
  }

  camp.interestedCount += 1;
  await camp.save();

  res.status(200).json(serializeCamp(camp));
});

module.exports = {
  getCamps,
  createCamp,
  updateCamp,
  deleteCamp,
  markInterest
};
