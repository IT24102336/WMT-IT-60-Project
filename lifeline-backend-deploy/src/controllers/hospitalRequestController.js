const HospitalRequest = require("../models/HospitalRequest");
const Inventory = require("../models/Inventory");
const asyncHandler = require("../utils/asyncHandler");
const logActivity = require("../utils/activityLogger");

const createHospitalRequest = asyncHandler(async (req, res) => {
  const { hospitalUserId, hospital, bloodType, unitsRequested, priority, reason } = req.body;

  if (!bloodType || !unitsRequested) {
    res.status(400);
    throw new Error("bloodType and unitsRequested are required");
  }

  const request = await HospitalRequest.create({
    hospitalUserId,
    hospital,
    bloodType,
    unitsRequested,
    priority: priority || "NORMAL",
    reason
  });

  await logActivity(
    "HOSPITAL_REQUEST",
    `Hospital request created for ${bloodType}`,
    { requestId: request._id }
  );

  res.status(201).json(request);
});

const getHospitalRequests = asyncHandler(async (req, res) => {
  const requests = await HospitalRequest.find({})
    .populate("hospitalUserId", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json(
    requests.map((request) => ({
      id: request._id,
      hospitalUserId: request.hospitalUserId?._id || request.hospitalUserId,
      hospital: request.hospital || request.hospitalUserId?.name || "Hospital",
      bloodType: request.bloodType,
      unitsRequested: request.unitsRequested,
      unitsFulfilled: request.unitsFulfilled,
      priority: request.priority,
      urgency: request.priority === "HIGH" ? "HIGH" : "NORMAL",
      reason: request.reason,
      status: request.status,
      createdAt: request.createdAt
    }))
  );
});

const fulfillHospitalRequest = asyncHandler(async (req, res) => {
  const request = await HospitalRequest.findById(req.params.id).populate("hospitalUserId", "name");

  if (!request) {
    res.status(404);
    throw new Error("Hospital request not found");
  }

  const units = Number(req.body.units || 0);
  if (units <= 0) {
    res.status(400);
    throw new Error("units must be greater than zero");
  }

  const remainingUnits = Math.max(0, request.unitsRequested - request.unitsFulfilled);
  if (remainingUnits === 0) {
    res.status(400);
    throw new Error("Hospital request is already fulfilled");
  }

  const requestedUnits = Math.min(units, remainingUnits);
  const stockBags = await Inventory.find({
    bloodType: request.bloodType,
    quantity: { $gt: 0 },
    $or: [{ safetyFlag: "SAFE" }, { status: "AVAILABLE" }, { status: "SAFE" }]
  }).sort({ collectedAt: 1 });

  let unitsToDispatch = requestedUnits;
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

  const fulfilledNow = requestedUnits - unitsToDispatch;
  if (fulfilledNow <= 0) {
    res.status(400);
    throw new Error(`No safe ${request.bloodType} units are currently available for dispatch`);
  }

  request.unitsFulfilled += fulfilledNow;
  request.status = request.unitsFulfilled >= request.unitsRequested ? "FULFILLED" : "PARTIAL";
  await request.save();

  await logActivity(
    "HOSPITAL_REQUEST_FULFILLMENT",
    `Dispatched ${fulfilledNow} unit(s) for ${request.hospitalUserId?.name || "hospital request"}`,
    { requestId: request._id }
  );

  res.status(200).json({
    id: request._id,
    unitsDispatched: fulfilledNow,
    status: request.status
  });
});

module.exports = {
  createHospitalRequest,
  getHospitalRequests,
  fulfillHospitalRequest
};
