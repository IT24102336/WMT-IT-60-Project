const test = require("node:test");
const assert = require("node:assert/strict");

const { loadModuleWithMocks } = require("./helpers/moduleLoader");
const { invokeHandler, getFutureDate, toDateOnly } = require("./helpers/http");

test("bookAppointment rejects requests missing required fields", async () => {
  const controller = loadModuleWithMocks("./src/controllers/appointmentController", {
    "../models/Appointment": { create: async () => ({}) },
    "../models/Camp": {},
    "../models/Donor": { findOne: async () => null, findByIdAndUpdate: async () => ({}) },
    "../models/Inventory": { create: async () => ({}) },
    "../utils/activityLogger": async () => {},
    "./donorController": { buildEligibility: () => ({ eligible: true }) }
  });

  const { res, error } = await invokeHandler(controller.bookAppointment, {
    req: {
      body: {},
      user: { _id: "user-1", role: "DONOR", name: "Nimal" }
    }
  });

  assert.equal(res.statusCode, 400);
  assert.equal(error.message, "donorUserId, hospitalId, centerName, and date are required");
});

test("bookAppointment creates a hospital appointment for an eligible donor", async () => {
  const captured = {};
  const appointmentDate = getFutureDate({ daysAhead: 1, hour: 9, minute: 30, weekdayOnly: true });
  const localAppointmentDateTime = `${toDateOnly(appointmentDate)}T09:30:00`;

  const controller = loadModuleWithMocks("./src/controllers/appointmentController", {
    "../models/Appointment": {
      create: async (payload) => {
        captured.payload = payload;
        return {
          _id: "appointment-1",
          status: "Scheduled",
          ...payload
        };
      }
    },
    "../models/Camp": { findById: async () => null },
    "../models/Donor": {
      findOne: async () => ({ _id: "donor-1", user: "user-1" }),
      findByIdAndUpdate: async () => ({})
    },
    "../models/Inventory": { create: async () => ({}) },
    "../utils/activityLogger": async () => {},
    "./donorController": { buildEligibility: () => ({ eligible: true }) }
  });

  const { res, error } = await invokeHandler(controller.bookAppointment, {
    req: {
      body: {
        donorUserId: "user-1",
        hospitalId: "hospital-1",
        centerName: "National Blood Bank",
        date: localAppointmentDateTime,
        bloodType: "A+",
        recentTravel: true
      },
      user: { _id: "user-1", role: "DONOR", name: "Nimal" }
    }
  });

  assert.equal(error, undefined);
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.centerType, "HOSPITAL");
  assert.equal(res.body.donorName, "Nimal");
  assert.equal(captured.payload.questionnaire.recentTravel, true);
  assert.equal(captured.payload.questionnaire.takingMedications, false);
});

test("updateStatus creates inventory when an appointment is completed", async () => {
  const appointment = {
    _id: "appointment-2",
    donor: "donor-77",
    donorName: "Kamal",
    donorUserId: "user-2",
    bloodType: "O+",
    date: new Date(),
    status: "Scheduled",
    save: async function save() {
      return this;
    }
  };

  let inventoryCreated = false;
  let donorUpdated = false;

  const controller = loadModuleWithMocks("./src/controllers/appointmentController", {
    "../models/Appointment": { findById: async () => appointment },
    "../models/Camp": {},
    "../models/Donor": {
      findOne: async () => null,
      findByIdAndUpdate: async () => {
        donorUpdated = true;
      }
    },
    "../models/Inventory": {
      create: async (payload) => {
        inventoryCreated = payload.status === "AVAILABLE" && payload.testStatus === "PENDING";
      }
    },
    "../utils/activityLogger": async () => {},
    "./donorController": { buildEligibility: () => ({ eligible: true }) }
  });

  const { res, error } = await invokeHandler(controller.updateStatus, {
    req: {
      params: { id: "appointment-2" },
      body: { status: "Completed" }
    }
  });

  assert.equal(error, undefined);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, "Completed");
  assert.equal(inventoryCreated, true);
  assert.equal(donorUpdated, true);
});
