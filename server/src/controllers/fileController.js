const crypto = require('crypto');
const archiver = require('archiver');
const axios = require('axios');
const File = require('../models/File');
const Folder = require('../models/Folder');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { uploadToCloudinary } = require('../middlewares/uploadMiddleware');

// Safe archiver instance creator supporting all module formats
const createZipArchive = (options = { zlib: { level: 6 } }) => {
  if (typeof archiver === 'function') {
    return archiver('zip', options);
  }
  if (archiver && typeof archiver.default === 'function') {
    return archiver.default('zip', options);
  }
  if (archiver && archiver.ZipArchive) {
    return new archiver.ZipArchive(options);
  }
  if (archiver && typeof archiver.create === 'function') {
    return archiver.create('zip', options);
  }
  throw new Error('Archiver initialization failed');
};

// In-memory or temporary store for chunked uploads
const chunkUploadStore = new Map();

// @desc    Upload a file
// @route   POST /api/files/upload
// @access  Private
// @desc    Upload a file (with automatic version history if same name exists)
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

    // Check if a file with the same name already exists in this folder (version history feature)
    const existingFile = await File.findOne({
      name: req.file.originalname,
      folderId: cleanFolderId,
      owner: req.user._id,
      isTrashed: false
    });

    if (existingFile) {
      // Archive current version into versions array
      const previousVersion = {
        versionNumber: existingFile.currentVersion || 1,
        url: existingFile.url,
        publicId: existingFile.publicId,
        resourceType: existingFile.resourceType || 'auto',
        format: existingFile.format || '',
        size: existingFile.size,
        mimetype: existingFile.mimetype,
        uploadedAt: existingFile.updatedAt || existingFile.createdAt || new Date()
      };

      existingFile.versions.push(previousVersion);
      existingFile.currentVersion = (existingFile.currentVersion || 1) + 1;
      
      const sizeDifference = req.file.size - existingFile.size;

      existingFile.url = result.secure_url || result.url;
      existingFile.publicId = result.public_id;
      existingFile.resourceType = result.resource_type || 'auto';
      existingFile.format = result.format || '';
      existingFile.size = req.file.size;
      existingFile.mimetype = req.file.mimetype;

      await existingFile.save();

      // Update user storage usage difference
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { storageUsed: sizeDifference }
      });

      return res.status(200).json({
        success: true,
        message: `New version (v${existingFile.currentVersion}) created for "${req.file.originalname}"`,
        file: existingFile,
        isNewVersion: true
      });
    }

    // Create new File in DB
    const fileDoc = await File.create({
      name: req.file.originalname,
      url: result.secure_url || result.url,
      publicId: result.public_id,
      resourceType: result.resource_type || 'auto',
      format: result.format || '',
      size: req.file.size,
      mimetype: req.file.mimetype,
      folderId: cleanFolderId,
      owner: req.user._id,
      currentVersion: 1,
      versions: []
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

// @desc    Get all versions of a file
// @route   GET /api/files/:id/versions
// @access  Private
const getFileVersions = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    res.json({
      success: true,
      currentVersion: file.currentVersion || 1,
      currentFile: file,
      versions: file.versions || []
    });
  } catch (error) {
    console.error('Get file versions error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving file versions' });
  }
};

// @desc    Restore a previous version of a file
// @route   PUT /api/files/:id/restore-version/:versionNumber
// @access  Private
const restoreFileVersion = async (req, res) => {
  try {
    const targetVersionNum = parseInt(req.params.versionNumber);
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const versionToRestore = file.versions.find((v) => v.versionNumber === targetVersionNum);
    if (!versionToRestore) {
      return res.status(404).json({ success: false, message: 'Target version not found' });
    }

    // Save current state into versions array
    const archivedCurrent = {
      versionNumber: file.currentVersion || 1,
      url: file.url,
      publicId: file.publicId,
      resourceType: file.resourceType || 'auto',
      format: file.format || '',
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: file.updatedAt || new Date()
    };

    // Remove the chosen version from versions array
    file.versions = file.versions.filter((v) => v.versionNumber !== targetVersionNum);
    file.versions.push(archivedCurrent);

    const sizeDifference = versionToRestore.size - file.size;

    // Apply the restored version properties to current file
    file.url = versionToRestore.url;
    file.publicId = versionToRestore.publicId;
    file.resourceType = versionToRestore.resourceType || 'auto';
    file.format = versionToRestore.format || '';
    file.size = versionToRestore.size;
    file.mimetype = versionToRestore.mimetype;
    file.currentVersion = targetVersionNum;

    await file.save();

    if (sizeDifference !== 0) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { storageUsed: sizeDifference }
      });
    }

    res.json({
      success: true,
      message: `Restored version ${targetVersionNum} as current version`,
      file
    });
  } catch (error) {
    console.error('Restore file version error:', error);
    res.status(500).json({ success: false, message: 'Server error restoring file version' });
  }
};

// @desc    Delete a specific historical version
// @route   DELETE /api/files/:id/versions/:versionNumber
// @access  Private
const deleteFileVersion = async (req, res) => {
  try {
    const targetVersionNum = parseInt(req.params.versionNumber);
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const versionIndex = file.versions.findIndex((v) => v.versionNumber === targetVersionNum);
    if (versionIndex === -1) {
      return res.status(404).json({ success: false, message: 'Version not found in history' });
    }

    const [deletedVersion] = file.versions.splice(versionIndex, 1);
    await file.save();

    // Destroy on Cloudinary if not mock
    if (deletedVersion.publicId && !deletedVersion.publicId.startsWith('auradrive_demo_')) {
      try {
        await cloudinary.uploader.destroy(deletedVersion.publicId, {
          resource_type: deletedVersion.resourceType || 'raw'
        });
      } catch (err) {
        console.warn('Could not delete version from Cloudinary:', err.message);
      }
    }

    res.json({
      success: true,
      message: `Version ${targetVersionNum} deleted from history`,
      file
    });
  } catch (error) {
    console.error('Delete file version error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting file version' });
  }
};

// @desc    Update tags on a file
// @route   PUT /api/files/:id/tags
// @access  Private
const updateFileTags = async (req, res) => {
  try {
    const { tags } = req.body;
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    file.tags = Array.isArray(tags) ? tags : [];
    await file.save();

    res.json({
      success: true,
      message: 'Tags updated successfully',
      file
    });
  } catch (error) {
    console.error('Update file tags error:', error);
    res.status(500).json({ success: false, message: 'Server error updating tags' });
  }
};

// @desc    Bulk Tag items
// @route   POST /api/files/bulk-tag
// @access  Private
const bulkTag = async (req, res) => {
  try {
    const { fileIds = [], folderIds = [], tag, action = 'add' } = req.body;
    if (!tag || !tag.name) {
      return res.status(400).json({ success: false, message: 'Tag name is required' });
    }

    if (action === 'add') {
      if (fileIds.length > 0) {
        await File.updateMany(
          { _id: { $in: fileIds }, owner: req.user._id },
          { $addToSet: { tags: tag } }
        );
      }
      if (folderIds.length > 0) {
        await Folder.updateMany(
          { _id: { $in: folderIds }, owner: req.user._id },
          { $addToSet: { tags: tag } }
        );
      }
    } else {
      if (fileIds.length > 0) {
        await File.updateMany(
          { _id: { $in: fileIds }, owner: req.user._id },
          { $pull: { tags: { name: tag.name } } }
        );
      }
      if (folderIds.length > 0) {
        await Folder.updateMany(
          { _id: { $in: folderIds }, owner: req.user._id },
          { $pull: { tags: { name: tag.name } } }
        );
      }
    }

    res.json({
      success: true,
      message: action === 'add' ? 'Tag added to selected items' : 'Tag removed from selected items'
    });
  } catch (error) {
    console.error('Bulk tag error:', error);
    res.status(500).json({ success: false, message: 'Server error applying bulk tags' });
  }
};

// @desc    Bulk Star items
// @route   POST /api/files/bulk-star
// @access  Private
const bulkStar = async (req, res) => {
  try {
    const { fileIds = [], folderIds = [], isStarred = true } = req.body;

    if (fileIds.length > 0) {
      await File.updateMany(
        { _id: { $in: fileIds }, owner: req.user._id },
        { $set: { isStarred } }
      );
    }
    if (folderIds.length > 0) {
      await Folder.updateMany(
        { _id: { $in: folderIds }, owner: req.user._id },
        { $set: { isStarred } }
      );
    }

    res.json({
      success: true,
      message: isStarred ? 'Selected items added to Starred' : 'Selected items removed from Starred'
    });
  } catch (error) {
    console.error('Bulk star error:', error);
    res.status(500).json({ success: false, message: 'Server error updating bulk star' });
  }
};

// @desc    Bulk Trash or Restore items
// @route   POST /api/files/bulk-trash
// @access  Private
const bulkTrash = async (req, res) => {
  try {
    const { fileIds = [], folderIds = [], trash = true } = req.body;
    const isTrashed = Boolean(trash);
    const trashedAt = isTrashed ? new Date() : null;

    if (fileIds.length > 0) {
      await File.updateMany(
        { _id: { $in: fileIds }, owner: req.user._id },
        { $set: { isTrashed, trashedAt } }
      );
    }

    if (folderIds.length > 0) {
      // Also update nested files & folders
      for (const fId of folderIds) {
        await Folder.updateOne({ _id: fId, owner: req.user._id }, { $set: { isTrashed, trashedAt } });
        await Folder.updateMany({ 'path._id': fId, owner: req.user._id }, { $set: { isTrashed, trashedAt } });
        await File.updateMany({ folderId: fId, owner: req.user._id }, { $set: { isTrashed, trashedAt } });
      }
    }

    res.json({
      success: true,
      message: isTrashed ? 'Selected items moved to Trash' : 'Selected items restored from Trash'
    });
  } catch (error) {
    console.error('Bulk trash error:', error);
    res.status(500).json({ success: false, message: 'Server error moving items to trash' });
  }
};

// @desc    Bulk Delete permanently
// @route   POST /api/files/bulk-delete
// @access  Private
const bulkDelete = async (req, res) => {
  try {
    const { fileIds = [], folderIds = [] } = req.body;

    let allFolderIds = [...folderIds];
    if (folderIds.length > 0) {
      const childFolders = await Folder.find({ 'path._id': { $in: folderIds }, owner: req.user._id });
      allFolderIds = [...new Set([...allFolderIds, ...childFolders.map((f) => f._id)])];
    }

    // Find all files in these folders + direct fileIds
    const filesToDelete = await File.find({
      $or: [
        { _id: { $in: fileIds }, owner: req.user._id },
        { folderId: { $in: allFolderIds }, owner: req.user._id }
      ]
    });

    let totalStorageFreed = 0;
    for (const file of filesToDelete) {
      totalStorageFreed += file.size || 0;
      if (file.publicId && !file.publicId.startsWith('auradrive_demo_')) {
        try {
          await cloudinary.uploader.destroy(file.publicId, {
            resource_type: file.resourceType || 'raw'
          });
        } catch (cloudErr) {
          console.warn('Cloudinary delete error:', cloudErr.message);
        }
      }
    }

    if (filesToDelete.length > 0) {
      await File.deleteMany({ _id: { $in: filesToDelete.map((f) => f._id) } });
    }
    if (allFolderIds.length > 0) {
      await Folder.deleteMany({ _id: { $in: allFolderIds } });
    }

    if (totalStorageFreed > 0) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { storageUsed: -totalStorageFreed }
      });
    }

    res.json({
      success: true,
      message: 'Selected items permanently deleted'
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ success: false, message: 'Server error permanently deleting items' });
  }
};

// Helper: Recursively get all files in a folder structure
const getFolderContentsRecursively = async (folderId, userId, parentPath = '') => {
  const currentFolder = await Folder.findOne({ _id: folderId, owner: userId });
  if (!currentFolder) return [];

  const folderPath = parentPath ? `${parentPath}/${currentFolder.name}` : currentFolder.name;
  let allFiles = [];

  // Files in this folder
  const files = await File.find({ folderId: folderId, owner: userId, isTrashed: false });
  files.forEach((f) => {
    allFiles.push({ file: f, path: `${folderPath}/${f.name}` });
  });

  // Subfolders
  const subfolders = await Folder.find({ parentFolder: folderId, owner: userId, isTrashed: false });
  for (const sub of subfolders) {
    const subContents = await getFolderContentsRecursively(sub._id, userId, folderPath);
    allFiles = allFiles.concat(subContents);
  }

  return allFiles;
};

// @desc    Download selected files and folders as a ZIP archive
// @route   POST /api/files/download-zip
// @access  Private
const downloadZip = async (req, res) => {
  try {
    const { fileIds = [], folderIds = [] } = req.body;

    if (fileIds.length === 0 && folderIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one file or folder to download' });
    }

    let filesToZip = [];

    // Direct files
    if (fileIds.length > 0) {
      const files = await File.find({ _id: { $in: fileIds }, owner: req.user._id, isTrashed: false });
      files.forEach((f) => {
        filesToZip.push({ file: f, path: f.name });
      });
    }

    // Folder hierarchies
    if (folderIds.length > 0) {
      for (const fId of folderIds) {
        const folderContents = await getFolderContentsRecursively(fId, req.user._id);
        filesToZip = filesToZip.concat(folderContents);
      }
    }

    if (filesToZip.length === 0) {
      return res.status(404).json({ success: false, message: 'No downloadable files found in selection' });
    }

    const archiveName = `AuraDrive_${Date.now()}.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${archiveName}"`);

    const archive = createZipArchive({ zlib: { level: 6 } });
    archive.pipe(res);

    archive.on('error', (err) => {
      console.error('Archiver error:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Failed to create ZIP archive' });
      }
    });

    for (const item of filesToZip) {
      try {
        if (item.file.url && item.file.url.startsWith('http')) {
          const response = await axios.get(item.file.url, { responseType: 'stream', timeout: 20000 });
          archive.append(response.data, { name: item.path });
        }
      } catch (streamErr) {
        console.warn(`Could not stream file ${item.file.name} for zip:`, streamErr.message);
      }
    }

    await archive.finalize();
  } catch (error) {
    console.error('Download ZIP error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Server error generating zip archive' });
    }
  }
};

// @desc    Download single folder as ZIP
// @route   GET /api/folders/:id/download-zip
// @access  Private
const downloadFolderZip = async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, owner: req.user._id });
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    const filesToZip = await getFolderContentsRecursively(folder._id, req.user._id);
    const archiveName = `${folder.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${archiveName}"`);

    const archive = createZipArchive({ zlib: { level: 6 } });
    archive.pipe(res);

    archive.on('error', (err) => {
      console.error('Archiver error:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Failed to create ZIP archive' });
      }
    });

    for (const item of filesToZip) {
      try {
        if (item.file.url && item.file.url.startsWith('http')) {
          const response = await axios.get(item.file.url, { responseType: 'stream', timeout: 20000 });
          archive.append(response.data, { name: item.path });
        }
      } catch (streamErr) {
        console.warn(`Could not stream file ${item.file.name} for zip:`, streamErr.message);
      }
    }

    await archive.finalize();
  } catch (error) {
    console.error('Download folder ZIP error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Server error generating folder zip archive' });
    }
  }
};

// @desc    Upload chunk for large files
// @route   POST /api/files/chunk-upload
// @access  Private
const uploadChunk = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No chunk file received' });
    }

    const { uploadId, chunkIndex, totalChunks, originalName, mimetype, folderId } = req.body;
    const index = parseInt(chunkIndex);
    const total = parseInt(totalChunks);

    if (!uploadId || isNaN(index) || isNaN(total) || !originalName) {
      return res.status(400).json({ success: false, message: 'Missing chunk upload parameters' });
    }

    if (!chunkUploadStore.has(uploadId)) {
      chunkUploadStore.set(uploadId, {
        chunks: new Array(total),
        receivedCount: 0,
        createdAt: Date.now()
      });
    }

    const session = chunkUploadStore.get(uploadId);
    session.chunks[index] = req.file.buffer;
    session.receivedCount += 1;

    // Check if all chunks received
    if (session.receivedCount === total) {
      const fullBuffer = Buffer.concat(session.chunks);
      chunkUploadStore.delete(uploadId);

      const cleanFolderId = folderId && folderId !== 'root' && folderId !== 'null' && folderId !== 'undefined' ? folderId : null;

      // Upload reassembled buffer to Cloudinary
      const result = await uploadToCloudinary(fullBuffer, originalName, mimetype || 'application/octet-stream');

      // Check existing file for versioning
      const existingFile = await File.findOne({
        name: originalName,
        folderId: cleanFolderId,
        owner: req.user._id,
        isTrashed: false
      });

      if (existingFile) {
        const previousVersion = {
          versionNumber: existingFile.currentVersion || 1,
          url: existingFile.url,
          publicId: existingFile.publicId,
          resourceType: existingFile.resourceType || 'auto',
          format: existingFile.format || '',
          size: existingFile.size,
          mimetype: existingFile.mimetype,
          uploadedAt: existingFile.updatedAt || new Date()
        };

        existingFile.versions.push(previousVersion);
        existingFile.currentVersion = (existingFile.currentVersion || 1) + 1;
        
        const sizeDifference = fullBuffer.length - existingFile.size;

        existingFile.url = result.secure_url || result.url;
        existingFile.publicId = result.public_id;
        existingFile.resourceType = result.resource_type || 'auto';
        existingFile.format = result.format || '';
        existingFile.size = fullBuffer.length;
        existingFile.mimetype = mimetype || existingFile.mimetype;

        await existingFile.save();

        await User.findByIdAndUpdate(req.user._id, {
          $inc: { storageUsed: sizeDifference }
        });

        return res.status(200).json({
          success: true,
          isComplete: true,
          message: `Chunked upload completed. Version v${existingFile.currentVersion} created!`,
          file: existingFile
        });
      }

      const fileDoc = await File.create({
        name: originalName,
        url: result.secure_url || result.url,
        publicId: result.public_id,
        resourceType: result.resource_type || 'auto',
        format: result.format || '',
        size: fullBuffer.length,
        mimetype: mimetype || 'application/octet-stream',
        folderId: cleanFolderId,
        owner: req.user._id,
        currentVersion: 1,
        versions: []
      });

      await User.findByIdAndUpdate(req.user._id, {
        $inc: { storageUsed: fullBuffer.length }
      });

      return res.status(201).json({
        success: true,
        isComplete: true,
        message: 'Chunked upload reassembled & uploaded successfully!',
        file: fileDoc
      });
    }

    res.json({
      success: true,
      isComplete: false,
      chunkIndex: index,
      progress: Math.round((session.receivedCount / total) * 100)
    });
  } catch (error) {
    console.error('Chunk upload error:', error);
    res.status(500).json({ success: false, message: error.message || 'Chunk upload processing failed' });
  }
};

// @desc    Move file to another folder
// @route   PUT /api/files/:id/move
// @access  Private
const moveFile = async (req, res) => {
  try {
    const { targetFolderId } = req.body;
    const cleanFolderId = targetFolderId && targetFolderId !== 'root' && targetFolderId !== 'null' && targetFolderId !== 'undefined'
      ? targetFolderId
      : null;

    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (cleanFolderId) {
      const folder = await Folder.findOne({ _id: cleanFolderId, owner: req.user._id, isTrashed: false });
      if (!folder) {
        return res.status(404).json({ success: false, message: 'Destination folder not found' });
      }
    }

    file.folderId = cleanFolderId;
    await file.save();

    res.json({
      success: true,
      message: 'File moved successfully',
      file
    });
  } catch (error) {
    console.error('Move file error:', error);
    res.status(500).json({ success: false, message: 'Server error moving file' });
  }
};

// @desc    Bulk Move files and folders to a target folder
// @route   POST /api/files/bulk-move
// @access  Private
const bulkMove = async (req, res) => {
  try {
    const { fileIds = [], folderIds = [], targetFolderId } = req.body;
    const cleanFolderId = targetFolderId && targetFolderId !== 'root' && targetFolderId !== 'null' && targetFolderId !== 'undefined'
      ? targetFolderId
      : null;

    let targetFolder = null;
    if (cleanFolderId) {
      targetFolder = await Folder.findOne({ _id: cleanFolderId, owner: req.user._id, isTrashed: false });
      if (!targetFolder) {
        return res.status(404).json({ success: false, message: 'Target folder not found' });
      }
    }

    // Move files
    if (fileIds.length > 0) {
      await File.updateMany(
        { _id: { $in: fileIds }, owner: req.user._id },
        { $set: { folderId: cleanFolderId } }
      );
    }

    // Move folders (filtering out target folder and its subfolders to avoid circular loops)
    if (folderIds.length > 0) {
      for (const fId of folderIds) {
        if (cleanFolderId && fId === cleanFolderId) continue;

        const f = await Folder.findOne({ _id: fId, owner: req.user._id });
        if (!f) continue;

        let newPath = [];
        if (targetFolder) {
          newPath = [...(targetFolder.path || []), { _id: targetFolder._id, name: targetFolder.name }];
        }

        f.parentFolder = cleanFolderId;
        f.path = newPath;
        await f.save();

        // Update children path
        const children = await Folder.find({ 'path._id': f._id, owner: req.user._id });
        for (const child of children) {
          const indexInPath = child.path.findIndex((p) => p._id.toString() === f._id.toString());
          if (indexInPath !== -1) {
            const preservedTail = child.path.slice(indexInPath);
            child.path = [...newPath, ...preservedTail];
            await child.save();
          }
        }
      }
    }

    res.json({
      success: true,
      message: 'Selected items moved successfully'
    });
  } catch (error) {
    console.error('Bulk move error:', error);
    res.status(500).json({ success: false, message: 'Server error moving items' });
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
  getStorageStats,
  getFileVersions,
  restoreFileVersion,
  deleteFileVersion,
  updateFileTags,
  bulkTag,
  bulkStar,
  bulkTrash,
  bulkDelete,
  downloadZip,
  downloadFolderZip,
  uploadChunk,
  moveFile,
  bulkMove
};
