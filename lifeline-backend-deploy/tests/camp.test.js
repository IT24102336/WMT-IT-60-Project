const test = require("node:test");
const assert = require("node:assert/strict");

const { loadModuleWithMocks } = require("./helpers/moduleLoader");
const { invokeHandler, getFutureDate, toDateOnly } = require("./helpers/http");

test("createCamp rejects invalid Google Maps links", async () => {
  const controller = loadModuleWithMocks("./src/controllers/campController", {
    "../models/Camp": { create: async () => ({}) }
  });

  const { res, error } = await invokeHandler(controller.createCamp, {
    req: {
      body: {
        name: "Central Camp",
        province: "Western",
        district: "Colombo",
        googleMapLink: "https://example.com/location",
        date: toDateOnly(getFutureDate({ daysAhead: 1 }))
      }
    }
  });

  assert.equal(res.statusCode, 400);
  assert.equal(error.message, "Google Map link must be a Google Maps place link");
});

test("createCamp stores a valid camp payload", async () => {
  let createdPayload;

  const controller = loadModuleWithMocks("./src/controllers/campController", {
    "../models/Camp": {
      create: async (payload) => {
        createdPayload = payload;
        return {
          _id: "camp-1",
          interestedCount: 0,
          ...payload
        };
      }
    }
  });

  const { res, error } = await invokeHandler(controller.createCamp, {
    req: {
      body: {
        name: "Central Camp ",
        province: "Western",
        district: "Colombo",
        nearestHospital: "National Hospital",
        location: "Town Hall",
        address: "Main Street 100",
        googleMapLink: "https://www.google.com/maps/place/Colombo",
        date: toDateOnly(getFutureDate({ daysAhead: 2 })),
        startTime: "09:00",
        endTime: "14:00"
      }
    }
  });

  assert.equal(error, undefined);
  assert.equal(res.statusCode, 201);
  assert.equal(createdPayload.name, "Central Camp");
  assert.equal(res.body.campStatus, "UPCOMING");
});

test("markInterest increments the camp interested count", async () => {
  const camp = {
    _id: "camp-9",
    name: "Community Camp",
    province: "Western",
    district: "Gampaha",
    date: "2026-05-06",
    interestedCount: 2,
    save: async function save() {
      return this;
    }
  };

  const controller = loadModuleWithMocks("./src/controllers/campController", {
    "../models/Camp": {
      findById: async () => camp
    }
  });

  const { res, error } = await invokeHandler(controller.markInterest, {
    req: {
      params: { id: "camp-9" }
    }
  });

  assert.equal(error, undefined);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.interestCount, 3);
});
