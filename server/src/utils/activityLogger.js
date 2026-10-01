const Activity = require('../models/Activity');

/**
 * Log user drive activity in the background
 */
const logActivity = async ({ owner, action, itemType, itemName, itemId = null, details = {} }) => {
  try {
    if (!owner || !action || !itemName) return;
    await Activity.create({
      owner,
      action,
      itemType,
      itemName,
      itemId,
      details
    });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
};

module.exports = { logActivity };
