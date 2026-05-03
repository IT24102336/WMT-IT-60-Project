const test = require("node:test");
const assert = require("node:assert/strict");

const { loadModuleWithMocks } = require("./helpers/moduleLoader");
const { invokeHandler } = require("./helpers/http");

test("createHospitalRequest validates the required fields", async () => {
  const controller = loadModuleWithMocks("./src/controllers/hospitalRequestController", {
    "../models/HospitalRequest": { create: async () => ({}) },
    "../models/Inventory": { find: () => ({ sort: async () => [] }) },
    "../utils/activityLogger": async () => {}
  });

  const { res, error } = await invokeHandler(controller.createHospitalRequest, {
    req: {
      body: {
        hospital: "City Hospital"
      }
    }
  });

  assert.equal(res.statusCode, 400);
  assert.equal(error.message, "bloodType and unitsRequested are required");
});

test("fulfillHospitalRequest dispatches available stock and marks the request fulfilled", async () => {
  const request = {
    _id: "request-1",
    bloodType: "A+",
    unitsRequested: 2,
    unitsFulfilled: 0,
    status: "OPEN",
    hospitalUserId: { name: "City Hospital" },
    save: async function save() {
      return this;
    }
  };

  const bags = [
    {
      quantity: 1,
      status: "AVAILABLE",
      save: async function save() {
        return this;
      }
    },
    {
      quantity: 1,
      status: "AVAILABLE",
      save: async function save() {
        return this;
      }
    }
  ];

  const controller = loadModuleWithMocks("./src/controllers/hospitalRequestController", {
    "../models/HospitalRequest": {
      create: async () => ({}),
      findById: () => ({
        populate: async () => request
      })
    },
    "../models/Inventory": {
      find: () => ({
        sort: async () => bags
      })
    },
    "../utils/activityLogger": async () => {}
  });

  const { res, error } = await invokeHandler(controller.fulfillHospitalRequest, {
    req: {
      params: { id: "request-1" },
      body: { units: 2 }
    }
  });

  assert.equal(error, undefined);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.unitsDispatched, 2);
  assert.equal(res.body.status, "FULFILLED");
  assert.equal(request.unitsFulfilled, 2);
  assert.equal(bags.every((bag) => bag.quantity === 0), true);
});

test("fulfillHospitalRequest rejects requests when no safe stock is available", async () => {
  const request = {
    _id: "request-2",
    bloodType: "O-",
    unitsRequested: 1,
    unitsFulfilled: 0,
    status: "OPEN",
    hospitalUserId: { name: "General Hospital" },
    save: async function save() {
      return this;
    }
  };

  const controller = loadModuleWithMocks("./src/controllers/hospitalRequestController", {
    "../models/HospitalRequest": {
      findById: () => ({
        populate: async () => request
      })
    },
    "../models/Inventory": {
      find: () => ({
        sort: async () => []
      })
    },
    "../utils/activityLogger": async () => {}
  });

  const { res, error } = await invokeHandler(controller.fulfillHospitalRequest, {
    req: {
      params: { id: "request-2" },
      body: { units: 1 }
    }
  });

  assert.equal(res.statusCode, 400);
  assert.match(error.message, /No safe O- units are currently available/);
});
