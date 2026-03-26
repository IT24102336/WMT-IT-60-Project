const EmergencyRequest = require("../models/EmergencyRequest");
const Inventory = require("../models/Inventory");
const asyncHandler = require("../utils/asyncHandler");
const logActivity = require("../utils/activityLogger");

const createEmergencyRequest = asyncHandler(async (req, res) => {
  const { bloodType, units, hospital, urgency, reason, hospitalUserId } = req.body;

  if (!bloodType || !units || !hospital) {
    res.status(400);
    throw new Error("bloodType, units, and hospital are required");
  }

  const emergencyRequest = await EmergencyRequest.create({
    hospitalUserId,
    bloodType,
    unitsRequested: units,
    hospital,
    urgency: urgency || "NORMAL",
    reason
  });

  const broadcastTriggered = String(urgency || "").toUpperCase() === "CRITICAL";
  await logActivity(
    "EMERGENCY_REQUEST",
    `${broadcastTriggered ? "Critical" : "Normal"} request created for ${bloodType}`,
    { requestId: emergencyRequest._id, hospital }
  );

  res.status(201).json({
    id: emergencyRequest._id,
    broadcastTriggered,
    message: broadcastTriggered
      ? `Emergency alert created for ${hospital}.`
      : `Request submitted for ${hospital}.`
  });
});

const getAllRequests = asyncHandler(async (req, res) => {
  const requests = await EmergencyRequest.find({}).sort({ createdAt: -1 });
  res.status(200).json(
    requests.map((request) => ({
      id: request._id,
      hospital: request.hospital,
      bloodType: request.bloodType,
      urgency: request.urgency,
      reason: request.reason,
      status: request.status,
      unitsRequested: request.unitsRequested,
      unitsFulfilled: request.unitsFulfilled,
      createdAt: request.createdAt
    }))
  );
});

const fulfillRequest = asyncHandler(async (req, res) => {
  const request = await EmergencyRequest.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error("Emergency request not found");
  }

  const units = Number(req.body.units || 0);
  if (units <= 0) {
    res.status(400);
    throw new Error("units must be greater than zero");
  }

  const stockBags = await Inventory.find({
    bloodType: request.bloodType,
    quantity: { $gt: 0 },
    $or: [{ safetyFlag: "SAFE" }, { status: "AVAILABLE" }, { status: "SAFE" }]
  }).sort({ collectedAt: 1 });

  let unitsToDispatch = units;
  for (const bag of stockBags) {
    if (unitsToDispatch <= 0) {
      break;
    }

    const dispatchable = Math.min(unitsToDispatch, bag.quantity);
    bag.quantity -= dispatchable;
    if (bag.quantity === 0) {
      bag.status = "DISPATCHED";
    }
    await bag.save();
    unitsToDispatch -= dispatchable;
  }

  const fulfilledNow = units - unitsToDispatch;
  if (fulfilledNow <= 0) {
    res.status(400);
    throw new Error(`No safe ${request.bloodType} units are currently available for dispatch`);
  }

  request.unitsFulfilled += fulfilledNow;
  request.status = request.unitsFulfilled >= request.unitsRequested ? "FULFILLED" : "PARTIAL";
  await request.save();

  await logActivity(
    "EMERGENCY_FULFILLMENT",
    `Dispatched ${fulfilledNow} unit(s) for ${request.hospital}`,
    { requestId: request._id }
  );

  res.status(200).json({
    id: request._id,
    unitsDispatched: fulfilledNow,
    status: request.status
  });
});

module.exports = {
  createEmergencyRequest,
  getAllRequests,
  fulfillRequest
};
