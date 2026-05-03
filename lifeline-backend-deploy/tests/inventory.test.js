const test = require("node:test");
const assert = require("node:assert/strict");

const { loadModuleWithMocks } = require("./helpers/moduleLoader");
const { invokeHandler } = require("./helpers/http");

test("addInventory requires bloodType and quantity", async () => {
  const controller = loadModuleWithMocks("./src/controllers/inventoryController", {
    "../models/Inventory": {
      create: async () => ({})
    },
    "../utils/activityLogger": async () => {}
  });

  const { res, error } = await invokeHandler(controller.addInventory, {
    req: {
      body: {
        donorName: "Saman"
      }
    }
  });

  assert.equal(res.statusCode, 400);
  assert.equal(error.message, "bloodType and quantity are required");
});

test("getInventoryDetails returns a detailed inventory item payload", async () => {
  const item = {
    _id: "inventory-1",
    bloodType: "B+",
    quantity: 2,
    donorName: "Saman",
    status: "AVAILABLE",
    safetyFlag: "SAFE",
    testStatus: "TESTED_SAFE",
    collectedAt: new Date("2026-05-03T08:00:00.000Z"),
    createdAt: new Date("2026-05-03T08:00:00.000Z"),
    updatedAt: new Date("2026-05-03T09:00:00.000Z"),
    labResults: []
  };

  const controller = loadModuleWithMocks("./src/controllers/inventoryController", {
    "../models/Inventory": {
      findById: async () => item
    },
    "../utils/activityLogger": async () => {}
  });

  const { res, error } = await invokeHandler(controller.getInventoryDetails, {
    req: {
      params: { id: "inventory-1" }
    }
  });

  assert.equal(error, undefined);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.id, "inventory-1");
  assert.deepEqual(res.body.allLabResults, []);
});

test("getLowStockAlerts returns only types with five units or fewer", async () => {
  const controller = loadModuleWithMocks("./src/controllers/inventoryController", {
    "../models/Inventory": {
      aggregate: async () => [
        { _id: "A+", totalUnits: 2 },
        { _id: "O+", totalUnits: 6 },
        { _id: "AB-", totalUnits: 5 }
      ]
    },
    "../utils/activityLogger": async () => {}
  });

  const { res, error } = await invokeHandler(controller.getLowStockAlerts, {
    req: {}
  });

  assert.equal(error, undefined);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.some((item) => item.bloodType === "O+"), false);
  assert.equal(res.body.find((item) => item.bloodType === "A+").level, "CRITICAL");
  assert.equal(res.body.find((item) => item.bloodType === "AB-").level, "LOW");
});
