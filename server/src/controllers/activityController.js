const Activity = require('../models/Activity');
const File = require('../models/File');
const Folder = require('../models/Folder');

// @desc    Get user activity logs with pagination (with automatic backfill for existing files if empty)
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    let total = await Activity.countDocuments({ owner: req.user._id });

    // If no activities logged yet, automatically backfill from recent files and folders
    if (total === 0) {
      const [existingFiles, existingFolders] = await Promise.all([
        File.find({ owner: req.user._id, isTrashed: false }).sort({ createdAt: -1 }).limit(20),
        Folder.find({ owner: req.user._id, isTrashed: false }).sort({ createdAt: -1 }).limit(10)
      ]);

      const initialActivities = [];

      for (const file of existingFiles) {
        initialActivities.push({
          owner: req.user._id,
          action: 'upload',
          itemType: 'file',
          itemName: file.name,
          itemId: file._id,
          createdAt: file.createdAt || new Date()
        });
      }

      for (const folder of existingFolders) {
        initialActivities.push({
          owner: req.user._id,
          action: 'create_folder',
          itemType: 'folder',
          itemName: folder.name,
          itemId: folder._id,
          createdAt: folder.createdAt || new Date()
        });
      }

      if (initialActivities.length > 0) {
        await Activity.insertMany(initialActivities);
        total = initialActivities.length;
      }
    }

    const activities = await Activity.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      activities,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving activity logs' });
  }
};

// @desc    Clear activity logs
// @route   DELETE /api/activities
// @access  Private
const clearActivities = async (req, res) => {
  try {
    await Activity.deleteMany({ owner: req.user._id });
    res.json({ success: true, message: 'Activity logs cleared' });
  } catch (error) {
    console.error('Clear activities error:', error);
    res.status(500).json({ success: false, message: 'Server error clearing activity logs' });
  }
};

module.exports = {
  getActivities,
  clearActivities
};
