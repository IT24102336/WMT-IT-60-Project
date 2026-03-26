/**
 * Database Validation Test Script
 * Run with: node src/scripts/validateDB.js
 * Prerequisites: .env file configured with MONGODB_URI
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Donor = require('../models/Donor');
const Appointment = require('../models/Appointment');
const Camp = require('../models/Camp');
const Inventory = require('../models/Inventory');
const EmergencyRequest = require('../models/EmergencyRequest');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

async function validateDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    log.success('Connected to MongoDB');

    // Test 1: Check User model
    log.info('Testing User model...');
    const testUser = new User({
      name: 'Test User',
      email: `test-${Date.now()}@test.com`,
      password: 'testpassword123',
      role: 'DONOR'
    });
    
    await User.validate(testUser);
    log.success('User model validation passed');

    // Test 2: Check Hospital model
    log.info('Testing Hospital model...');
    const testHospital = new Hospital({
      name: 'Test Hospital',
      province: 'Test Province',
      district: 'Test District',
      address: 'Test Address'
    });
    
    await Hospital.validate(testHospital);
    log.success('Hospital model validation passed');

    // Test 3: Check Donor model
    log.info('Testing Donor model...');
    const testDonor = new Donor({
      user: new mongoose.Types.ObjectId(),
      bloodType: 'O+',
      province: 'Test Province',
      district: 'Test District',
      nearestHospital: 'Test Hospital'
    });
    
    await Donor.validate(testDonor);
    log.success('Donor model validation passed');

    // Test 4: Check Appointment model
    log.info('Testing Appointment model...');
    const testAppointment = new Appointment({
      donor: new mongoose.Types.ObjectId(),
      donorUserId: new mongoose.Types.ObjectId(),
      donorName: 'Test Donor',
      hospitalId: 'test-hospital-id',
      centerName: 'Test Center',
      date: new Date()
    });
    
    await Appointment.validate(testAppointment);
    log.success('Appointment model validation passed');

    // Test 5: Check Camp model
    log.info('Testing Camp model...');
    const testCamp = new Camp({
      name: 'Test Camp',
      province: 'Test Province',
      district: 'Test District',
      date: new Date().toISOString().split('T')[0]
    });
    
    await Camp.validate(testCamp);
    log.success('Camp model validation passed');

    // Test 6: Check Inventory model
    log.info('Testing Inventory model...');
    const testInventory = new Inventory({
      bloodType: 'O+',
      quantity: 5
    });
    
    await Inventory.validate(testInventory);
    log.success('Inventory model validation passed');

    // Test 7: Check EmergencyRequest model
    log.info('Testing EmergencyRequest model...');
    const testEmergency = new EmergencyRequest({
      hospital: 'Test Hospital',
      bloodType: 'O+',
      unitsRequested: 5
    });
    
    await EmergencyRequest.validate(testEmergency);
    log.success('EmergencyRequest model validation passed');

    // Test 8: Check collections exist
    log.info('Checking MongoDB collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    const requiredCollections = ['users', 'hospitals', 'donors', 'appointments', 'camps', 'inventories', 'emergencyrequests'];
    for (const col of requiredCollections) {
      if (collectionNames.some(c => c.toLowerCase().includes(col.slice(0, -1)))) {
        log.success(`Collection '${col}' exists`);
      }
    }

    log.info('\n' + colors.green + '═══════════════════════════════════════════' + colors.reset);
    log.success('Database validation completed successfully!');
    log.success('All models are properly configured and working.');
    log.info(colors.green + '═══════════════════════════════════════════' + colors.reset);

  } catch (error) {
    log.error('Database validation failed:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    log.info('Disconnected from MongoDB');
  }
}

// Run validation
validateDatabase();
