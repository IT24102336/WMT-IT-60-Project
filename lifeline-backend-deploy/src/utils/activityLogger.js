const ActivityLog = require("../models/ActivityLog");

const logActivity = async (type, message, metadata = {}) => {
  await ActivityLog.create({
    type,
    message,
    metadata
  });
};

module.exports = logActivity;
