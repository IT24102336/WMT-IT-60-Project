const ActivityLog = require("../models/ActivityLog");
const asyncHandler = require("../utils/asyncHandler");

const getRecentActivity = asyncHandler(async (req, res) => {
  const activity = await ActivityLog.find({}).sort({ createdAt: -1 }).limit(20);
  res.status(200).json(
    activity.map((entry) => ({
      id: entry._id,
      activityType: entry.type,
      description: entry.message,
      timestamp: entry.createdAt,
      type: entry.type,
      message: entry.message,
      createdAt: entry.createdAt
    }))
  );
});

module.exports = {
  getRecentActivity
};
