require("dotenv").config();

const connectDB = require("../config/db");
const User = require("../models/User");
const Donor = require("../models/Donor");
const Hospital = require("../models/Hospital");
const Camp = require("../models/Camp");
const Inventory = require("../models/Inventory");
const ActivityLog = require("../models/ActivityLog");

const seed = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Donor.deleteMany({}),
    Hospital.deleteMany({}),
    Camp.deleteMany({}),
    Inventory.deleteMany({}),
    ActivityLog.deleteMany({})
  ]);

  const admin = await User.create({
    name: "LifeLine Admin",
    email: "admin@lifeline.com",
    password: "admin123",
    role: "ADMIN"
  });

  const donorUser = await User.create({
    name: "John Donor",
    email: "john@example.com",
    password: "pass123",
    role: "DONOR"
  });

  await Donor.create({
    user: donorUser._id,
    bloodType: "O+",
    province: "Western",
    district: "Colombo",
    nearestHospital: "National Hospital",
    safetyStatus: "SAFE"
  });

  await Hospital.insertMany([
    {
      name: "National Hospital",
      province: "Western",
      district: "Colombo",
      address: "Regent Street, Colombo",
      contactNumber: "0112345678",
      createdBy: admin._id
    },
    {
      name: "Teaching Hospital Kandy",
      province: "Central",
      district: "Kandy",
      address: "William Gopallawa Mawatha, Kandy",
      contactNumber: "0812233445",
      createdBy: admin._id
    }
  ]);

  await Camp.create({
    name: "University Blood Donation Camp",
    province: "Western",
    district: "Colombo",
    nearestHospital: "National Hospital",
    location: "University Main Hall",
    address: "Main Hall",
    googleMapLink: "https://maps.google.com",
    date: "2026-04-15",
    startTime: "09:00",
    endTime: "15:00",
    campStatus: "UPCOMING"
  });

  await Inventory.insertMany([
    {
      bloodType: "O+",
      quantity: 3,
      donorName: "John Donor",
      status: "AVAILABLE",
      safetyFlag: "SAFE",
      testStatus: "TESTED_SAFE"
    },
    {
      bloodType: "A+",
      quantity: 2,
      donorName: "Jane Perera",
      status: "AVAILABLE",
      safetyFlag: "PENDING",
      testStatus: "PENDING"
    }
  ]);

  console.log("Seed data inserted");
  process.exit(0);
};

seed().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});
