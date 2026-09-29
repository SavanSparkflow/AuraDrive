const crypto = require('crypto');
const File = require('../models/File');
const Folder = require('../models/Folder');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { uploadToCloudinary } = require('../middlewares/uploadMiddleware');

// @desc    Upload a file
// @route   POST /api/files/upload
// @access  Private
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach a file to upload' });
    }

    const { folderId } = req.body;
    const cleanFolderId = folderId && folderId !== 'root' && folderId !== 'null' && folderId !== 'undefined' ? folderId : null;

    // If folderId is provided, verify it exists and belongs to user
    if (cleanFolderId) {
      const folder = await Folder.findOne({ _id: cleanFolderId, owner: req.user._id, isTrashed: false });
      if (!folder) {
        return res.status(404).json({ success: false, message: 'Target folder not found' });
      }
    }

    // Upload file buffer to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, req.file.originalname, req.file.mimetype);

    // Create File in DB
    const fileDoc = await File.create({
      name: req.file.originalname,
      url: result.secure_url || result.url,
      publicId: result.public_id,
      resourceType: result.resource_type || 'auto',
      format: result.format || '',
      size: req.file.size,
      mimetype: req.file.mimetype,
      folderId: cleanFolderId,
      owner: req.user._id
    });

    // Update user storage usage
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { storageUsed: req.file.size }
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file: fileDoc
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during file upload' });
  }
};

// @desc    Get files in a specific folder or root
// @route   GET /api/files?folderId=...&type=...
// @access  Private
const getFiles = async (req, res) => {
  try {
    const folderId = req.query.folderId && req.query.folderId !== 'root' ? req.query.folderId : null;
    const isTrashed = req.query.trashed === 'true';
    const typeFilter = req.query.type; // image, video, document, audio

    let filter = {
      owner: req.user._id,
      isTrashed
    };

    if (!isTrashed) {
      filter.folderId = folderId;
    }

    if (typeFilter) {
      if (typeFilter === 'image') filter.mimetype = { $regex: /^image\//i };
      else if (typeFilter === 'video') filter.mimetype = { $regex: /^video\//i };
      else if (typeFilter === 'audio') filter.mimetype = { $regex: /^audio\//i };
      else if (typeFilter === 'document') {
        filter.mimetype = {
          $regex: /(pdf|word|sheet|presentation|text|csv|json|msword|document)/i
        };
      }
    }

    const files = await File.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      files
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving files' });
  }
};

// @desc    Get Starred items (files & folders)
// @route   GET /api/files/starred
// @access  Private
const getStarredItems = async (req, res) => {
  try {
    const files = await File.find({ owner: req.user._id, isStarred: true, isTrashed: false }).sort({ updatedAt: -1 });
    const folders = await Folder.find({ owner: req.user._id, isStarred: true, isTrashed: false }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      files,
      folders
    });
  } catch (error) {
    console.error('Get starred error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving starred items' });
  }
};

// @desc    Get Recent files
// @route   GET /api/files/recent
// @access  Private
const getRecentFiles = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const files = await File.find({ owner: req.user._id, isTrashed: false })
      .sort({ updatedAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      files
    });
  } catch (error) {
    console.error('Get recent error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving recent files' });
  }
};

// @desc    Get Trash items (files & folders)
// @route   GET /api/files/trash
// @access  Private
const getTrashItems = async (req, res) => {
  try {
    const files = await File.find({ owner: req.user._id, isTrashed: true }).sort({ trashedAt: -1 });
    const folders = await Folder.find({ owner: req.user._id, isTrashed: true }).sort({ trashedAt: -1 });

    res.json({
      success: true,
      files,
      folders
    });
  } catch (error) {
    console.error('Get trash error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving trash items' });
  }
};

// @desc    Global Search files and folders
// @route   GET /api/files/search?q=...
// @access  Private
const searchItems = async (req, res) => {
  try {
    const query = req.query.q || '';
    if (!query.trim()) {
      return res.json({ success: true, files: [], folders: [] });
    }

    const regex = new RegExp(query.trim(), 'i');

    const files = await File.find({
      owner: req.user._id,
      isTrashed: false,
      name: regex
    }).limit(20);

    const folders = await Folder.find({
      owner: req.user._id,
      isTrashed: false,
      name: regex
    }).limit(10);

    res.json({
      success: true,
      files,
      folders
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Server error searching items' });
  }
};

// @desc    Toggle Star on file
// @route   PUT /api/files/:id/star
// @access  Private
const toggleStarFile = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    file.isStarred = !file.isStarred;
    await file.save();

    res.json({
      success: true,
      message: file.isStarred ? 'Added file to starred' : 'Removed file from starred',
      file
    });
  } catch (error) {
    console.error('Star file error:', error);
    res.status(500).json({ success: false, message: 'Server error updating star status' });
  }
};

// @desc    Rename a file
// @route   PUT /api/files/:id/rename
// @access  Private
const renameFile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'New file name is required' });
    }

    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    file.name = name.trim();
    await file.save();

    res.json({
      success: true,
      message: 'File renamed successfully',
      file
    });
  } catch (error) {
    console.error('Rename file error:', error);
    res.status(500).json({ success: false, message: 'Server error renaming file' });
  }
};

// @desc    Move file to Trash or Restore
// @route   PUT /api/files/:id/trash
// @access  Private
const trashFile = async (req, res) => {
  try {
    const { trash } = req.body;
    const isTrashed = trash !== undefined ? Boolean(trash) : true;

    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    file.isTrashed = isTrashed;
    file.trashedAt = isTrashed ? new Date() : null;
    await file.save();

    res.json({
      success: true,
      message: isTrashed ? 'File moved to Trash' : 'File restored from Trash',
      file
    });
  } catch (error) {
    console.error('Trash file error:', error);
    res.status(500).json({ success: false, message: 'Server error trashing file' });
  }
};

// @desc    Generate/Toggle Public Share Link
// @route   PUT /api/files/:id/share
// @access  Private
const shareFile = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const { isPublic } = req.body;
    file.isPublic = isPublic !== undefined ? Boolean(isPublic) : !file.isPublic;

    if (file.isPublic) {
      if (!file.shareToken) {
        file.shareToken = crypto.randomBytes(16).toString('hex');
      }
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      file.shareLink = `${clientUrl}/share/${file.shareToken}`;
    } else {
      file.shareLink = null;
    }

    await file.save();

    res.json({
      success: true,
      message: file.isPublic ? 'Public share link generated' : 'Sharing turned off',
      file
    });
  } catch (error) {
    console.error('Share file error:', error);
    res.status(500).json({ success: false, message: 'Server error updating sharing' });
  }
};

// @desc    Get Public File by share token
// @route   GET /api/files/public/:shareToken
// @access  Public
const getPublicFile = async (req, res) => {
  try {
    const file = await File.findOne({
      shareToken: req.params.shareToken,
      isPublic: true,
      isTrashed: false
    }).populate('owner', 'name avatar');

    if (!file) {
      return res.status(404).json({ success: false, message: 'Shared file not found or link has expired' });
    }

    res.json({
      success: true,
      file
    });
  } catch (error) {
    console.error('Get public file error:', error);
    res.status(500).json({ success: false, message: 'Server error loading shared file' });
  }
};

// @desc    Permanently delete file
// @route   DELETE /api/files/:id
// @access  Private
const deleteFilePermanently = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Delete from Cloudinary if real publicId
    if (file.publicId && !file.publicId.startsWith('auradrive_demo_')) {
      try {
        await cloudinary.uploader.destroy(file.publicId, {
          resource_type: file.resourceType || 'raw'
        });
      } catch (cloudErr) {
        console.warn('Cloudinary delete error:', cloudErr.message);
      }
    }

    // Decrement user storage
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { storageUsed: -Math.min(file.size, 0) }
    });

    await File.findByIdAndDelete(file._id);

    res.json({
      success: true,
      message: 'File permanently deleted'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting file' });
  }
};

// @desc    Empty Trash (permanently delete all trashed files and folders)
// @route   DELETE /api/files/trash/empty
// @access  Private
const emptyTrash = async (req, res) => {
  try {
    const trashedFiles = await File.find({ owner: req.user._id, isTrashed: true });

    for (const file of trashedFiles) {
      if (file.publicId && !file.publicId.startsWith('auradrive_demo_')) {
        try {
          await cloudinary.uploader.destroy(file.publicId, {
            resource_type: file.resourceType || 'raw'
          });
        } catch (err) {
          console.warn('Cloudinary cleanup error:', file.publicId);
        }
      }
    }

    await File.deleteMany({ owner: req.user._id, isTrashed: true });
    await Folder.deleteMany({ owner: req.user._id, isTrashed: true });

    res.json({
      success: true,
      message: 'Trash emptied successfully'
    });
  } catch (error) {
    console.error('Empty trash error:', error);
    res.status(500).json({ success: false, message: 'Server error emptying trash' });
  }
};

// @desc    Get storage breakdown stats
// @route   GET /api/files/storage-stats
// @access  Private
const getStorageStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const files = await File.find({ owner: req.user._id, isTrashed: false });

    let imagesSize = 0;
    let videosSize = 0;
    let docsSize = 0;
    let audioSize = 0;
    let othersSize = 0;

    files.forEach((f) => {
      const mime = f.mimetype.toLowerCase();
      if (mime.startsWith('image/')) imagesSize += f.size;
      else if (mime.startsWith('video/')) videosSize += f.size;
      else if (mime.startsWith('audio/')) audioSize += f.size;
      else if (mime.match(/(pdf|word|sheet|presentation|text|csv|json|document)/)) docsSize += f.size;
      else othersSize += f.size;
    });

    const totalUsed = imagesSize + videosSize + docsSize + audioSize + othersSize;

    res.json({
      success: true,
      stats: {
        totalUsed,
        storageLimit: user.storageLimit || 15 * 1024 * 1024 * 1024,
        images: imagesSize,
        videos: videosSize,
        documents: docsSize,
        audio: audioSize,
        others: othersSize,
        fileCount: files.length
      }
    });
  } catch (error) {
    console.error('Storage stats error:', error);
    res.status(500).json({ success: false, message: 'Server error calculating storage stats' });
  }
};

module.exports = {
  uploadFile,
  getFiles,
  getStarredItems,
  getRecentFiles,
  getTrashItems,
  searchItems,
  toggleStarFile,
  renameFile,
  trashFile,
  shareFile,
  getPublicFile,
  deleteFilePermanently,
  emptyTrash,
  getStorageStats
};
