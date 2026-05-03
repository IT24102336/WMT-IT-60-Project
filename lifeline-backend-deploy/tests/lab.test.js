const test = require("node:test");
const assert = require("node:assert/strict");

const { loadModuleWithMocks } = require("./helpers/moduleLoader");
const { invokeHandler } = require("./helpers/http");

test("updateLabTest records a positive lab result and marks the bag unsafe", async () => {
  const item = {
    _id: "bag-1",
    testStatus: "PENDING",
    safetyFlag: "PENDING",
    status: "AVAILABLE",
    labResults: [],
    save: async function save() {
      return this;
    }
  };

  const controller = loadModuleWithMocks("./src/controllers/inventoryController", {
    "../models/Inventory": {
      findById: async () => item
    },
    "../utils/activityLogger": async () => {}
  });

  const { res, error } = await invokeHandler(controller.updateLabTest, {
    req: {
      params: { id: "bag-1" },
      body: {
        hiv: "true",
        hep: "false",
        malaria: "false",
        reason: "Reactive screening",
        testTechnician: "Lab Tech"
      },
      files: []
    }
  });

  assert.equal(error, undefined);
  assert.equal(res.statusCode, 200);
  assert.equal(item.testStatus, "TESTED_POSITIVE");
  assert.equal(item.safetyFlag, "BIO-HAZARD");
  assert.equal(item.status, "DISCARD");
  assert.deepEqual(res.body.labResult.positiveMarkers, ["HIV"]);
});

test("uploadLabTestFiles appends attachments to the latest result", async () => {
  const item = {
    _id: "bag-2",
    labResults: [
      {
        attachments: []
      }
    ],
    save: async function save() {
      return this;
    }
  };

  const controller = loadModuleWithMocks("./src/controllers/inventoryController", {
    "../models/Inventory": {
      findById: async () => item
    },
    "../utils/activityLogger": async () => {}
  });

  const { res, error } = await invokeHandler(controller.uploadLabTestFiles, {
    req: {
      params: { id: "bag-2" },
      files: [
        {
          filename: "report.pdf",
          originalname: "report.pdf",
          mimetype: "application/pdf",
          size: 1024
        }
      ]
    }
  });

  assert.equal(error, undefined);
  assert.equal(res.statusCode, 200);
  assert.equal(item.labResults[0].attachments.length, 1);
  assert.equal(res.body.attachments[0].fileUrl, "/uploads/report.pdf");
});

test("updateLabPositiveDetails stores marker details on the latest result", async () => {
  const item = {
    _id: "bag-3",
    labResults: [
      {
        hiv: true,
        attachments: []
      }
    ],
    save: async function save() {
      return this;
    }
  };

  const controller = loadModuleWithMocks("./src/controllers/inventoryController", {
    "../models/Inventory": {
      findById: async () => item
    },
    "../utils/activityLogger": async () => {}
  });

  const { res, error } = await invokeHandler(controller.updateLabPositiveDetails, {
    req: {
      params: { id: "bag-3" },
      body: {
        markerFound: ["HIV"],
        severity: "HIGH",
        notes: "Needs quarantine"
      }
    }
  });

  assert.equal(error, undefined);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(item.labResults[0].positiveDetails, {
    markerFound: ["HIV"],
    severity: "HIGH",
    notes: "Needs quarantine"
  });
  assert.equal(res.body.labResult.positiveDetails.severity, "HIGH");
});
